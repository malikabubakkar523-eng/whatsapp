"use client";

import React, { useState, useEffect } from "react";
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Plus, Info } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { format, isToday, isYesterday } from "date-fns";

interface CallsListProps {
  onStartCallWithUser: (user: {
    id?: string;
    username: string;
    callType: "VOICE" | "VIDEO";
    displayName?: string;
    avatar?: string | null;
  }) => void;
  onOpenFindPeople: () => void;
}

export function CallsList({ onStartCallWithUser, onOpenFindPeople }: CallsListProps) {
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "missed">("all");

  const fetchCalls = async () => {
    try {
      const res = await fetch("/api/calls");
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const formatCallTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, "h:mm a");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "M/d/yy");
  };

  const filteredCalls = calls.filter((c) => {
    if (filter === "missed" && c.status !== "MISSED") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = c.contact?.displayName || "";
    const username = c.contact?.username || "";
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none">
      {/* iOS Top Navigation Header */}
      <div className="px-4 pt-3 pb-2 bg-white/90 dark:bg-[#161618]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-[#007AFF] dark:text-[#0A84FF] text-[17px] font-normal hover:opacity-75 transition-opacity font-ios"
          >
            Edit
          </button>

          {/* iOS Segmented Control: All / Missed */}
          <div className="flex bg-[#767680]/15 dark:bg-[#767680]/25 p-0.5 rounded-[9px]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-4 py-1 text-[13px] font-semibold rounded-[7px] transition-all font-ios ${
                filter === "all"
                  ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-black dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("missed")}
              className={`px-4 py-1 text-[13px] font-semibold rounded-[7px] transition-all font-ios ${
                filter === "missed"
                  ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-black dark:hover:text-white"
              }`}
            >
              Missed
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenFindPeople}
            className="text-[#007AFF] dark:text-[#0A84FF] hover:opacity-75 transition-opacity"
            title="Start new call"
          >
            <Plus className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Large Title */}
        <h1 className="text-[34px] font-bold tracking-tight text-black dark:text-white font-ios leading-none pt-1">
          Calls
        </h1>

        {/* iOS Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-4 py-1.5 bg-[#767680]/12 dark:bg-[#767680]/24 border-none rounded-[10px] text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none font-ios"
          />
        </div>
      </div>

      {/* Calls List Table View */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3.5 animate-pulse">
                <div className="w-[52px] h-[52px] bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-black/[0.06] dark:bg-white/[0.08] rounded w-1/3" />
                  <div className="h-3 bg-black/[0.04] dark:bg-white/[0.05] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#8E8E93]">
            <Phone className="w-12 h-12 opacity-30 mb-3" />
            <p className="text-[17px] font-semibold text-black dark:text-white font-ios">
              No Recent Calls
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
              Calls made or received using ChatFlow will appear here.
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const isMissed = call.status === "MISSED";
            const isOutgoing = call.status === "OUTGOING";
            const isVideo = call.callType === "VIDEO";

            return (
              <div
                key={call.id}
                className="relative group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar
                      src={call.contact?.avatar}
                      name={call.contact?.displayName}
                      username={call.contact?.username}
                      size="lg"
                      isOnline={call.contact?.isOnline}
                      showOnlineIndicator={true}
                    />

                    <div className="min-w-0">
                      <p
                        className={`font-semibold text-[16px] truncate font-ios ${
                          isMissed ? "text-[#FF3B30]" : "text-black dark:text-white"
                        }`}
                      >
                        {call.contact?.displayName || "User"}
                      </p>

                      <div className="flex items-center gap-1.5 text-[13px] text-[#8E8E93] mt-0.5">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0" />
                        ) : isOutgoing ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-[#34C759] flex-shrink-0" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#007AFF] flex-shrink-0" />
                        )}

                        <span className="truncate">
                          {isVideo ? "Video" : "Audio"} • {formatCallTime(call.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call Back Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onStartCallWithUser({
                          id: call.contact?.id,
                          username: call.contact?.username,
                          displayName: call.contact?.displayName,
                          avatar: call.contact?.avatar,
                          callType: "VOICE",
                        })
                      }
                      className="p-2 rounded-full text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
                      title="Voice Call"
                    >
                      <Phone className="w-5 h-5 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onStartCallWithUser({
                          id: call.contact?.id,
                          username: call.contact?.username,
                          displayName: call.contact?.displayName,
                          avatar: call.contact?.avatar,
                          callType: "VIDEO",
                        })
                      }
                      className="p-2 rounded-full text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
                      title="Video Call"
                    >
                      <Video className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* Inset hairline separator starting from text content */}
                <div className="ios-separator ml-[76px]" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

