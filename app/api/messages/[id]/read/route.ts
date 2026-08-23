import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: messageId } = await params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: { include: { members: true } } },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const isMember = message.conversation.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Upsert read receipt
    const readReceipt = await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
        readAt: new Date(),
      },
      update: {
        readAt: new Date(),
      },
    });

    // Also update member's lastReadAt in conversation
    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: message.conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({ success: true, readReceipt });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to mark message read" }, { status: 500 });
  }
}
