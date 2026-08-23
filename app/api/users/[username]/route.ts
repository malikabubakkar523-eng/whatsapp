import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanUsername } from "@/utils/username";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const cleanUser = cleanUsername(rawUsername);
    const session = await getAuthSession(req);
    const currentUserId = session?.userId;

    const profile = await prisma.profile.findUnique({
      where: { username: cleanUser },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            isSuspended: true,
            createdAt: true,
            settings: true,
          },
        },
      },
    });

    if (!profile || profile.user.isSuspended) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUserId = profile.userId;

    // Check if target has blocked current user or current user has blocked target
    let isBlocked = false;
    let hasBlocked = false;

    if (currentUserId) {
      const block1 = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: currentUserId,
            blockedId: targetUserId,
          },
        },
      });
      hasBlocked = !!block1;

      const block2 = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: targetUserId,
            blockedId: currentUserId,
          },
        },
      });
      isBlocked = !!block2;
    }

    // Privacy filters
    const settings = profile.user.settings;
    const isSelf = currentUserId === targetUserId;

    let showOnlineStatus = true;
    let showLastSeen = true;
    let showAvatar = true;

    if (!isSelf && settings) {
      if (settings.onlineStatusPrivacy === "NOBODY" || isBlocked) {
        showOnlineStatus = false;
      }
      if (settings.lastSeenPrivacy === "NOBODY" || isBlocked) {
        showLastSeen = false;
      }
      if (settings.profilePicturePrivacy === "NOBODY" || isBlocked) {
        showAvatar = false;
      }
    }

    // Find mutual / shared groups if both users belong to same groups
    let sharedGroupsCount = 0;
    if (currentUserId && !isSelf) {
      const shared = await prisma.conversationMember.groupBy({
        by: ["conversationId"],
        where: {
          userId: { in: [currentUserId, targetUserId] },
          conversation: { isGroup: true },
        },
        _count: { userId: true },
        having: { userId: { _count: { equals: 2 } } },
      });
      sharedGroupsCount = shared.length;
    }

    return NextResponse.json({
      user: {
        id: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatar: showAvatar ? profile.avatar : null,
        bio: isBlocked ? null : profile.bio,
        isOnline: showOnlineStatus ? profile.isOnline : false,
        lastSeen: showLastSeen ? profile.lastSeen : null,
        createdAt: profile.user.createdAt,
        sharedGroupsCount,
        hasBlocked,
        isBlocked,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
