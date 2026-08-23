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
    const isEmail = identifier.includes("@") && identifier.includes(".");

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase().trim() },
        include: { profile: true, settings: true },
      });
    } else {
      const cleanUser = cleanUsername(identifier);
      const profile = await prisma.profile.findUnique({
        where: { username: cleanUser },
        include: {
          user: {
            include: { profile: true, settings: true },
          },
        },
      });
      user = profile?.user;
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

    // Update last seen and online status
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: { isOnline: true, lastSeen: new Date() },
      });
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
        profile: user.profile,
        settings: user.settings,
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
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
