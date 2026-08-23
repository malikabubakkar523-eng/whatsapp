import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateAIResponse, META_AI_USERNAME } from "@/lib/ai";
import { z } from "zod";

const sendMessageSchema = z.object({
  content: z.string().optional().default(""),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "CALL"]).optional().default("TEXT"),
  isViewOnce: z.boolean().optional().default(false),
  replyToId: z.string().optional().nullable(),
  attachments: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        duration: z.number().optional().nullable(),
      })
    )
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: conversationId } = await params;

    // Verify user is a member of this conversation
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const cursor = searchParams.get("cursor"); // message id for cursor pagination

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        // If message was soft deleted for everyone or for sender, handle visibility
        OR: [
          { isDeleted: false },
          { deletedForEveryone: true }, // We render placeholder "This message was deleted"
        ],
      },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            email: false,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    displayName: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        replyTo: {
          select: {
            id: true,
            senderId: true,
            content: true,
            type: true,
            sender: {
              select: {
                profile: {
                  select: {
                    displayName: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        reads: {
          select: {
            userId: true,
            readAt: true,
          },
        },
        deliveries: {
          select: {
            userId: true,
            deliveredAt: true,
          },
        },
      },
    });

    // Fetch other members' lastReadAt timestamp
    const otherMembers = await prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: { not: userId },
      },
      select: {
        userId: true,
        lastReadAt: true,
      },
    });

    const maxOtherReadTime = otherMembers.reduce<number>((max, m) => {
      if (m.lastReadAt) {
        const t = new Date(m.lastReadAt).getTime();
        return t > max ? t : max;
      }
      return max;
    }, 0);

    // Automatically mark all incoming unread messages as read in the database
    const unreadIncoming = messages.filter((m) => m.senderId !== userId);
    if (unreadIncoming.length > 0) {
      Promise.all(
        unreadIncoming.map((msg) =>
          prisma.messageRead
            .upsert({
              where: {
                messageId_userId: {
                  messageId: msg.id,
                  userId,
                },
              },
              create: {
                messageId: msg.id,
                userId,
                readAt: new Date(),
              },
              update: {
                readAt: new Date(),
              },
            })
            .catch(() => {})
        )
      ).catch(() => {});
    }

    // Determine message delivery / read status with blue ticks
    const formatted = messages.map((m) => {
      const isMine = m.senderId === userId;
      let status: "SENT" | "DELIVERED" | "READ" = "SENT";

      if (isMine) {
        const msgTime = new Date(m.createdAt).getTime();
        // If message has read records or any other member read after this message was created
        if (m.reads.length > 0 || (maxOtherReadTime > 0 && maxOtherReadTime >= msgTime)) {
          status = "READ";
        } else if (m.deliveries.length > 0) {
          status = "DELIVERED";
        }
      }

      return {
        ...m,
        isMine,
        status,
      };
    });

    // Update this member's lastReadAt
    await prisma.conversationMember
      .update({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      })
      .catch(() => {});

    return NextResponse.json({
      messages: formatted.reverse(), // Chronological order
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: conversationId } = await params;

    // Check membership
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      include: {
        conversation: {
          include: {
            members: {
              include: { user: { include: { profile: true } } },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this conversation" }, { status: 403 });
    }

    // Check if 1-on-1 and blocked
    if (!membership.conversation.isGroup) {
      const otherMember = membership.conversation.members.find((m) => m.userId !== userId);
      if (otherMember) {
        const isBlocked = await prisma.userBlock.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: otherMember.userId },
              { blockerId: otherMember.userId, blockedId: userId },
            ],
          },
        });
        if (isBlocked) {
          return NextResponse.json(
            { error: "Cannot send message. User is blocked or has blocked you." },
            { status: 403 }
          );
        }
      }
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid message format" },
        { status: 400 }
      );
    }

    const { content, type, isViewOnce, replyToId, attachments } = parsed.data;

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content?.trim() || "",
        type,
        isViewOnce: isViewOnce || false,
        viewOnceOpened: false,
        replyToId: replyToId || null,
        attachments: {
          create: attachments?.map((att) => ({
            url: att.url,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            duration: att.duration || null,
          })) || [],
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        attachments: true,
        reactions: true,
        replyTo: {
          select: {
            id: true,
            senderId: true,
            content: true,
            type: true,
            sender: {
              select: {
                profile: {
                  select: {
                    displayName: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Update sender's lastReadAt
    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    // Create notifications for other members
    const otherMembers = membership.conversation.members.filter((m) => m.userId !== userId);
    for (const member of otherMembers) {
      const senderProfile = membership.conversation.members.find((m) => m.userId === userId)?.user.profile;
      const senderName = senderProfile?.displayName || `@${senderProfile?.username || "Someone"}`;
      
      const snippet =
        type === "IMAGE" ? "📷 Sent an image" :
        type === "AUDIO" ? "🎤 Sent a voice message" :
        type === "VIDEO" ? "🎥 Sent a video" :
        type === "FILE" ? "📎 Sent a file" :
        content?.slice(0, 50) || "Sent a message";

      await prisma.notification.create({
        data: {
          userId: member.userId,
          actorId: userId,
          type: "MESSAGE",
          title: membership.conversation.isGroup
            ? `${membership.conversation.name} • ${senderName}`
            : senderName,
          content: snippet,
          dataJson: JSON.stringify({
            conversationId,
            messageId: message.id,
          }),
        },
      });
    }

    // Check if other participant is the Meta AI bot
    const metaAiMember = otherMembers.find(
      (m) => m.user?.profile?.username?.toLowerCase() === META_AI_USERNAME
    );

    let aiReply = null;
    if (metaAiMember && content?.trim()) {
      try {
        // Fetch recent messages for context
        const recentMessages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: "desc" },
          take: 6,
        });

        const history = recentMessages.reverse().map((m) => ({
          role: (m.senderId === metaAiMember.userId ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        }));

        const aiResponseText = await generateAIResponse(content.trim(), history);

        aiReply = await prisma.message.create({
          data: {
            conversationId,
            senderId: metaAiMember.userId,
            content: aiResponseText,
            type: "TEXT",
          },
          include: {
            sender: {
              select: {
                id: true,
                profile: {
                  select: {
                    username: true,
                    displayName: true,
                    avatar: true,
                    isOnline: true,
                  },
                },
              },
            },
            attachments: true,
            reactions: true,
            replyTo: true,
          },
        });

        // Update conversation lastMessageAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });
      } catch (aiErr) {
        console.error("Meta AI generation error:", aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        isMine: true,
        status: "SENT",
      },
      aiReply: aiReply ? { ...aiReply, isMine: false, status: "READ" } : null,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
