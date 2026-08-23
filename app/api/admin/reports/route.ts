import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateReportSchema = z.object({
  reportId: z.string(),
  status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]),
  deleteContent: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const reports = await prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            email: true,
            isSuspended: true,
            profile: true,
          },
        },
        reportedMessage: {
          include: {
            sender: {
              select: {
                id: true,
                profile: true,
              },
            },
          },
        },
        reportedConversation: true,
      },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { reportId, status, deleteContent } = parsed.data;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // If requested to delete reported content
    if (deleteContent && report.targetType === "MESSAGE" && report.targetId) {
      await prisma.message.update({
        where: { id: report.targetId },
        data: {
          content: "This message was removed by moderator.",
          deletedForEveryone: true,
          isDeleted: true,
        },
      });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
