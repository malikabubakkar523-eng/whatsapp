import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (session) {
      // Set user offline
      await prisma.profile.updateMany({
        where: { userId: session.userId },
        data: { isOnline: false, lastSeen: new Date() },
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}
