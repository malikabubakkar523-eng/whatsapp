import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: statusId } = await params;

    // Record view idempotently
    const existing = await prisma.statusView.findUnique({
      where: {
        statusId_userId: {
          statusId,
          userId: user.id,
        },
      },
    });

    if (!existing) {
      await prisma.statusView.create({
        data: {
          statusId,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status view error:", error);
    return NextResponse.json({ error: "Failed to record status view" }, { status: 500 });
  }
}
