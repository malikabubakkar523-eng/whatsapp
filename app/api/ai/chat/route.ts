import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse, ensureMetaAIConversation, getOrCreateMetaAIBotUser } from "@/lib/ai";
import { z } from "zod";

const aiChatSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  conversationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = session.userId;

    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { prompt, conversationId: requestedConvId } = parsed.data;

    // 1. Get or create Meta AI conversation
    let convId = requestedConvId;
    if (!convId) {
      const conv = await ensureMetaAIConversation(userId);
      convId = conv?.id;
    }

    if (!convId) {
      return NextResponse.json({ error: "Could not initialize AI conversation" }, { status: 500 });
    }

    const aiBot = await getOrCreateMetaAIBotUser();
    if (!aiBot) {
      return NextResponse.json({ error: "Meta AI service unavailable" }, { status: 500 });
    }

    // 2. Fetch recent conversation history
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const history = recentMessages.reverse().map((m) => ({
      role: (m.senderId === aiBot.id ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    }));

    // 3. Save user message to database if not already there
    const userMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: userId,
        content: prompt.trim(),
        type: "TEXT",
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    // 4. Generate AI response
    const aiResponseText = await generateAIResponse(prompt, history);

    // 5. Save AI message to database
    const aiMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: aiBot.id,
        content: aiResponseText,
        type: "TEXT",
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: convId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      userMessage: { ...userMsg, isMine: true, status: "READ" },
      aiMessage: { ...aiMsg, isMine: false, status: "READ" },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
