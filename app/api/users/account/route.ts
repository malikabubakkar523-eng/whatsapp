import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, verifyPassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm account deletion"),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Password is required" },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password for security
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please enter your current password to confirm deletion." },
        { status: 400 }
      );
    }

    const deletedUsername = user.profile?.username || user.email;

    // Delete user from database - Prisma cascade will remove profile, messages, settings, sessions, etc.
    await prisma.user.delete({
      where: { id: session.userId },
    });

    console.log(`[Account Deletion] User ${deletedUsername} (${session.userId}) was permanently deleted.`);

    const response = NextResponse.json({
      success: true,
      message: "Account and username have been permanently deleted.",
    });

    // Clear session cookie
    response.cookies.delete(AUTH_COOKIE_NAME);

    return response;
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
