import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { cleanUsername } from "@/utils/username";
import { z } from "zod";

const addMemberSchema = z.object({
  username: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

const updateRoleSchema = z.object({
  memberId: z.string().optional(),
  targetUserId: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const currentUserId = session.userId;
    const { id: conversationId } = await params;

    const currentMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      include: { conversation: true },
    });

    if (!currentMember || !currentMember.conversation.isGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    let targetUserId = parsed.data.userId;
    if (!targetUserId && parsed.data.username) {
      const cleanUser = cleanUsername(parsed.data.username);
      const profile = await prisma.profile.findUnique({
        where: { username: cleanUser },
      });
      if (!profile) {
        return NextResponse.json({ error: `User @${cleanUser} not found` }, { status: 404 });
      }
      targetUserId = profile.userId;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User is required" }, { status: 400 });
    }

    const existingMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already in this group" }, { status: 400 });
    }

    const newMember = await prisma.conversationMember.create({
      data: {
        conversationId,
        userId: targetUserId,
        role: parsed.data.role || "MEMBER",
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const currentUserId = session.userId;
    const { id: conversationId } = await params;

    const currentMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!currentMember || currentMember.role !== "OWNER") {
      return NextResponse.json({ error: "Only group owner can change member roles" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role payload" }, { status: 400 });
    }

    const targetUserId = parsed.data.targetUserId;
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user required" }, { status: 400 });
    }

    const updated = await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
      data: { role: parsed.data.role },
      include: { user: { include: { profile: true } } },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const currentUserId = session.userId;
    const { id: conversationId } = await params;

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
    }

    const currentMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Owner can remove anyone, Admin can remove Members, Users can remove themselves
    const targetMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const isSelf = currentUserId === targetUserId;
    const isOwner = currentMember.role === "OWNER";
    const isAdmin = currentMember.role === "ADMIN" && targetMember.role === "MEMBER";

    if (!isSelf && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Permission denied to remove this member" }, { status: 403 });
    }

    await prisma.conversationMember.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Member removed" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
