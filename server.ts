import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { connectToDatabase } from "./lib/mongodb";
import { trackUserSocket, removeUserSocket, getUserSocketCount } from "./lib/redis";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "chatflow_super_secret_jwt_key_development_2026";
const AUTH_COOKIE_NAME = "chatflow_session";

const prisma = new PrismaClient();
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Map of userId -> Set of socket IDs (in-memory + Redis presence sync)
const onlineUsers = new Map<string, Set<string>>();

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

app.prepare().then(async () => {
  // 1. Initialize MongoDB Connection Pool & Compound Indexes
  try {
    await connectToDatabase();
    console.log("✔ MongoDB Primary Database connection initialized.");
  } catch (err: any) {
    console.warn("MongoDB connection warning:", err?.message || err);
  }

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("HTTP error occurred:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 15000,
    pingTimeout: 30000,
  });

  // Expose io instance globally for API routes
  (globalThis as any).io = io;

  // Socket Authentication Middleware
  io.use((socket: Socket, nextMiddleware) => {
    try {
      let token: string | null = null;

      // 1. Auth header or query token
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers.authorization;
      if (authHeader) {
        token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
      }

      // 2. Cookie token
      if (!token) {
        const cookieHeader = socket.handshake.headers.cookie;
        token = parseCookie(cookieHeader, AUTH_COOKIE_NAME);
      }

      if (!token) {
        // Allow connection in anonymous/guest state or reject
        return nextMiddleware();
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
      socket.data.user = decoded;
      return nextMiddleware();
    } catch (err) {
      // Invalid token, continue unauthenticated
      return nextMiddleware();
    }
  });

  // Helper to mark a user online and broadcast
  async function markUserOnline(userId: string, socketId: string) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socketId);
    await trackUserSocket(userId, socketId);

    try {
      await prisma.profile.updateMany({
        where: { userId },
        data: { isOnline: true, lastSeen: new Date() },
      });
    } catch (e) {}

    // Broadcast online status to everyone
    io.emit("user:status", {
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    });

    // Auto-deliver all pending messages sent to this user
    try {
      const undelivered = await prisma.message.findMany({
        where: {
          conversation: {
            members: { some: { userId } },
          },
          senderId: { not: userId },
          isDeleted: false,
          deliveries: { none: { userId } },
        },
        select: { id: true, conversationId: true, senderId: true },
        take: 100,
      });

      for (const msg of undelivered) {
        await prisma.messageDelivery.upsert({
          where: { messageId_userId: { messageId: msg.id, userId } },
          create: { messageId: msg.id, userId, deliveredAt: new Date() },
          update: { deliveredAt: new Date() },
        }).catch(() => {});

        io.to(`conv:${msg.conversationId}`).emit("message:status_update", {
          messageId: msg.id,
          conversationId: msg.conversationId,
          status: "DELIVERED",
          userId,
        });
        io.to(`user:${msg.senderId}`).emit("message:status_update", {
          messageId: msg.id,
          conversationId: msg.conversationId,
          status: "DELIVERED",
          userId,
        });
      }
    } catch (e) {}
  }

  // Helper to mark a user offline and broadcast (when all device/tab sockets are closed)
  async function markUserOffline(userId: string, socketId: string) {
    const userSockets = onlineUsers.get(userId);
    let remainingSockets = 0;
    if (userSockets) {
      userSockets.delete(socketId);
      remainingSockets = userSockets.size;
      if (remainingSockets === 0) {
        onlineUsers.delete(userId);
      }
    }

    const redisRemaining = await removeUserSocket(userId, socketId);
    if (remainingSockets === 0 && redisRemaining === 0) {
      const lastSeen = new Date();
      try {
        await prisma.profile.updateMany({
          where: { userId },
          data: { isOnline: false, lastSeen },
        });
      } catch (e) {}

      io.emit("user:status", {
        userId,
        isOnline: false,
        lastSeen: lastSeen.toISOString(),
      });
    }
  }

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user;

    if (user && user.userId) {
      const userId = user.userId;
      await markUserOnline(userId, socket.id);
      socket.join(`user:${userId}`);

      try {
        const memberships = await prisma.conversationMember.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        memberships.forEach((m) => {
          socket.join(`conv:${m.conversationId}`);
        });
      } catch (e) {}
    }

    // Authenticate socket manually if client sends auth event
    socket.on("auth:identify", async (data: { token?: string }) => {
      try {
        const token = data.token;
        if (!token) return;
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
        socket.data.user = decoded;
        const userId = decoded.userId;

        await markUserOnline(userId, socket.id);
        socket.join(`user:${userId}`);

        const memberships = await prisma.conversationMember.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        memberships.forEach((m) => {
          socket.join(`conv:${m.conversationId}`);
        });
      } catch (e) {}
    });

    // Explicit offline signal on window close / page hide
    socket.on("presence:offline", async () => {
      const u = socket.data.user;
      if (u && u.userId) {
        await markUserOffline(u.userId, socket.id);
      }
    });

    // Join conversation room
    socket.on("conversation:join", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.join(`conv:${data.conversationId}`);
      }
    });

    // Leave conversation room
    socket.on("conversation:leave", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`conv:${data.conversationId}`);
      }
    });

    // Typing start
    socket.on("typing:start", (data: { conversationId: string; username: string; displayName: string }) => {
      if (!data?.conversationId || !socket.data.user) return;
      socket.to(`conv:${data.conversationId}`).emit("typing:start", {
        conversationId: data.conversationId,
        userId: socket.data.user.userId,
        username: data.username,
        displayName: data.displayName,
      });
    });

    // Typing stop
    socket.on("typing:stop", (data: { conversationId: string }) => {
      if (!data?.conversationId || !socket.data.user) return;
      socket.to(`conv:${data.conversationId}`).emit("typing:stop", {
        conversationId: data.conversationId,
        userId: socket.data.user.userId,
      });
    });

    // Message broadcast with real-time delivery calculation
    socket.on("message:send", async (data: { message: any }) => {
      if (!data?.message?.conversationId) return;
      const conversationId = data.message.conversationId;
      const messageId = data.message.id;
      const senderId = data.message.senderId;

      // Broadcast to conversation room AND all individual recipient user rooms for 100% instant delivery
      socket.to(`conv:${conversationId}`).emit("message:new", data.message);

      try {
        const otherMembers = await prisma.conversationMember.findMany({
          where: { conversationId, userId: { not: senderId } },
          select: { userId: true },
        });

        otherMembers.forEach((m) => {
          io.to(`user:${m.userId}`).emit("message:new", data.message);
        });

        const isAnyRecipientOnline = otherMembers.some(
          (m) => onlineUsers.has(m.userId) && (onlineUsers.get(m.userId)?.size || 0) > 0
        );

        if (isAnyRecipientOnline) {
          for (const m of otherMembers) {
            if (onlineUsers.has(m.userId)) {
              await prisma.messageDelivery.upsert({
                where: { messageId_userId: { messageId, userId: m.userId } },
                create: { messageId, userId: m.userId, deliveredAt: new Date() },
                update: { deliveredAt: new Date() },
              }).catch(() => {});
            }
          }

          // Emit DELIVERED status update (2 grey ticks) to room and sender
          io.to(`conv:${conversationId}`).emit("message:status_update", {
            messageId,
            conversationId,
            status: "DELIVERED",
          });
          io.to(`user:${senderId}`).emit("message:status_update", {
            messageId,
            conversationId,
            status: "DELIVERED",
          });
        }
      } catch (e) {}
    });

    // Message delivered acknowledgment
    socket.on("message:delivered", async (data: { messageId: string; conversationId: string }) => {
      if (!data?.messageId || !socket.data.user) return;
      const userId = socket.data.user.userId;
      try {
        await prisma.messageDelivery.upsert({
          where: {
            messageId_userId: {
              messageId: data.messageId,
              userId,
            },
          },
          create: {
            messageId: data.messageId,
            userId,
            deliveredAt: new Date(),
          },
          update: {
            deliveredAt: new Date(),
          },
        });

        io.to(`conv:${data.conversationId}`).emit("message:status_update", {
          messageId: data.messageId,
          conversationId: data.conversationId,
          status: "DELIVERED",
          userId,
        });
      } catch (e) {}
    });

    // Message read receipt (2 blue ticks)
    socket.on("message:read", async (data: { messageId?: string; conversationId: string }) => {
      if (!socket.data.user || !data?.conversationId) return;
      const userId = socket.data.user.userId;
      const conversationId = data.conversationId;

      try {
        await prisma.conversationMember.update({
          where: { conversationId_userId: { conversationId, userId } },
          data: { lastReadAt: new Date() },
        }).catch(() => {});

        if (data.messageId) {
          await prisma.messageRead.upsert({
            where: {
              messageId_userId: {
                messageId: data.messageId,
                userId,
              },
            },
            create: {
              messageId: data.messageId,
              userId,
              readAt: new Date(),
            },
            update: {
              readAt: new Date(),
            },
          }).catch(() => {});
        }

        // Mark all previous unread messages from other users in this conversation as read
        const unreadMsgs = await prisma.message.findMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isDeleted: false,
          },
          select: { id: true },
          take: 50,
        });

        for (const msg of unreadMsgs) {
          await prisma.messageRead.upsert({
            where: { messageId_userId: { messageId: msg.id, userId } },
            create: { messageId: msg.id, userId, readAt: new Date() },
            update: { readAt: new Date() },
          }).catch(() => {});
        }

        io.to(`conv:${conversationId}`).emit("message:status_update", {
          messageId: data.messageId,
          conversationId,
          status: "READ",
          userId,
        });
      } catch (e) {}
    });

    // Message reaction
    socket.on("message:reaction", (data: { messageId: string; conversationId: string; reaction: any; action: string }) => {
      if (!data?.conversationId) return;
      io.to(`conv:${data.conversationId}`).emit("message:reaction_update", data);
    });

    // Message delete
    socket.on("message:delete", (data: { messageId: string; conversationId: string; forEveryone: boolean }) => {
      if (!data?.conversationId) return;
      io.to(`conv:${data.conversationId}`).emit("message:deleted", data);
    });

    // Profile update broadcast (avatar, name, bio)
    socket.on("profile:update", (data: { userId: string; avatar?: string | null; displayName?: string; bio?: string }) => {
      io.emit("user:profile_updated", data);
    });

    // ============================================================
    // Real-Time WebRTC Voice & Video Calling Events
    // ============================================================
    socket.on("call:invite", (data: {
      callId: string;
      conversationId: string;
      targetUserId: string;
      callType: "VOICE" | "VIDEO";
      caller: {
        userId: string;
        displayName: string;
        username: string;
        avatar?: string | null;
      };
    }) => {
      if (!data?.targetUserId) return;
      // Emit incoming call event to target user's personal room
      io.to(`user:${data.targetUserId}`).emit("call:incoming", data);
      if (data.conversationId) {
        socket.to(`conv:${data.conversationId}`).emit("call:incoming", data);
      }
    });

    socket.on("call:accept", (data: { callId: string; callerId: string; targetUserId: string }) => {
      if (data?.callerId) {
        io.to(`user:${data.callerId}`).emit("call:accepted", data);
      }
    });

    socket.on("call:reject", (data: { callId: string; callerId: string; targetUserId: string }) => {
      if (data?.callerId) {
        io.to(`user:${data.callerId}`).emit("call:rejected", data);
      }
      if (data?.targetUserId) {
        io.to(`user:${data.targetUserId}`).emit("call:ended", data);
      }
    });

    socket.on("call:end", (data: { callId: string; otherUserId: string }) => {
      if (data?.otherUserId) {
        io.to(`user:${data.otherUserId}`).emit("call:ended", data);
      }
    });

    socket.on("call:signal", (data: { targetUserId: string; callId: string; signal: any }) => {
      if (data?.targetUserId) {
        io.to(`user:${data.targetUserId}`).emit("call:signal", {
          callId: data.callId,
          signal: data.signal,
          senderId: socket.data.user?.userId,
        });
      }
    });

    // Disconnect handler
    socket.on("disconnect", async () => {
      const user = socket.data.user;
      if (user && user.userId) {
        const userId = user.userId;
        const userSockets = onlineUsers.get(userId);

        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);

            const lastSeen = new Date();
            try {
              await prisma.profile.updateMany({
                where: { userId },
                data: { isOnline: false, lastSeen },
              });
            } catch (e) {
              // Ignore
            }

            io.emit("user:status", {
              userId,
              isOnline: false,
              lastSeen: lastSeen.toISOString(),
            });
          }
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 🚀 ChatFlow ready on http://${hostname}:${port}`);
    console.log(`> ⚡ Socket.IO real-time engine initialized on port ${port}`);
  });
});
