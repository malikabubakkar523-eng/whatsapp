import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const visitorId = session.userId;

    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    // Do not record self profile views
    if (visitorId === targetUserId) {
      return NextResponse.json({ success: true, selfView: true });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Record or update visit
    const visit = await prisma.profileVisit.create({
      data: {
        visitedId: targetUserId,
        visitorId,
        visitedAt: new Date(),
      },
    });

    // Notify target user in real-time via Socket.IO
    try {
      const io = (globalThis as any).io;
      if (io) {
        // Fetch visitor profile info
        const visitorProfile = await prisma.profile.findUnique({
          where: { userId: visitorId },
          select: {
            username: true,
            displayName: true,
            avatar: true,
            isOnline: true,
          },
        });

        io.to(`user:${targetUserId}`).emit("profile:visitor_new", {
          id: visit.id,
          visitorId,
          visitedAt: visit.visitedAt.toISOString(),
          visitor: {
            id: visitorId,
            profile: visitorProfile,
          },
        });
      }
    } catch (e) {
      // Non-blocking socket notification
    }

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Record profile visit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
