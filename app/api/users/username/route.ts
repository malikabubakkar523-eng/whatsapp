import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateUsername, cleanUsername } from "@/utils/username";
import { z } from "zod";

const usernameSchema = z.object({
  username: z.string(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = usernameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const validation = validateUsername(parsed.data.username);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanUser = validation.cleaned;

    // Check if taken by another user
    const existing = await prisma.profile.findUnique({
      where: { username: cleanUser },
    });

    if (existing && existing.userId !== session.userId) {
      return NextResponse.json(
        { error: `Username @${cleanUser} is already taken` },
        { status: 409 }
      );
    }

    const updated = await prisma.profile.update({
      where: { userId: session.userId },
      data: { username: cleanUser },
    });

    return NextResponse.json({
      success: true,
      username: updated.username,
      profile: updated,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Change username error:", error);
    return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
  }
}
