import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/status - Fetch active statuses
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Fetch active statuses created in the last 24 hours
    const statuses = await prisma.userStatus.findMany({
      where: {
        expiresAt: { gt: now },
      },
      include: {
        user: {
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
        views: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    username: true,
                    displayName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    username: true,
                    displayName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = statuses.map((s) => ({
      ...s,
      isViewedByMe: s.views.some((v) => v.userId === user.id),
      isLikedByMe: s.likes.some((l) => l.userId === user.id),
    }));

    return NextResponse.json({ statuses: formatted });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch status updates" }, { status: 500 });
  }
}

// POST /api/status - Post new status
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type = "TEXT", content, mediaUrl, bgColor = "#00A884", fontStyle = "sans" } = body;

    if (type === "TEXT" && !content?.trim()) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }
    if ((type === "IMAGE" || type === "VIDEO") && !mediaUrl) {
      return NextResponse.json({ error: "Media is required" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const newStatus = await prisma.userStatus.create({
      data: {
        userId: user.id,
        type,
        content: content?.trim() || null,
        mediaUrl: mediaUrl || null,
        bgColor: bgColor || "#00A884",
        fontStyle: fontStyle || "sans",
        expiresAt,
      },
      include: {
        user: {
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
        views: true,
        likes: true,
      },
    });

    return NextResponse.json({ status: newStatus });
  } catch (error) {
    console.error("Create status error:", error);
    return NextResponse.json({ error: "Failed to post status" }, { status: 500 });
  }
}
