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

    const { id: messageId } = await params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!message.isViewOnce) {
      return NextResponse.json({ error: "Not a view-once message" }, { status: 400 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { viewOnceOpened: true },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("View once open error:", error);
    return NextResponse.json({ error: "Failed to open view-once message" }, { status: 500 });
  }
}
