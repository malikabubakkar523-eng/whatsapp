"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Trash2,
  Ban,
  Activity,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { format } from "date-fns";

interface AdminDashboardProps {
  onClose?: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "users" | "reports">("metrics");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load stats
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  // Load users
  useEffect(() => {
    if (activeTab === "users") {
      fetch(`/api/admin/users?q=${encodeURIComponent(userQuery)}`)
        .then((r) => r.json())
        .then((d) => setUsers(d.users || []))
        .catch((e) => console.error(e));
    }
  }, [activeTab, userQuery]);

  // Load reports
  useEffect(() => {
    if (activeTab === "reports") {
      fetch("/api/admin/reports")
        .then((r) => r.json())
        .then((d) => setReports(d.reports || []))
        .catch((e) => console.error(e));
    }
  }, [activeTab]);

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isSuspended: !currentSuspended }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, isSuspended: !currentSuspended } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveReport = async (reportId: string, status: string, deleteContent = false) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, deleteContent }),
      });
      if (res.ok) {
        setReports(reports.map((r) => (r.id === reportId ? { ...r, status } : r)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl h-[650px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                ChatFlow Administration & Moderation
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System monitoring, safety controls & report queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("metrics")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "metrics"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "users"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Users Directory
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "reports"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Reports ({stats?.pendingReports || 0})
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Total Accounts
                    </span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stats?.totalUsers ?? "-"}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {stats?.activeUsers ?? 0} online now
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Active Messages
                    </span>
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stats?.totalMessages ?? "-"}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Across direct & groups
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      Channels & Groups
                    </span>
                    <Activity className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stats?.totalGroups ?? "-"}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {stats?.totalConversations ?? 0} direct chats
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Pending Reports
                    </span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {stats?.pendingReports ?? 0}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {stats?.suspendedUsers ?? 0} suspended accounts
                  </span>
                </div>
              </div>

              {/* Platform Info Card */}
              <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  🛡️ ChatFlow Trust & Safety System
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  ChatFlow enforces strict username uniqueness, encrypted session tokens, and realtime moderation. Users can report inappropriate content or accounts which appear in the moderation queue for immediate action.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search user by display name, @username, or email..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={u.profile?.avatar}
                        name={u.profile?.displayName}
                        username={u.profile?.username}
                        size="md"
                        isOnline={u.profile?.isOnline}
                        showOnlineIndicator={true}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {u.profile?.displayName}
                          </span>
                          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                            {formatUsername(u.profile?.username)}
                          </span>
                          {u.role === "ADMIN" && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold">
                              ADMIN
                            </span>
                          )}
                          {u.isSuspended && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-[9px] font-bold">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {u.email} • Joined {format(new Date(u.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {u.role !== "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          u.isSuspended
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-red-50 dark:bg-red-950/50 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60"
                        }`}
                      >
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS QUEUE */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No pending moderation reports in the queue!
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold">
                            {report.targetType} REPORT
                          </span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Reason: {report.reason}
                          </span>
                        </div>

                        <span className="text-[10px] text-gray-400">
                          {format(new Date(report.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>

                      {report.details && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          "{report.details}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                        <span className="text-gray-400 text-[11px]">
                          Reported by: {report.reporter?.profile?.displayName} (
                          {formatUsername(report.reporter?.profile?.username)})
                        </span>

                        <div className="flex items-center gap-1.5">
                          {report.targetType === "MESSAGE" && report.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(report.id, "RESOLVED", true)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Message</span>
                            </button>
                          )}

                          {report.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleResolveReport(report.id, "RESOLVED")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px]"
                              >
                                Resolve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveReport(report.id, "DISMISSED")}
                                className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-[11px]"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                          {report.status !== "PENDING" && (
                            <span className="text-[11px] font-bold text-gray-400">
                              Status: {report.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
