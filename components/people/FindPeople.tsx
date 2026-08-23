"use client";

import React, { useState, useEffect } from "react";
import { Search, MessageSquare, User, Loader2, Bookmark, ChevronRight, QrCode } from "lucide-react";
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

export function FindPeople({ onStartChat, onViewProfile, onOpenLightbox, onOpenQRCode }: FindPeopleProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none">
      {/* iOS Header */}
      <div className="px-4 pt-3 pb-2 bg-white/90 dark:bg-[#161618]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] font-bold tracking-tight text-black dark:text-white font-ios leading-none pt-1">
            Find People
          </h1>

          {onOpenQRCode && (
            <button
              type="button"
              onClick={() => onOpenQRCode("scan")}
              className="p-2 rounded-full text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex items-center gap-1.5 text-[14px] font-semibold"
              title="Scan QR Code"
            >
              <QrCode className="w-5 h-5 stroke-[2]" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          )}
        </div>

        {/* iOS Search Bar */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00A884] font-bold text-[14px]">
            @
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by @username"
            className="w-full pl-8 pr-9 py-1.5 bg-[#767680]/12 dark:bg-[#767680]/24 border-none rounded-[10px] text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none font-ios"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#00A884] animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8E8E93] bg-[#767680]/20 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Discovery List */}
      <div className="flex-1 overflow-y-auto">
        {/* Message Yourself / Notes row */}
        {currentUser && (
          <div className="relative group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors">
            <button
              type="button"
              onClick={() => onStartChat({ id: currentUser.id, username: currentUser.profile.username })}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left"
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
                  <p className="font-semibold text-[16px] text-black dark:text-white truncate font-ios">
                    Message Yourself (You)
                  </p>
                  <p className="text-[13px] text-[#8E8E93] truncate">
                    Saved notes, media, and voice memos
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#C7C7CC] flex-shrink-0" />
            </button>
            <div className="ios-separator ml-[76px]" />
          </div>
        )}

        {results.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#8E8E93]">
            <Search className="w-12 h-12 opacity-30 mb-3" />
            <p className="text-[17px] font-semibold text-black dark:text-white font-ios">
              {query ? `No user found for "${query}"` : "Discover Contacts"}
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
              Search any unique @username to start messaging immediately.
            </p>
          </div>
        ) : (
          results
            .filter((u) => u.userId !== currentUser?.id && u.id !== currentUser?.id)
            .map((user) => (
              <div
                key={user.id || user.username}
                className="relative group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar
                      src={user.avatar}
                      name={user.displayName}
                      username={user.username}
                      size="lg"
                      isOnline={user.isOnline}
                      showOnlineIndicator={true}
                      onClick={() =>
                        onOpenLightbox?.({
                          avatar: user.avatar,
                          name: user.displayName,
                          username: user.username,
                          bio: user.bio,
                          isOnline: user.isOnline,
                        })
                      }
                    />

                    <div className="min-w-0">
                      <span className="font-semibold text-[16px] text-black dark:text-white truncate block font-ios">
                        {user.displayName}
                      </span>
                      <span className="text-[13px] font-medium text-[#00A884] dark:text-[#34D399] truncate block">
                        {formatUsername(user.username)}
                      </span>
                      {user.bio && (
                        <p className="text-[12px] text-[#8E8E93] truncate mt-0.5">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewProfile(user.username)}
                      className="px-3 py-1.5 rounded-[16px] bg-[#767680]/15 hover:bg-[#767680]/25 text-[13px] font-semibold text-black dark:text-white transition-colors"
                    >
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartChat({ id: user.userId || user.id, username: user.username })}
                      className="px-3.5 py-1.5 rounded-[16px] bg-[#007AFF] hover:bg-[#0062CC] text-white text-[13px] font-semibold shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>

                <div className="ios-separator ml-[76px]" />
              </div>
            ))
        )}
      </div>
    </div>
  );
}

