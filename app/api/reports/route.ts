import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const reportSchema = z.object({
  targetType: z.enum(["USER", "MESSAGE", "GROUP"]),
  targetId: z.string(),
  reportedUserId: z.string().optional().nullable(),
  reportedMessageId: z.string().optional().nullable(),
  reportedConversationId: z.string().optional().nullable(),
  reason: z.enum(["SPAM", "HARASSMENT", "FAKE_ACCOUNT", "INAPPROPRIATE", "OTHER"]),
  details: z.string().max(500).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const reporterId = session.userId;

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid report data" },
        { status: 400 }
      );
    }

    const {
      targetType,
      targetId,
      reportedUserId,
      reportedMessageId,
      reportedConversationId,
      reason,
      details,
    } = parsed.data;

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reportedUserId: reportedUserId || (targetType === "USER" ? targetId : null),
        reportedMessageId: reportedMessageId || (targetType === "MESSAGE" ? targetId : null),
        reportedConversationId: reportedConversationId || (targetType === "GROUP" ? targetId : null),
        reason,
        details: details?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submit report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
