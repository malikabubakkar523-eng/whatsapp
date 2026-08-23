import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "chatflow_super_secret_jwt_key_development_2026";
const AUTH_COOKIE_NAME = "chatflow_session";

const prisma = new PrismaClient();
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Map of userId -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

app.prepare().then(() => {
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

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user;

    if (user && user.userId) {
      const userId = user.userId;

      // Track online sockets for user
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // If first socket connection for this user, broadcast online
      if (onlineUsers.get(userId)!.size === 1) {
        try {
          await prisma.profile.updateMany({
            where: { userId },
            data: { isOnline: true, lastSeen: new Date() },
          });
        } catch (e) {
          // Ignore error
        }

        io.emit("user:status", {
          userId,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        });
      }

      // Join all active conversations user belongs to
      try {
        const memberships = await prisma.conversationMember.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        memberships.forEach((m) => {
          socket.join(`conv:${m.conversationId}`);
        });
      } catch (e) {
        // Ignore error
      }
    }

    // Authenticate socket manually if client sends auth event
    socket.on("auth:identify", async (data: { token?: string }) => {
      try {
        const token = data.token;
        if (!token) return;
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
        socket.data.user = decoded;
        const userId = decoded.userId;

        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)!.add(socket.id);

        socket.join(`user:${userId}`);

        const memberships = await prisma.conversationMember.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        memberships.forEach((m) => {
          socket.join(`conv:${m.conversationId}`);
        });

        await prisma.profile.updateMany({
          where: { userId },
          data: { isOnline: true, lastSeen: new Date() },
        });

        io.emit("user:status", {
          userId,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        });
      } catch (e) {
        // Token invalid
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

    // Message broadcast
    socket.on("message:send", (data: { message: any }) => {
      if (!data?.message?.conversationId) return;
      const conversationId = data.message.conversationId;
      // Broadcast to room
      socket.to(`conv:${conversationId}`).emit("message:new", data.message);
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
      } catch (e) {
        // Ignore
      }
    });

    // Message read receipt
    socket.on("message:read", async (data: { messageId: string; conversationId: string }) => {
      if (!data?.messageId || !socket.data.user) return;
      const userId = socket.data.user.userId;
      try {
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
        });

        io.to(`conv:${data.conversationId}`).emit("message:status_update", {
          messageId: data.messageId,
          conversationId: data.conversationId,
          status: "READ",
          userId,
        });
      } catch (e) {
        // Ignore
      }
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
