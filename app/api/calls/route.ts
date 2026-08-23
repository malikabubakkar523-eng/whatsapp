import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const createCallSchema = z.object({
  conversationId: z.string(),
  callType: z.enum(["VOICE", "VIDEO"]),
  status: z.enum(["OUTGOING", "INCOMING", "MISSED", "COMPLETED"]).default("COMPLETED"),
  durationSeconds: z.number().optional().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;

    // Get all user memberships
    const userMemberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    const conversationIds = userMemberships.map((m) => m.conversationId);

    // Fetch all CALL messages
    const callMessages = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        type: "CALL",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            profile: true,
          },
        },
        conversation: {
          include: {
            members: {
              include: {
                user: { select: { id: true, profile: true } },
              },
            },
          },
        },
      },
    });

    const formattedCalls = callMessages.map((msg) => {
      const isMine = msg.senderId === userId;
      const otherMember = msg.conversation.members.find((m) => m.userId !== userId);
      const isVideo = msg.content.toLowerCase().includes("video");
      const isMissed = msg.content.toLowerCase().includes("missed");

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        callerId: msg.senderId,
        callType: isVideo ? "VIDEO" : "VOICE",
        status: isMissed ? "MISSED" : isMine ? "OUTGOING" : "INCOMING",
        content: msg.content,
        createdAt: msg.createdAt,
        contact: otherMember?.user?.profile || {
          id: msg.senderId,
          displayName: msg.sender.profile?.displayName || "User",
          username: msg.sender.profile?.username || "user",
          avatar: msg.sender.profile?.avatar || null,
          isOnline: msg.sender.profile?.isOnline || false,
        },
      };
    });

    return NextResponse.json({ calls: formattedCalls });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get calls error:", error);
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const body = await req.json();
    const parsed = createCallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid call payload" }, { status: 400 });
    }

    const { conversationId, callType, status, durationSeconds } = parsed.data;

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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formatDur = (secs: number) => {
      if (!secs || secs === 0) return "";
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return ` (${m > 0 ? `${m}m ` : ""}${s}s)`;
    };

    const callIcon = callType === "VIDEO" ? "🎥 Video call" : "📞 Voice call";
    const statusText =
      status === "MISSED" ? "Missed" :
      status === "OUTGOING" ? "Outgoing" :
      status === "INCOMING" ? "Incoming" : "Ended";

    const contentText = `${callIcon} • ${statusText}${formatDur(durationSeconds)}`;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: contentText,
        type: "CALL",
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Notify other members
    const otherMembers = membership.conversation.members.filter((m) => m.userId !== userId);
    for (const member of otherMembers) {
      const senderProfile = membership.conversation.members.find((m) => m.userId === userId)?.user.profile;
      const senderName = senderProfile?.displayName || `@${senderProfile?.username || "Someone"}`;

      await prisma.notification.create({
        data: {
          userId: member.userId,
          actorId: userId,
          type: "MESSAGE",
          title: `Call from ${senderName}`,
          content: contentText,
          dataJson: JSON.stringify({
            conversationId,
            messageId: message.id,
            callType,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        isMine: true,
        status: "SENT",
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create call error:", error);
    return NextResponse.json({ error: "Failed to log call" }, { status: 500 });
  }
}
