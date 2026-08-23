import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { username } = await params;

    // Find the target user by username
    const targetUser = await prisma.user.findFirst({
      where: {
        profile: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      },
      select: {
        id: true,
        profile: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find shared direct or group conversations between current user and target user
    const sharedConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { members: { some: { userId: session.userId } } },
          { members: { some: { userId: targetUser.id } } },
        ],
      },
      select: { id: true },
    });

    const conversationIds = sharedConversations.map((c) => c.id);

    // Fetch all attachments in those shared conversations (or user's sent media)
    const attachments = await prisma.attachment.findMany({
      where: {
        message: {
          conversationId: { in: conversationIds.length > 0 ? conversationIds : ["non_existent"] },
          isDeleted: false,
          deletedForEveryone: false,
          // exclude opened view once messages
          NOT: {
            AND: [{ isViewOnce: true }, { viewOnceOpened: true }],
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        message: {
          select: {
            id: true,
            senderId: true,
            type: true,
            content: true,
            createdAt: true,
          },
        },
      },
      take: 150,
    });

    const media = attachments.map((att) => {
      let category: "MEDIA" | "DOCS" | "AUDIO" = "DOCS";
      if (
        att.fileType.startsWith("image/") ||
        att.fileType.startsWith("video/") ||
        att.message.type === "IMAGE" ||
        att.message.type === "VIDEO"
      ) {
        category = "MEDIA";
      } else if (
        att.fileType.startsWith("audio/") ||
        att.message.type === "AUDIO"
      ) {
        category = "AUDIO";
      }

      return {
        id: att.id,
        url: att.url,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        duration: att.duration,
        category,
        isMine: att.message.senderId === session.userId,
        caption: att.message.content,
        createdAt: att.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      media,
      counts: {
        total: media.length,
        media: media.filter((m) => m.category === "MEDIA").length,
        docs: media.filter((m) => m.category === "DOCS").length,
        audio: media.filter((m) => m.category === "AUDIO").length,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch user media error:", error);
    return NextResponse.json({ error: "Failed to fetch user media" }, { status: 500 });
  }
}
