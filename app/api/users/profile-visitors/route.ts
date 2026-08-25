import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "30", 10), 1), 100);

    const rawVisits = await prisma.profileVisit.findMany({
      where: {
        visitedId: userId,
      },
      orderBy: {
        visitedAt: "desc",
      },
      take: limit * 2, // fetch extra to deduplicate per user if needed
      include: {
        visitor: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
                bio: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    // Group or deduplicate visits by visitorId to show the latest visit per user + total visit count
    const visitorMap = new Map<string, any>();

    for (const v of rawVisits) {
      if (!visitorMap.has(v.visitorId)) {
        visitorMap.set(v.visitorId, {
          id: v.id,
          visitorId: v.visitorId,
          lastVisitedAt: v.visitedAt,
          visitCount: 1,
          visitor: {
            id: v.visitor.id,
            username: v.visitor.profile?.username || "unknown",
            displayName: v.visitor.profile?.displayName || "Unknown User",
            avatar: v.visitor.profile?.avatar || null,
            bio: v.visitor.profile?.bio || null,
            isOnline: v.visitor.profile?.isOnline || false,
            lastSeen: v.visitor.profile?.lastSeen || null,
          },
        });
      } else {
        const existing = visitorMap.get(v.visitorId);
        existing.visitCount += 1;
      }
    }

    const visitors = Array.from(visitorMap.values()).slice(0, limit);

    return NextResponse.json({
      visitors,
      totalCount: visitorMap.size,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get profile visitors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
