import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const suspendSchema = z.object({
  userId: z.string(),
  isSuspended: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.toLowerCase().trim() || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search } },
              { profile: { username: { contains: search } } },
              { profile: { displayName: { contains: search } } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: true,
        _count: {
          select: {
            sentMessages: true,
            reportsReceived: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = suspendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { userId, isSuspended } = parsed.data;

    // Prevent suspending self
    if (userId === session.userId) {
      return NextResponse.json({ error: "Cannot suspend your own admin account" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
