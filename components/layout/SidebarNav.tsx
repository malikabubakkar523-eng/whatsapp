"use client";

import React from "react";
import {
  MessageSquare,
  Search,
  Users,
  Bell,
  Settings,
  ShieldAlert,
  Moon,
  Sun,
  LogOut,
  Phone,
  CircleDot,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";

export type NavTab = "chats" | "status" | "calls" | "find" | "groups" | "notifications" | "settings" | "admin";

interface SidebarNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
}

export function SidebarNav({
  activeTab,
  setActiveTab,
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
}: SidebarNavProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!user) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <aside className="w-16 lg:w-[76px] bg-[#F6F6F6] dark:bg-[#161618] border-r border-black/[0.08] dark:border-white/[0.08] flex flex-col items-center justify-between py-4 select-none z-30 flex-shrink-0">
      {/* Top App Branding Icon */}
      <div className="flex flex-col items-center gap-5 w-full">
        <button
          type="button"
          onClick={() => setActiveTab("chats")}
          className="w-11 h-11 rounded-[14px] bg-[#00A884] dark:bg-[#00A884] flex items-center justify-center text-white shadow-sm shadow-[#00A884]/30 hover:opacity-90 active:scale-95 transition-all"
        >
          <MessageSquare className="w-5 h-5 fill-white/20 stroke-[2.2]" />
        </button>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {/* Chats */}
          <button
            type="button"
            onClick={() => setActiveTab("chats")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "chats"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Chats</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#34C759] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Status / Updates */}
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "status"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Status / Updates"
          >
            <CircleDot className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Status</span>
          </button>

          {/* Calls */}
          <button
            type="button"
            onClick={() => setActiveTab("calls")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "calls"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Calls"
          >
            <Phone className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Calls</span>
          </button>

          {/* Find People by @username */}
          <button
            type="button"
            onClick={() => setActiveTab("find")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "find"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Find by @Username"
          >
            <Search className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Find</span>
          </button>

          {/* Groups */}
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "groups"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Groups"
          >
            <Users className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Groups</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
              activeTab === "notifications"
                ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399] font-semibold"
                : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Alerts</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3B30] ring-2 ring-white dark:ring-[#161618]" />
            )}
          </button>

          {/* Admin Panel (If user is Admin) */}
          {user.role === "ADMIN" && (
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`w-full py-2.5 rounded-[12px] flex flex-col items-center justify-center relative transition-all group active:scale-95 ${
                activeTab === "admin"
                  ? "bg-[#FF3B30]/15 text-[#FF3B30] font-semibold"
                  : "text-[#FF3B30]/70 hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
              }`}
              title="Admin Moderation"
            >
              <ShieldAlert className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] mt-1 font-medium hidden lg:block tracking-tight">Admin</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
        >
          {resolvedTheme === "dark" ? <Sun className="w-5 h-5 stroke-[2]" /> : <Moon className="w-5 h-5 stroke-[2]" />}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all active:scale-95 ${
            activeTab === "settings"
              ? "bg-[#00A884]/15 text-[#00A884] dark:bg-[#00A884]/20 dark:text-[#34D399]"
              : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5 stroke-[2]" />
        </button>

        {/* User Profile Avatar */}
        <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] w-full flex flex-col items-center gap-2">
          <div className="relative group cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab("settings")}>
            <Avatar
              src={user.profile.avatar}
              name={user.profile.displayName}
              username={user.profile.username}
              size="sm"
              isOnline={true}
              showOnlineIndicator={true}
            />
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 active:scale-95 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

