import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { cleanUsername } from "@/utils/username";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await requireAuth(req);
    const blockerId = session.userId;

    const blockedList = await prisma.userBlock.findMany({
      where: { blockerId },
      include: {
        blocked: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({
      blockedUsers: blockedList.map((b) => b.blocked),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch blocked users" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await requireAuth(req);
    const blockerId = session.userId;
    const { username: rawParam } = await params;

    // Find target user by ID or by username
    let targetUser = await prisma.user.findUnique({
      where: { id: rawParam },
    });

    if (!targetUser) {
      const cleanUser = cleanUsername(rawParam);
      const profile = await prisma.profile.findUnique({
        where: { username: cleanUser },
      });
      if (profile) {
        targetUser = await prisma.user.findUnique({
          where: { id: profile.userId },
        });
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const blockedId = targetUser.id;

    if (blockerId === blockedId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const existing = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existing) {
      // Unblock
      await prisma.userBlock.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, action: "unblocked", blocked: false });
    } else {
      // Block
      await prisma.userBlock.create({
        data: {
          blockerId,
          blockedId,
        },
      });
      return NextResponse.json({ success: true, action: "blocked", blocked: true });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Block user error:", error);
    return NextResponse.json({ error: "Failed to toggle block status" }, { status: 500 });
  }
}
