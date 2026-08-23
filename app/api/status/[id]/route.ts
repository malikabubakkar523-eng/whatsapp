import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await props.params;

    const status = await prisma.userStatus.findUnique({
      where: { id },
    });

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    if (status.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.userStatus.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Status deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete status error:", error);
    return NextResponse.json({ error: "Failed to delete status" }, { status: 500 });
  }
}
