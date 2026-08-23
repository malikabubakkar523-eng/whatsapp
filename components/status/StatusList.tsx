"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Camera,
  Pencil,
  Eye,
  Heart,
  Loader2,
  Sparkles,
  Search,
} from "lucide-react";
import { UserStatusType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { formatDistanceToNow } from "date-fns";
import { StatusCreatorModal } from "./StatusCreatorModal";
import { StatusViewerModal } from "./StatusViewerModal";

interface StatusListProps {
  currentUser: any;
  onStartChatWithUser?: (username: string) => void;
}

export function StatusList({ currentUser, onStartChatWithUser }: StatusListProps) {
  const [statuses, setStatuses] = useState<UserStatusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [activeViewerStatuses, setActiveViewerStatuses] = useState<UserStatusType[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStatuses = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.statuses || []);
      }
    } catch (e) {
      console.error("Fetch statuses error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const myStatuses = statuses.filter((s) => s.userId === currentUser?.id);
  const otherStatuses = statuses.filter((s) => s.userId !== currentUser?.id);

  // Group other statuses by user
  const groupedByUser = otherStatuses.reduce((acc, status) => {
    const uId = status.userId;
    if (!acc[uId]) {
      acc[uId] = [];
    }
    acc[uId].push(status);
    return acc;
  }, {} as Record<string, UserStatusType[]>);

  const userStatusGroups = Object.values(groupedByUser);
  const recentUpdates = userStatusGroups.filter((group) => group.some((s) => !s.isViewedByMe));
  const viewedUpdates = userStatusGroups.filter((group) => group.every((s) => s.isViewedByMe));

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none border-r border-black/[0.08] dark:border-white/[0.08] relative">
      {/* iOS Top Navigation Header */}
      <div className="pt-3 px-4 pb-2 bg-[#F6F6F6]/90 dark:bg-[#1C1C1E]/90 ios-blur sticky top-0 z-20 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[17px] font-semibold text-[#007AFF] font-ios">
            Privacy
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreator(true)}
              className="text-[#007AFF] dark:text-[#0A84FF] p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              title="New Status"
            >
              <Camera className="w-5 h-5 stroke-[1.9]" />
            </button>
          </div>
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-black dark:text-white font-ios leading-none mb-2">
          Updates
        </h1>

        {/* Search */}
        <div className="relative pb-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search status updates"
            className="w-full pl-9 pr-4 py-1.5 bg-[#767680]/12 dark:bg-[#767680]/24 border-none rounded-[10px] text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none font-normal"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* "My Status" Row */}
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2 px-1">
            Status
          </h3>
          <div
            onClick={() => {
              if (myStatuses.length > 0) {
                setActiveViewerStatuses(myStatuses);
              } else {
                setShowCreator(true);
              }
            }}
            className="flex items-center gap-3.5 p-3 rounded-[18px] bg-[#F2F2F7] dark:bg-[#2C2C2E] cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <div className="relative">
              <div
                className={`p-0.5 rounded-full ${
                  myStatuses.length > 0
                    ? "ring-2 ring-[#00A884] ring-offset-2 ring-offset-white dark:ring-offset-[#1C1C1E]"
                    : ""
                }`}
              >
                <Avatar
                  src={currentUser?.profile?.avatar}
                  name={currentUser?.profile?.displayName}
                  username={currentUser?.profile?.username}
                  size="md"
                />
              </div>
              {myStatuses.length === 0 && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00A884] text-white flex items-center justify-center border-2 border-white dark:border-[#2C2C2E]">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[16px] text-black dark:text-white font-ios leading-tight">
                My Status
              </h4>
              <p className="text-[13px] text-[#8E8E93] truncate mt-0.5">
                {myStatuses.length > 0
                  ? `${myStatuses.length} update${myStatuses.length > 1 ? "s" : ""} • Tap to view`
                  : "Tap to add status update"}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreator(true);
              }}
              className="p-2 rounded-full bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-xs active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Recent Updates */}
            {recentUpdates.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8E8E93] px-1">
                  Recent updates
                </h3>
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {recentUpdates.map((group) => {
                    const first = group[0];
                    const user = first.user;
                    const latestTime = group[group.length - 1].createdAt;

                    return (
                      <div
                        key={first.userId}
                        onClick={() => setActiveViewerStatuses(group)}
                        className="flex items-center gap-3.5 py-2.5 px-2 rounded-[16px] cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="p-0.5 rounded-full ring-2 ring-[#00A884] ring-offset-2 ring-offset-white dark:ring-offset-[#161618]">
                          <Avatar
                            src={user?.profile?.avatar}
                            name={user?.profile?.displayName}
                            username={user?.profile?.username}
                            size="md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[15px] text-black dark:text-white font-ios leading-tight truncate">
                            {user?.profile?.displayName || "User"}
                          </h4>
                          <p className="text-[12px] text-[#8E8E93] mt-0.5">
                            {formatDistanceToNow(new Date(latestTime), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Viewed Updates */}
            {viewedUpdates.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8E8E93] px-1">
                  Viewed updates
                </h3>
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {viewedUpdates.map((group) => {
                    const first = group[0];
                    const user = first.user;
                    const latestTime = group[group.length - 1].createdAt;

                    return (
                      <div
                        key={first.userId}
                        onClick={() => setActiveViewerStatuses(group)}
                        className="flex items-center gap-3.5 py-2.5 px-2 rounded-[16px] cursor-pointer opacity-75 hover:opacity-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
                      >
                        <div className="p-0.5 rounded-full ring-2 ring-[#8E8E93]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#161618]">
                          <Avatar
                            src={user?.profile?.avatar}
                            name={user?.profile?.displayName}
                            username={user?.profile?.username}
                            size="md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[15px] text-black dark:text-white font-ios leading-tight truncate">
                            {user?.profile?.displayName || "User"}
                          </h4>
                          <p className="text-[12px] text-[#8E8E93] mt-0.5">
                            {formatDistanceToNow(new Date(latestTime), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {userStatusGroups.length === 0 && myStatuses.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-3 text-[#8E8E93]">
                <div className="w-16 h-16 rounded-full bg-[#00A884]/15 text-[#00A884] flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-[16px] text-black dark:text-white font-ios">
                    No status updates
                  </p>
                  <p className="text-[13px] text-[#8E8E93] max-w-xs mt-1">
                    Status updates disappear after 24 hours. Tap below to share your first status!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-20 md:bottom-6 right-6 flex flex-col gap-3 z-30">
        <button
          type="button"
          onClick={() => setShowCreator(true)}
          className="w-12 h-12 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform border border-black/[0.08] dark:border-white/[0.1]"
          title="Text Status"
        >
          <Pencil className="w-5 h-5 text-[#00A884]" />
        </button>

        <button
          type="button"
          onClick={() => setShowCreator(true)}
          className="w-14 h-14 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          title="Camera Status"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      {showCreator && (
        <StatusCreatorModal
          onClose={() => setShowCreator(false)}
          onStatusCreated={fetchStatuses}
        />
      )}

      {activeViewerStatuses && (
        <StatusViewerModal
          statuses={activeViewerStatuses}
          currentUserId={currentUser?.id}
          onClose={() => {
            setActiveViewerStatuses(null);
            fetchStatuses();
          }}
          onReply={(username, text) => {
            onStartChatWithUser?.(username);
          }}
        />
      )}
    </div>
  );
}
