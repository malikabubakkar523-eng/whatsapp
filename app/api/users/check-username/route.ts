import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUsername, cleanUsername } from "@/utils/username";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username");

    if (!rawUsername) {
      return NextResponse.json({ available: false, error: "Username is required" }, { status: 400 });
    }

    const validation = validateUsername(rawUsername);
    if (!validation.isValid) {
      return NextResponse.json({
        available: false,
        error: validation.error,
        cleaned: validation.cleaned,
      });
    }

    const cleanUser = validation.cleaned;

    // Check if the current logged in user already owns this username
    const session = await getAuthSession(req);
    let isOwnUsername = false;
    if (session) {
      const currentProfile = await prisma.profile.findUnique({
        where: { userId: session.userId },
      });
      if (currentProfile && currentProfile.username.toLowerCase() === cleanUser) {
        isOwnUsername = true;
      }
    }

    if (isOwnUsername) {
      return NextResponse.json({
        available: true,
        message: "This is your current username",
        cleaned: cleanUser,
      });
    }

    const existing = await prisma.profile.findUnique({
      where: { username: cleanUser },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        error: `✕ @${cleanUser} is already taken`,
        cleaned: cleanUser,
      });
    }

    return NextResponse.json({
      available: true,
      message: `✓ @${cleanUser} is available`,
      cleaned: cleanUser,
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ available: false, error: "Failed to check username" }, { status: 500 });
  }
}
