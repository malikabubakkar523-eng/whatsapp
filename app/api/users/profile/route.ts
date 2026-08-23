import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(250).optional(),
  avatar: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { displayName, bio, avatar } = parsed.data;

    const updated = await prisma.profile.update({
      where: { userId: session.userId },
      data: {
        ...(displayName !== undefined ? { displayName: displayName.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
