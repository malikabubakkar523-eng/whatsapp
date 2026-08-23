import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const settingsSchema = z.object({
  discoverability: z.enum(["EVERYONE", "RESTRICTED", "NOBODY"]).optional(),
  onlineStatusPrivacy: z.enum(["EVERYONE", "CONTACTS", "NOBODY"]).optional(),
  lastSeenPrivacy: z.enum(["EVERYONE", "CONTACTS", "NOBODY"]).optional(),
  profilePicturePrivacy: z.enum(["EVERYONE", "CONTACTS", "NOBODY"]).optional(),
  readReceiptsEnabled: z.boolean().optional(),
  typingIndicatorEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.userId },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid settings payload" },
        { status: 400 }
      );
    }

    const updated = await prisma.userSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
