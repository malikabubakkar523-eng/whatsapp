import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanUsername } from "@/utils/username";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const currentUserId = session?.userId;

    // Get list of blocked user IDs
    let blockedIds: string[] = [];
    if (currentUserId) {
      const blocks = await prisma.userBlock.findMany({
        where: {
          OR: [
            { blockerId: currentUserId },
            { blockedId: currentUserId },
          ],
        },
      });
      blockedIds = blocks.map((b) => (b.blockerId === currentUserId ? b.blockedId : b.blockerId));
    }

    if (!query) {
      // Return suggested or active users (up to 15)
      const profiles = await prisma.profile.findMany({
        where: {
          userId: {
            notIn: currentUserId ? [currentUserId, ...blockedIds] : blockedIds,
          },
          user: {
            isSuspended: false,
            settings: {
              discoverability: {
                not: "NOBODY",
              },
            },
          },
        },
        take: 15,
        orderBy: [{ isOnline: "desc" }, { lastSeen: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              email: false,
              settings: true,
            },
          },
        },
      });

      return NextResponse.json({ users: profiles });
    }

    const cleanQuery = cleanUsername(query);

    // Search profiles matching username, displayName, or bio
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          notIn: currentUserId ? [currentUserId, ...blockedIds] : blockedIds,
        },
        user: {
          isSuspended: false,
          settings: {
            discoverability: {
              not: "NOBODY",
            },
          },
        },
        OR: [
          { username: { contains: cleanQuery } },
          { displayName: { contains: query } },
          { bio: { contains: query } },
        ],
      },
      take: 30,
      include: {
        user: {
          select: {
            id: true,
            settings: true,
          },
        },
      },
    });

    // Rank results: exact username match first, starts-with username second, display name match third
    const ranked = [...profiles].sort((a, b) => {
      const aUser = a.username.toLowerCase();
      const bUser = b.username.toLowerCase();
      if (aUser === cleanQuery) return -1;
      if (bUser === cleanQuery) return 1;
      if (aUser.startsWith(cleanQuery) && !bUser.startsWith(cleanQuery)) return -1;
      if (!aUser.startsWith(cleanQuery) && bUser.startsWith(cleanQuery)) return 1;
      return 0;
    });

    return NextResponse.json({ users: ranked });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
