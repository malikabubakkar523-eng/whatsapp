import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { validateUsername, cleanUsername } from "@/utils/username";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required").max(50),
  username: z.string(),
  bio: z.string().max(200).optional(),
  avatar: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, displayName, username, bio, avatar } = parsed.data;

    // Validate username strictly
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }
    const cleanUser = usernameValidation.cleaned;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if username already exists (strictly case-insensitive)
    const existingUsername = await prisma.profile.findFirst({
      where: {
        username: { equals: cleanUser, mode: "insensitive" },
      },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: `Username @${cleanUser} is already taken. Please choose another username.` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user, profile, and settings in a transaction
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        profile: {
          create: {
            username: cleanUser,
            displayName: displayName.trim(),
            bio: bio?.trim() || "Hey there! I am using ChatFlow 💬",
            avatar: avatar || null,
            isOnline: true,
            lastSeen: new Date(),
          },
        },
        settings: {
          create: {
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
        },
      },
      include: {
        profile: true,
        settings: true,
      },
    });

    // Create session token
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

    // Set HTTP-only cookie
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
    console.error("Registration error:", error);
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target.join(", ") : "email or username";
      return NextResponse.json(
        { error: `An account with this ${field} already exists. Please use a different one.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Registration failed. Please check your information and try again." },
      { status: 500 }
    );
  }
}
