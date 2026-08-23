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

    const existing = await prisma.statusLike.findUnique({
      where: {
        statusId_userId: {
          statusId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      await prisma.statusLike.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.statusLike.create({
        data: {
          statusId,
          userId: user.id,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Status like error:", error);
    return NextResponse.json({ error: "Failed to toggle status like" }, { status: 500 });
  }
}
