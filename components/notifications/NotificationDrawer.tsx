"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCheck, MessageSquare, Heart, Shield, Sparkles, X } from "lucide-react";
import { NotificationType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";

interface NotificationDrawerProps {
  notifications: NotificationType[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onSelectNotification: (notification: NotificationType) => void;
}

export function NotificationDrawer({
  notifications,
  unreadCount,
  onMarkAllRead,
  onSelectNotification,
}: NotificationDrawerProps) {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "REACTION":
        return <Heart className="w-3 h-3 text-[#FF2D55] fill-[#FF2D55]" />;
      case "MESSAGE":
        return <MessageSquare className="w-3 h-3 text-[#00A884]" />;
      case "SECURITY":
        return <Shield className="w-3 h-3 text-[#FF9500]" />;
      default:
        return <Bell className="w-3 h-3 text-[#007AFF]" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none">
      {/* iOS Header */}
      <div className="px-4 pt-3 pb-2 bg-white/90 dark:bg-[#161618]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] font-bold tracking-tight text-black dark:text-white font-ios leading-none pt-1">
            Alerts
          </h1>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[14px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-1 font-ios"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Read all</span>
            </button>
          )}
        </div>

        {/* iOS Segmented Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-medium transition-all font-ios ${
              filter === "ALL"
                ? "bg-[#00A884] text-white shadow-xs"
                : "bg-[#767680]/12 dark:bg-[#767680]/24 text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-medium transition-all font-ios ${
              filter === "UNREAD"
                ? "bg-[#00A884] text-white shadow-xs"
                : "bg-[#767680]/12 dark:bg-[#767680]/24 text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List Table View */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#8E8E93]">
            <div className="w-14 h-14 rounded-[16px] bg-[#767680]/15 flex items-center justify-center text-[#007AFF] mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <p className="text-[17px] font-semibold text-black dark:text-white font-ios">
              No Notifications
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
              You are all caught up! Important alerts and reactions will appear here.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="relative group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelectNotification(n)}
                className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                  !n.isRead ? "bg-[#007AFF]/5 dark:bg-[#007AFF]/10" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={n.actor?.profile?.avatar}
                    name={n.actor?.profile?.displayName || "System"}
                    size="md"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-[#161618] shadow-xs">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[14px] font-semibold text-black dark:text-white truncate font-ios">
                      {n.title}
                    </span>
                    <span className="text-[11px] text-[#8E8E93] flex-shrink-0">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#8E8E93] dark:text-[#8E8E93] line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] flex-shrink-0 mt-1.5" />
                )}
              </button>
              <div className="ios-separator ml-[64px]" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

