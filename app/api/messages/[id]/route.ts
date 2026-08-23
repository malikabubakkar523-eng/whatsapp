import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const patchMessageSchema = z.object({
  isPinned: z.boolean().optional(),
});

export async function PATCH(
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

    const body = await req.json();
    const parsed = patchMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: messageId } = await params;

    const { searchParams } = new URL(req.url);
    const forEveryone = searchParams.get("forEveryone") === "true";

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: { members: true },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const currentMember = message.conversation.members.find((m) => m.userId === userId);
    if (!currentMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const isSender = message.senderId === userId;
    const isGroupAdmin =
      message.conversation.isGroup &&
      (currentMember.role === "OWNER" || currentMember.role === "ADMIN");

    if (forEveryone) {
      if (!isSender && !isGroupAdmin) {
        return NextResponse.json({ error: "Only the sender or group admin can delete for everyone" }, { status: 403 });
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          content: "This message was deleted",
          deletedForEveryone: true,
          isDeleted: true,
        },
      });

      return NextResponse.json({ success: true, deletedForEveryone: true });
    } else {
      // Soft delete for me
      await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
        },
      });

      return NextResponse.json({ success: true, deletedForEveryone: false });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
