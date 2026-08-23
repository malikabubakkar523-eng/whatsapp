"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  User,
  Loader2,
  Bookmark,
  ChevronRight,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { useAuth } from "@/components/auth/AuthContext";

interface UserResult {
  id: string;
  userId?: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen?: string | Date;
}

interface FindPeopleProps {
  onStartChat: (user: { id?: string; username: string }) => void;
  onViewProfile: (username: string) => void;
  onOpenLightbox?: (data: {
    avatar?: string | null;
    name: string;
    username?: string | null;
    bio?: string | null;
    isOnline?: boolean;
  }) => void;
  onOpenQRCode?: (tab?: "my-code" | "scan") => void;
}

export function FindPeople({
  onStartChat,
  onViewProfile,
  onOpenLightbox,
  onOpenQRCode,
}: FindPeopleProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ONLINE">("ALL");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.users || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = results
    .filter((u) => u.userId !== currentUser?.id && u.id !== currentUser?.id)
    .filter((u) => (filter === "ONLINE" ? u.isOnline : true));

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none">
      {/* iOS Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white/90 dark:bg-[#161618]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] space-y-3 sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[30px] sm:text-[34px] font-extrabold tracking-tight text-black dark:text-white font-ios leading-none pt-1">
              Find People
            </h1>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">
              Search by name or @username to start chatting
            </p>
          </div>

          {onOpenQRCode && (
            <button
              type="button"
              onClick={() => onOpenQRCode("scan")}
              className="p-2 rounded-full text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex items-center gap-1.5 text-[14px] font-semibold cursor-pointer"
              title="Scan QR Code"
            >
              <QrCode className="w-5 h-5 stroke-[2]" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00A884] font-bold text-[14px]">
            @
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username..."
            autoFocus
            className="w-full pl-8 pr-9 py-2 bg-[#767680]/12 dark:bg-[#767680]/24 border-none rounded-[12px] text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#00A884] font-ios transition-all"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#00A884] animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8E8E93] hover:text-black dark:hover:text-white bg-[#767680]/20 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-[#00A884] text-white shadow-xs"
                : "bg-black/[0.05] dark:bg-white/[0.08] text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            All Users ({results.filter((u) => u.userId !== currentUser?.id && u.id !== currentUser?.id).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("ONLINE")}
            className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === "ONLINE"
                ? "bg-[#34C759] text-white shadow-xs"
                : "bg-black/[0.05] dark:bg-white/[0.08] text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span>Online Now</span>
          </button>
        </div>
      </div>

      {/* Discovery List */}
      <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.06]">
        {/* Message Yourself / Notes Row */}
        {currentUser && !query && filter === "ALL" && (
          <div
            onClick={() =>
              onStartChat({
                id: currentUser.id,
                username: currentUser.profile.username,
              })
            }
            className="px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative">
                <Avatar
                  src={currentUser.profile.avatar}
                  name={currentUser.profile.displayName}
                  size="lg"
                />
                <span className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-[#00A884] text-white shadow-xs">
                  <Bookmark className="w-2.5 h-2.5" />
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-[16px] text-black dark:text-white truncate font-ios">
                  Message Yourself (You)
                </p>
                <p className="text-[13px] text-[#8E8E93] truncate">
                  Saved notes, media, and voice memos
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-[14px] bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1 hover:bg-[#00A884] hover:text-white transition-all active:scale-95"
            >
              <span>Chat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {filteredResults.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#8E8E93]">
            <Search className="w-12 h-12 opacity-30 mb-3 text-[#00A884]" />
            <p className="text-[17px] font-bold text-black dark:text-white font-ios">
              {query ? `No users found for "${query}"` : "Discover Contacts"}
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
              Search by name or unique @username to start instant real-time chats.
            </p>
          </div>
        ) : (
          filteredResults.map((targetUser) => (
            <div
              key={targetUser.id || targetUser.username}
              onClick={() =>
                onStartChat({
                  id: targetUser.userId || targetUser.id,
                  username: targetUser.username,
                })
              }
              className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar
                  src={targetUser.avatar}
                  name={targetUser.displayName}
                  username={targetUser.username}
                  size="lg"
                  isOnline={targetUser.isOnline}
                  showOnlineIndicator={true}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox?.({
                      avatar: targetUser.avatar,
                      name: targetUser.displayName,
                      username: targetUser.username,
                      bio: targetUser.bio,
                      isOnline: targetUser.isOnline,
                    });
                  }}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[16px] text-black dark:text-white truncate block font-ios">
                      {targetUser.displayName}
                    </span>
                    {targetUser.username === "meta_ai" && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#00D2FF]/20 via-[#9B51E0]/20 to-[#FF2A6D]/20 text-[#007AFF] dark:text-[#38BDF8]">
                        AI ✨
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-[#00A884] dark:text-[#34D399] truncate block">
                    {formatUsername(targetUser.username)}
                  </span>
                  {targetUser.bio && (
                    <p className="text-[12px] text-[#8E8E93] truncate mt-0.5">
                      {targetUser.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onViewProfile(targetUser.username)}
                  className="px-3 py-1.5 rounded-[14px] bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[13px] font-bold text-black dark:text-white transition-colors cursor-pointer"
                >
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onStartChat({
                      id: targetUser.userId || targetUser.id,
                      username: targetUser.username,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-[14px] bg-[#00A884] hover:bg-[#009272] text-white text-[13px] font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
