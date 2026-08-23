"use client";

import React, { useEffect } from "react";
import { X, Download, MessageSquare, Phone, Video, Share2, Sparkles } from "lucide-react";
import { formatUsername } from "@/utils/username";

interface AvatarLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  name: string;
  username?: string | null;
  bio?: string | null;
  isOnline?: boolean;
  onStartChat?: () => void;
  onStartCall?: (type: "VOICE" | "VIDEO") => void;
}

export function AvatarLightbox({
  isOpen,
  onClose,
  avatarUrl,
  name,
  username,
  bio,
  isOnline,
  onStartChat,
  onStartCall,
}: AvatarLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!avatarUrl) return;
    const link = document.createElement("a");
    link.href = avatarUrl;
    link.download = `${username || "profile"}_photo_hd.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-wa-cardDark/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 text-white space-y-4 backdrop-blur-2xl">
        {/* Top bar with user name and close button */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base sm:text-lg truncate text-white">
              {name}
            </h3>
            {username && (
              <p className="text-xs font-semibold text-brand-400 truncate">
                {formatUsername(username)}
                {isOnline !== undefined && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {avatarUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Download HD Photo"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HD Avatar Display Container */}
        <div className="w-full aspect-square max-w-xs sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-600/30 to-emerald-900/40 flex items-center justify-center border border-white/10 relative group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-700 to-emerald-900 text-white font-extrabold text-6xl shadow-inner">
              {getInitials(name)}
            </div>
          )}

          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/10 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>HD Photo</span>
          </div>
        </div>

        {/* Bio preview if exists */}
        {bio && (
          <p className="text-xs text-center text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full">
            "{bio}"
          </p>
        )}

        {/* Quick actions */}
        <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          {onStartChat && (
            <button
              type="button"
              onClick={() => {
                onStartChat();
                onClose();
              }}
              className="py-2.5 px-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 shadow-lg shadow-brand-600/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}

          {onStartCall && (
            <>
              <button
                type="button"
                onClick={() => {
                  onStartCall("VOICE");
                  onClose();
                }}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex flex-col items-center gap-1 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Audio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onStartCall("VIDEO");
                  onClose();
                }}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex flex-col items-center gap-1 transition-all"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Video</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
