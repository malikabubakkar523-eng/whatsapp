import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { cleanUsername } from "@/utils/username";
import { ensureMetaAIConversation } from "@/lib/ai";
import { z } from "zod";

const createConversationSchema = z.object({
  isGroup: z.boolean().optional(),
  isSelf: z.boolean().optional(),
  recipientUsername: z.string().optional(),
  recipientId: z.string().optional(),
  name: z.string().max(60).optional(),
  description: z.string().max(200).optional(),
  avatar: z.string().optional(),
  memberUsernames: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;

    // Automatically ensure Meta AI conversation is available
    await ensureMetaAIConversation(userId);

    const userMemberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    const conversationIds = userMemberships.map((m) => m.conversationId);
    const lastReadMap = new Map(userMemberships.map((m) => [m.conversationId, m.lastReadAt]));

    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: conversationIds },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: false,
                profile: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                profile: true,
              },
            },
            attachments: true,
          },
        },
      },
    });

    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const lastRead = lastReadMap.get(c.id) || new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

        // Check if self-chat
        const isSelf = !c.isGroup && c.members.length === 1 && c.members[0].userId === userId;

        let otherUser = null;
        if (!c.isGroup) {
          if (isSelf) {
            const selfProfile = c.members[0].user?.profile;
            if (selfProfile) {
              otherUser = {
                id: userId,
                username: selfProfile.username,
                displayName: `${selfProfile.displayName} (You)`,
                avatar: selfProfile.avatar,
                bio: "Message yourself • Saved notes & media 📌",
                isOnline: true,
                lastSeen: new Date(),
              };
            }
          } else {
            const otherMember = c.members.find((m) => m.userId !== userId);
            if (otherMember?.user?.profile) {
              otherUser = {
                id: otherMember.user.id,
                username: otherMember.user.profile.username,
                displayName: otherMember.user.profile.displayName,
                avatar: otherMember.user.profile.avatar,
                bio: otherMember.user.profile.bio,
                isOnline: otherMember.user.profile.isOnline,
                lastSeen: otherMember.user.profile.lastSeen,
              };
            }
          }
        }

        return {
          id: c.id,
          isGroup: c.isGroup,
          isSelf,
          name: isSelf ? "You (Message yourself)" : c.name,
          avatar: isSelf ? c.members[0].user?.profile?.avatar : c.avatar,
          description: isSelf ? "Saved notes and messages" : c.description,
          ownerId: c.ownerId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          lastMessageAt: c.lastMessageAt,
          members: c.members,
          lastMessage: c.messages[0] || null,
          unreadCount,
          otherUser,
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const {
      isGroup,
      isSelf: reqIsSelf,
      recipientUsername,
      recipientId: rawRecipientId,
      name,
      description,
      avatar,
      memberUsernames,
      memberIds: rawMemberIds,
    } = parsed.data;

    // 1. Group Conversation
    if (isGroup) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Group name is required" }, { status: 400 });
      }

      const targetUserIds = new Set<string>([userId]);

      if (rawMemberIds && rawMemberIds.length > 0) {
        rawMemberIds.forEach((id) => targetUserIds.add(id));
      }

      if (memberUsernames && memberUsernames.length > 0) {
        const cleanUsernames = memberUsernames.map((u) => cleanUsername(u));
        const profiles = await prisma.profile.findMany({
          where: { username: { in: cleanUsernames } },
          select: { userId: true },
        });
        profiles.forEach((p) => targetUserIds.add(p.userId));
      }

      const conversation = await prisma.conversation.create({
        data: {
          isGroup: true,
          name: name.trim(),
          description: description?.trim() || null,
          avatar: avatar || null,
          ownerId: userId,
          members: {
            create: Array.from(targetUserIds).map((memberUserId) => ({
              userId: memberUserId,
              role: memberUserId === userId ? "OWNER" : "MEMBER",
            })),
          },
        },
        include: {
          members: {
            include: {
              user: {
                include: { profile: true },
              },
            },
          },
        },
      });

      return NextResponse.json({ success: true, conversation });
    }

    // 2. Self Conversation (Message Yourself / Saved Messages)
    const selfProfile = await prisma.profile.findUnique({ where: { userId } });
    const isTargetSelf =
      reqIsSelf ||
      rawRecipientId === userId ||
      (recipientUsername && selfProfile && cleanUsername(recipientUsername) === selfProfile.username.toLowerCase());

    if (isTargetSelf) {
      // Find existing self-conversation
      const existingSelf = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          members: {
            every: { userId },
          },
        },
        include: {
          members: {
            include: {
              user: { include: { profile: true } },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { attachments: true },
          },
        },
      });

      if (existingSelf && existingSelf.members.length === 1) {
        return NextResponse.json({ success: true, conversation: existingSelf });
      }

      const newSelf = await prisma.conversation.create({
        data: {
          isGroup: false,
          name: "You (Message yourself)",
          members: {
            create: [{ userId, role: "OWNER" }],
          },
        },
        include: {
          members: {
            include: {
              user: { include: { profile: true } },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { attachments: true },
          },
        },
      });

      return NextResponse.json({ success: true, conversation: newSelf });
    }

    // 3. 1-on-1 Direct Conversation with another user
    let targetUserId = rawRecipientId;

    if (!targetUserId && recipientUsername) {
      const cleanUser = cleanUsername(recipientUsername);
      const profile = await prisma.profile.findUnique({
        where: { username: cleanUser },
      });
      if (!profile) {
        return NextResponse.json({ error: `User @${cleanUser} not found` }, { status: 404 });
      }
      targetUserId = profile.userId;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
    }

    // Check blocking
    const isBlocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      return NextResponse.json(
        { error: "Cannot initiate conversation with this user." },
        { status: 403 }
      );
    }

    // Check if 1-on-1 exists
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { attachments: true },
        },
      },
    });

    if (existing && existing.members.length === 2) {
      return NextResponse.json({ success: true, conversation: existing });
    }

    // Create new direct conversation
    const newConv = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId, role: "MEMBER" },
            { userId: targetUserId, role: "MEMBER" },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { attachments: true },
        },
      },
    });

    return NextResponse.json({ success: true, conversation: newConv });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
