import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// In-memory active calls signaling store
interface ActiveCallState {
  callId: string;
  conversationId: string;
  callerId: string;
  targetUserId: string;
  caller: {
    userId: string;
    displayName: string;
    username: string;
    avatar?: string | null;
  };
  callType: "VOICE" | "VIDEO";
  status: "RINGING" | "ACCEPTED" | "ENDED";
  createdAt: number;
  signals: Array<{
    senderId: string;
    signal: any;
    timestamp: number;
  }>;
}

const activeCalls = new Map<string, ActiveCallState>();

// Clean up stale calls older than 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, call] of activeCalls.entries()) {
    if (now - call.createdAt > 300000 || call.status === "ENDED") {
      activeCalls.delete(id);
    }
  }
}, 60000);

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const { action, callId, targetUserId, conversationId, callType, caller, signal } = body;

    if (action === "INVITE") {
      const newCallId = callId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      activeCalls.set(newCallId, {
        callId: newCallId,
        conversationId,
        callerId: session.userId,
        targetUserId,
        caller: caller || {
          userId: session.userId,
          displayName: "User",
          username: "user",
        },
        callType: callType || "VOICE",
        status: "RINGING",
        createdAt: Date.now(),
        signals: [],
      });

      return NextResponse.json({ success: true, callId: newCallId });
    }

    if (action === "ACCEPT") {
      const call = activeCalls.get(callId);
      if (call) {
        call.status = "ACCEPTED";
      }
      return NextResponse.json({ success: true });
    }

    if (action === "END" || action === "REJECT") {
      const call = activeCalls.get(callId);
      if (call) {
        call.status = "ENDED";
      }
      return NextResponse.json({ success: true });
    }

    if (action === "SIGNAL") {
      const call = activeCalls.get(callId);
      if (call && signal) {
        call.signals.push({
          senderId: session.userId,
          signal,
          timestamp: Date.now(),
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process signal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get("callId");

    // Check for any incoming ringing calls targeted at this user
    if (!callId) {
      const incoming = Array.from(activeCalls.values()).find(
        (c) => c.targetUserId === session.userId && c.status === "RINGING" && Date.now() - c.createdAt < 45000
      );

      return NextResponse.json({ incoming: incoming || null });
    }

    // Get specific call state and pending signals for this user
    const call = activeCalls.get(callId);
    if (!call) {
      return NextResponse.json({ status: "ENDED" });
    }

    const unreadSignals = call.signals.filter((s) => s.senderId !== session.userId);

    return NextResponse.json({
      status: call.status,
      callType: call.callType,
      signals: unreadSignals.map((s) => s.signal),
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
