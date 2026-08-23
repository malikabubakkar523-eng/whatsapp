import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalConversations,
      totalGroups,
      totalMessages,
      pendingReports,
      resolvedReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { isOnline: true } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.conversation.count({ where: { isGroup: false } }),
      prisma.conversation.count({ where: { isGroup: true } }),
      prisma.message.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalConversations,
        totalGroups,
        totalMessages,
        pendingReports,
        resolvedReports,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
