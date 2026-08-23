import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(200).optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isMember = conversation.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let otherUser = null;
    if (!conversation.isGroup) {
      const other = conversation.members.find((m) => m.userId !== userId);
      if (other?.user?.profile) {
        otherUser = {
          id: other.user.id,
          username: other.user.profile.username,
          displayName: other.user.profile.displayName,
          avatar: other.user.profile.avatar,
          bio: other.user.profile.bio,
          isOnline: other.user.profile.isOnline,
          lastSeen: other.user.profile.lastSeen,
        };
      }
    }

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherUser,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: conversationId } = await params;

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      include: { conversation: true },
    });

    if (!membership || !membership.conversation.isGroup) {
      return NextResponse.json({ error: "Only group admins can update group settings" }, { status: 403 });
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin permissions required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: parsed.data,
      include: {
        members: {
          include: {
            user: { include: { profile: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;
    const { id: conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.isGroup && conversation.ownerId === userId) {
      // Group owner deletes group
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
      return NextResponse.json({ success: true, message: "Group deleted" });
    }

    // Otherwise, leave the conversation / delete member
    await prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });

    return NextResponse.json({ success: true, message: "Left conversation" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
