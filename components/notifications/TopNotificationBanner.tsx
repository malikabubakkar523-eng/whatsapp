"use client";

import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/components/auth/AuthContext";
import { MessageSquare, X, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopNotification {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  createdAt: string;
}

// Synthesize a crisp, pleasant messaging chime using Web Audio API
function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.1); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880.0, now + 0.08); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);

    osc1.stop(now + 0.25);
    osc2.stop(now + 0.35);
  } catch (e) {
    // AudioContext blocked before user interaction
  }
}

export function TopNotificationBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState<TopNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewMessage = (data: any) => {
      const msg = data.message || data;
      if (!msg) return;

      // Do not notify for own messages
      if (msg.senderId === user.id) return;

      const senderName = msg.sender?.profile?.displayName || msg.senderName || "New Message";
      const senderAvatar = msg.sender?.profile?.avatar || msg.senderAvatar;
      const content = msg.content || (msg.type === "IMAGE" ? "📷 Photo" : msg.type === "AUDIO" ? "🎤 Voice message" : "New message");

      // Play Sound
      playChimeSound();

      // Set Banner Notification
      setNotification({
        id: msg.id || `${Date.now()}`,
        conversationId: msg.conversationId,
        senderName,
        senderAvatar,
        content,
        createdAt: new Date().toISOString(),
      });
      setVisible(true);

      // Auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4500);

      return () => clearTimeout(timer);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("notification:new", (notif: any) => {
      if (notif.type === "MESSAGE") {
        playChimeSound();
      }
    });

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("notification:new");
    };
  }, [socket, user]);

  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md transition-all duration-300 ease-out transform ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-12 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div
        onClick={() => {
          setVisible(false);
          router.push(`/?chat=${notification.conversationId}`);
        }}
        className="cursor-pointer bg-[#111B21]/95 dark:bg-[#111B21]/95 backdrop-blur-xl border border-[#00A884]/40 dark:border-[#25D366]/30 shadow-2xl shadow-black/60 rounded-2xl p-3.5 flex items-center gap-3.5 hover:border-[#00A884] transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {/* Avatar / Icon */}
        <div className="relative flex-shrink-0">
          {notification.senderAvatar ? (
            <img
              src={notification.senderAvatar}
              alt={notification.senderName}
              className="w-11 h-11 rounded-full object-cover border border-[#00A884]/40"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00A884] to-[#128C7E] flex items-center justify-center text-white font-bold text-base shadow-md">
              {notification.senderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#25D366] border-2 border-[#111B21] rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-[14px] font-bold text-white truncate">
              {notification.senderName}
            </h4>
            <span className="text-[10.5px] text-[#25D366] font-semibold flex items-center gap-1">
              <Volume2 className="w-3 h-3 animate-pulse" /> Just now
            </span>
          </div>
          <p className="text-[12.5px] text-[#8696A0] truncate mt-0.5 font-normal">
            {notification.content}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-[#8696A0] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
