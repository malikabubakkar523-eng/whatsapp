import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: messageId } = await params;

    const body = await req.json();
    const parsed = reactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const { emoji } = parsed.data;

    // Verify message exists and user is a conversation member
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const isMember = message.conversation.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if this reaction already exists
    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      // Toggle off / remove
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, action: "removed", emoji, messageId });
    } else {
      // Add reaction
      const newReaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
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
      });

      // Notify message sender if not self
      if (message.senderId !== userId) {
        const actorProfile = message.conversation.members.find((m) => m.userId === userId);
        const name = actorProfile?.userId || "Someone";
        await prisma.notification.create({
          data: {
            userId: message.senderId,
            actorId: userId,
            type: "REACTION",
            title: `Reaction to your message`,
            content: `Reacted with ${emoji}`,
            dataJson: JSON.stringify({
              conversationId: message.conversationId,
              messageId,
              emoji,
            }),
          },
        });
      }

      return NextResponse.json({ success: true, action: "added", reaction: newReaction });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Reaction error:", error);
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}
