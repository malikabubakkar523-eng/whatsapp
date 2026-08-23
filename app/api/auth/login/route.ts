import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cleanUsername } from "@/utils/username";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const cleanId = identifier.trim();
    const cleanUser = cleanUsername(cleanId);

    // 1. Try finding by email first
    let user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanId.toLowerCase() },
      },
      include: { profile: true, settings: true },
    });

    // 2. If not found by email, try finding by username
    if (!user) {
      const profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { username: cleanUser },
            { username: cleanId.toLowerCase() },
            { username: cleanId },
          ],
        },
        include: {
          user: {
            include: { profile: true, settings: true },
          },
        },
      });
      user = profile?.user || null;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account has been suspended by an administrator. Please contact support." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Auto-heal missing profile if any
    let profile = user.profile;
    if (!profile) {
      const fallbackUser = cleanUser || user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: fallbackUser,
          displayName: fallbackUser,
          isOnline: true,
          lastSeen: new Date(),
        },
      }).catch(() => null);
    } else {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { isOnline: true, lastSeen: new Date() },
      }).catch(() => {});
    }

    // Auto-heal missing settings if any
    let settings = user.settings;
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          notificationsEnabled: true,
          soundEnabled: true,
          theme: "system",
        },
      }).catch(() => null);
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
        settings,
      },
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed. Please check your credentials and try again." },
      { status: 500 }
    );
  }
}
