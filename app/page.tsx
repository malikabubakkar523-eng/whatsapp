"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { SidebarNav, NavTab } from "@/components/layout/SidebarNav";
import { ChatList } from "@/components/chat/ChatList";
import { ChatArea } from "@/components/chat/ChatArea";
import { CallsList } from "@/components/calls/CallsList";
import { FindPeople } from "@/components/people/FindPeople";
import { GroupManager } from "@/components/groups/GroupManager";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { ReportModal } from "@/components/reports/ReportModal";
import { AvatarLightbox } from "@/components/ui/AvatarLightbox";
import { QRCodeModal } from "@/components/qr/QRCodeModal";
import { StatusList } from "@/components/status/StatusList";
import { WebRTCCallModal, ActiveCallData } from "@/components/call/WebRTCCallModal";
import { ConversationType, MessageTypeData, NotificationType, MessageType } from "@/types";
import { getSocket } from "@/lib/socket";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { playMessageSound, playSentSound } from "@/lib/sound";
import {
  MessageSquare,
  Search,
  Users,
  Bell,
  Settings,
  ShieldAlert,
  Loader2,
  Phone,
  LogOut,
  Moon,
  Sun,
  CircleDot,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function AppDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout, updateProfile } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>("chats");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Data State
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageTypeData[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Presence & Typing
  const [typingUsers, setTypingUsers] = useState<Record<string, { username: string; displayName: string }>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Modals & Popups
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState<"my-code" | "scan" | null>(null);
  const [viewProfileUsername, setViewProfileUsername] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: "USER" | "MESSAGE" | "GROUP"; id: string } | null>(null);
  const [lightboxTarget, setLightboxTarget] = useState<{
    avatar?: string | null;
    name: string;
    username?: string | null;
    bio?: string | null;
    isOnline?: boolean;
  } | null>(null);
  const [activeWebRTCCall, setActiveWebRTCCall] = useState<ActiveCallData | null>(null);

  const activeConvRef = useRef<string | null>(null);
  activeConvRef.current = selectedConversationId;

  // 1. Auth check
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/welcome");
    }
  }, [user, isAuthLoading, router]);

  // 2. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 3. Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchNotifications();
    }
  }, [user, fetchConversations, fetchNotifications]);

  // 4. Fetch Messages
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const socket = getSocket();
    socket.emit("conversation:join", { conversationId: selectedConversationId });

    setIsLoadingMessages(true);
    fetch(`/api/conversations/${selectedConversationId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch((err) => console.error("Fetch messages error:", err))
      .finally(() => setIsLoadingMessages(false));

    return () => {
      socket.emit("conversation:leave", { conversationId: selectedConversationId });
    };
  }, [selectedConversationId]);

  // 5. Setup Real-time Sockets (Messages, Audio Alert Chimes, Profile Updates)
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleStatus = (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (!c.isGroup && c.otherUser && c.otherUser.id === data.userId) {
            return {
              ...c,
              otherUser: {
                ...c.otherUser,
                isOnline: data.isOnline,
                lastSeen: data.lastSeen || c.otherUser.lastSeen,
              },
            };
          }
          return c;
        })
      );
    };

    // Real-time Profile Avatar & Bio update broadcast
    const handleProfileUpdated = (data: {
      userId: string;
      avatar?: string | null;
      displayName?: string;
      bio?: string;
    }) => {
      // 1. Update conversations
      setConversations((prev) =>
        prev.map((c) => {
          if (!c.isGroup && c.otherUser && c.otherUser.id === data.userId) {
            return {
              ...c,
              otherUser: {
                ...c.otherUser,
                ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
                ...(data.displayName ? { displayName: data.displayName } : {}),
                ...(data.bio !== undefined ? { bio: data.bio } : {}),
              },
            };
          }
          return c;
        })
      );

      // 2. Update message senders
      setMessages((prev) =>
        prev.map((m) => {
          if (m.senderId === data.userId && m.sender?.profile) {
            return {
              ...m,
              sender: {
                ...m.sender,
                profile: {
                  ...m.sender.profile,
                  ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
                  ...(data.displayName ? { displayName: data.displayName } : {}),
                },
              },
            };
          }
          return m;
        })
      );

      // 3. Update logged in user if own update
      if (data.userId === user.id) {
        updateProfile({
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.displayName ? { displayName: data.displayName } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
        });
      }
    };

    const handleNewMessage = (newMsg: MessageTypeData) => {
      // Play audio notification chime for incoming messages (except for archived or muted chats)
      if (newMsg.senderId !== user.id) {
        try {
          const archived = JSON.parse(localStorage.getItem("chatflow_archived_chats") || "[]");
          const muted = JSON.parse(localStorage.getItem("chatflow_muted_chats") || "[]");
          if (!archived.includes(newMsg.conversationId) && !muted.includes(newMsg.conversationId)) {
            playMessageSound();
          }
        } catch (e) {
          playMessageSound();
        }
      }

      if (activeConvRef.current === newMsg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        socket.emit("message:read", {
          messageId: newMsg.id,
          conversationId: newMsg.conversationId,
        });
      }

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === newMsg.conversationId);
        if (existing) {
          const isCurrent = activeConvRef.current === newMsg.conversationId;
          const updated = {
            ...existing,
            lastMessage: newMsg,
            lastMessageAt: newMsg.createdAt,
            unreadCount: isCurrent ? 0 : (existing.unreadCount || 0) + 1,
          };
          return [updated, ...prev.filter((c) => c.id !== newMsg.conversationId)];
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    const handleStatusUpdate = (data: { messageId: string; status: "DELIVERED" | "READ"; userId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, status: data.status } : m))
      );
    };

    const handleReactionUpdate = (data: { messageId: string; reaction: any; action: string }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== data.messageId) return m;
          let reactions = [...(m.reactions || [])];
          if (data.action === "removed") {
            reactions = reactions.filter(
              (r) => !(r.emoji === data.reaction.emoji && r.userId === data.reaction.userId)
            );
          } else {
            reactions.push(data.reaction);
          }
          return { ...m, reactions };
        })
      );
    };

    const handleDeleted = (data: { messageId: string; forEveryone: boolean }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, isDeleted: true, deletedForEveryone: data.forEveryone, content: "This message was deleted" }
            : m
        )
      );
    };

    const handleTypingStart = (data: { conversationId: string; userId: string; username: string; displayName: string }) => {
      if (activeConvRef.current === data.conversationId) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: { username: data.username, displayName: data.displayName },
        }));
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (activeConvRef.current === data.conversationId) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    };

    const handleIncomingCall = (data: any) => {
      if (!data?.caller) return;
      playMessageSound();
      setActiveWebRTCCall({
        callId: data.callId || `call_${Date.now()}`,
        conversationId: data.conversationId || "",
        otherUser: {
          id: data.caller.userId,
          displayName: data.caller.displayName,
          username: data.caller.username,
          avatar: data.caller.avatar,
        },
        callType: data.callType || "VOICE",
        isIncoming: true,
      });
    };

    const handleCallEnded = () => {
      setActiveWebRTCCall(null);
    };

    socket.on("user:status", handleStatus);
    socket.on("user:profile_updated", handleProfileUpdated);
    socket.on("message:new", handleNewMessage);
    socket.on("message:status_update", handleStatusUpdate);
    socket.on("message:reaction_update", handleReactionUpdate);
    socket.on("message:deleted", handleDeleted);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("user:status", handleStatus);
      socket.off("user:profile_updated", handleProfileUpdated);
      socket.off("message:new", handleNewMessage);
      socket.off("message:status_update", handleStatusUpdate);
      socket.off("message:reaction_update", handleReactionUpdate);
      socket.off("message:deleted", handleDeleted);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:ended", handleCallEnded);
    };
  }, [user, fetchConversations, updateProfile]);

  // Periodic background auto-sync (Every 3s for Vercel Serverless / Multi-device sync)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      // 1. Sync conversations
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) {
            setConversations(data.conversations);
          }
        }
      } catch (e) {}

      // 2. Sync active conversation messages
      if (activeConvRef.current) {
        try {
          const mRes = await fetch(`/api/conversations/${activeConvRef.current}/messages`);
          if (mRes.ok) {
            const mData = await mRes.json();
            if (mData.messages && mData.messages.length > 0) {
              setMessages(mData.messages);
            }
          }
        } catch (e) {}
      }

      // 3. Check for incoming WebRTC calls via REST fallback
      try {
        const cRes = await fetch("/api/calls/signal");
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.incoming && !activeWebRTCCall) {
            playMessageSound();
            setActiveWebRTCCall({
              callId: cData.incoming.callId,
              conversationId: cData.incoming.conversationId,
              otherUser: {
                id: cData.incoming.caller.userId,
                displayName: cData.incoming.caller.displayName,
                username: cData.incoming.caller.username,
                avatar: cData.incoming.caller.avatar,
              },
              callType: cData.incoming.callType || "VOICE",
              isIncoming: true,
            });
          }
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [user, activeWebRTCCall]);

  // Actions
  const handleStartChatWithUser = async (target: { id?: string; username: string }) => {
    try {
      const isTargetSelf = target.id === user?.id || target.username === user?.profile.username;

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername: target.username,
          recipientId: target.id,
          isSelf: isTargetSelf,
        }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        await fetchConversations();
        setSelectedConversationId(data.conversation.id);
        setActiveTab("chats");
      }
    } catch (err) {
      console.error("Start chat error:", err);
    }
  };

  const handleStartCallWithUser = async (callTarget: {
    id?: string;
    username: string;
    callType: "VOICE" | "VIDEO";
    displayName?: string;
    avatar?: string | null;
  }) => {
    let convId = selectedConversationId;
    if (!convId) {
      const existing = conversations.find(
        (c) => !c.isGroup && c.otherUser?.username.toLowerCase() === callTarget.username.toLowerCase()
      );
      if (existing) {
        convId = existing.id;
      }
    }

    const otherUser = {
      id: callTarget.id || callTarget.username,
      displayName: callTarget.displayName || callTarget.username,
      username: callTarget.username,
      avatar: callTarget.avatar,
    };

    setActiveWebRTCCall({
      callId: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: convId || "",
      otherUser,
      callType: callTarget.callType,
      isIncoming: false,
    });
  };

  const handleEndWebRTCCall = async (durationSeconds: number, status: "COMPLETED" | "MISSED" | "REJECTED") => {
    if (!activeWebRTCCall) return;
    const callData = activeWebRTCCall;
    setActiveWebRTCCall(null);

    if (callData.conversationId) {
      try {
        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: callData.conversationId,
            callType: callData.callType,
            status: status === "REJECTED" ? "MISSED" : status,
            durationSeconds,
          }),
        });

        const icon = callData.callType === "VIDEO" ? "🎥 Video call" : "📞 Voice call";
        const durText = durationSeconds > 0 ? ` (${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s)` : "";
        handleSendMessage({
          content: `${icon} • ${status === "MISSED" ? "Missed" : status === "REJECTED" ? "Declined" : "Ended"}${durText}`,
          type: "CALL",
        });
      } catch (e) {}
    }
  };

  const handleCreateGroup = async (groupData: {
    name: string;
    description?: string;
    avatar?: string;
    memberUsernames: string[];
  }) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isGroup: true,
          name: groupData.name,
          description: groupData.description,
          avatar: groupData.avatar,
          memberUsernames: groupData.memberUsernames,
        }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        await fetchConversations();
        setSelectedConversationId(data.conversation.id);
        setActiveTab("chats");
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleSendMessage = async (msgData: {
    content: string;
    type?: MessageType;
    isViewOnce?: boolean;
    replyToId?: string | null;
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      duration?: number | null;
    }>;
  }) => {
    if (!selectedConversationId) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        playSentSound();
        setMessages((prev) => [...prev, data.message]);

        const socket = getSocket();
        socket.emit("message:send", { message: data.message });

        setConversations((prev) => {
          const current = prev.find((c) => c.id === selectedConversationId);
          if (current) {
            const updated = {
              ...current,
              lastMessage: data.message,
              lastMessageAt: data.message.createdAt,
            };
            return [updated, ...prev.filter((c) => c.id !== selectedConversationId)];
          }
          return prev;
        });

        // If Meta AI responded, display reply with chime
        if (data.aiReply) {
          setTimeout(() => {
            playMessageSound();
            setMessages((prev) => [...prev, data.aiReply]);
            setConversations((prev) => {
              const current = prev.find((c) => c.id === selectedConversationId);
              if (current) {
                const updated = {
                  ...current,
                  lastMessage: data.aiReply,
                  lastMessageAt: data.aiReply.createdAt,
                };
                return [updated, ...prev.filter((c) => c.id !== selectedConversationId)];
              }
              return prev;
            });
          }, 350);
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleSendReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversationId) return;
    try {
      const res = await fetch(`/api/messages/${messageId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (res.ok) {
        const socket = getSocket();
        socket.emit("message:reaction", {
          messageId,
          conversationId: selectedConversationId,
          reaction: data.reaction,
          action: data.action,
        });

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            let reactions = [...(m.reactions || [])];
            if (data.action === "removed") {
              reactions = reactions.filter(
                (r) => !(r.emoji === emoji && r.userId === user?.id)
              );
            } else if (data.reaction) {
              reactions.push(data.reaction);
            }
            return { ...m, reactions };
          })
        );
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!selectedConversationId) return;
    try {
      const res = await fetch(`/api/messages/${messageId}?forEveryone=${forEveryone}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const socket = getSocket();
        socket.emit("message:delete", {
          messageId,
          conversationId: selectedConversationId,
          forEveryone,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, deletedForEveryone: forEveryone, content: "This message was deleted" }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isPinned } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    try {
      await fetch(`/api/users/${targetUserId}/block`, { method: "POST" });
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQRScanSuccess = async (scannedUsername: string) => {
    setShowQRModal(null);
    playMessageSound();
    await handleStartChatWithUser({ username: scannedUsername });
  };

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const totalUnreadMessages = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  if (!isMounted || isAuthLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-[#000000]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00A884] mb-3" />
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 font-ios">
          Loading ChatFlow...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white font-ios selection:bg-[#007AFF] selection:text-white">
      {/* ============================================================ */}
      {/* 1. DESKTOP LEFT NAVIGATION RAIL                              */}
      {/* ============================================================ */}
      <div className="hidden md:flex">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "settings") setShowSettings(true);
            else if (tab === "admin") setShowAdmin(true);
            else setActiveTab(tab);
          }}
          unreadMessagesCount={totalUnreadMessages}
          unreadNotificationsCount={unreadNotificationsCount}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. MIDDLE PANEL                                              */}
      {/* ============================================================ */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col flex-shrink-0 h-full border-r border-black/[0.08] dark:border-white/[0.08] pb-[68px] md:pb-0 ${
          selectedConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeTab === "chats" && (
          <ChatList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelectConversation={(id) => setSelectedConversationId(id)}
            onOpenNewChat={() => setActiveTab("find")}
            onOpenNewGroup={() => setActiveTab("groups")}
            isLoading={isLoadingConversations}
            onOpenLightbox={(target) => setLightboxTarget(target)}
            onOpenQRCode={(tab) => setShowQRModal(tab || "my-code")}
            onViewProfile={(u) => setViewProfileUsername(u)}
            onBlockUser={handleBlockUser}
            onOpenSettings={() => setShowSettings(true)}
            currentUser={user}
          />
        )}

        {activeTab === "status" && (
          <StatusList
            currentUser={user}
            onStartChatWithUser={(u) => handleStartChatWithUser({ username: u })}
          />
        )}

        {activeTab === "calls" && (
          <CallsList
            onStartCallWithUser={handleStartCallWithUser}
            onOpenFindPeople={() => setActiveTab("find")}
          />
        )}

        {activeTab === "find" && (
          <FindPeople
            onStartChat={handleStartChatWithUser}
            onViewProfile={(u) => setViewProfileUsername(u)}
            onOpenLightbox={(target) => setLightboxTarget(target)}
            onOpenQRCode={(tab) => setShowQRModal(tab || "scan")}
          />
        )}

        {activeTab === "groups" && (
          <GroupManager
            groups={conversations.filter((c) => c.isGroup)}
            onSelectGroup={(id) => {
              setSelectedConversationId(id);
              setActiveTab("chats");
            }}
            onCreateGroup={handleCreateGroup}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationDrawer
            notifications={notifications}
            unreadCount={unreadNotificationsCount}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onSelectNotification={(n) => {
              if (n.dataJson) {
                try {
                  const parsed = JSON.parse(n.dataJson);
                  if (parsed.conversationId) {
                    setSelectedConversationId(parsed.conversationId);
                    setActiveTab("chats");
                  }
                } catch (e) {}
              }
            }}
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN CHAT AREA                                            */}
      {/* ============================================================ */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 ${
          !selectedConversationId ? "hidden md:flex" : "flex fixed inset-0 z-40 md:relative md:inset-auto"
        }`}
      >
        <ChatArea
          conversation={selectedConversation}
          messages={messages}
          currentUserId={user.id}
          isTyping={Object.keys(typingUsers).length > 0}
          typingUsernames={Object.values(typingUsers).map((u) => u.displayName)}
          onSendMessage={handleSendMessage}
          onSendReaction={handleSendReaction}
          onDeleteMessage={handleDeleteMessage}
          onPinMessage={handlePinMessage}
          onTypingStart={() => {
            if (selectedConversationId) {
              getSocket().emit("typing:start", {
                conversationId: selectedConversationId,
                username: user.profile.username,
                displayName: user.profile.displayName,
              });
            }
          }}
          onTypingStop={() => {
            if (selectedConversationId) {
              getSocket().emit("typing:stop", {
                conversationId: selectedConversationId,
              });
            }
          }}
          onViewProfile={(u) => setViewProfileUsername(u)}
          onReport={(type, id) => setReportTarget({ type, id })}
          onBlockUser={handleBlockUser}
          isLoadingMessages={isLoadingMessages}
          onBackToChatList={() => setSelectedConversationId(null)}
          onOpenLightbox={(target) => setLightboxTarget(target)}
          onStartCall={(data) => {
            if (selectedConversation) {
              const other = selectedConversation.otherUser;
              handleStartCallWithUser({
                id: other?.id,
                username: other?.username || "",
                displayName: other?.displayName,
                avatar: other?.avatar,
                callType: data.callType,
              });
            }
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 4. AUTHENTIC iOS FROSTED GLASSMORPHISM BOTTOM TAB BAR         */}
      {/* ============================================================ */}
      {!selectedConversationId && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-[env(safe-area-inset-bottom,6px)] bg-[#F9F9F9]/80 dark:bg-[#161618]/85 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.1] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex items-center justify-around px-1.5 select-none transition-all">
          {/* 1. Chats */}
          <button
            type="button"
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all active:scale-95 ${
              activeTab === "chats"
                ? "text-[#007AFF] dark:text-[#0A84FF]"
                : "text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <MessageSquare className={`w-[23px] h-[23px] ${activeTab === "chats" ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-[#34C759] text-white text-[10px] font-bold rounded-full shadow-xs flex items-center justify-center">
                  {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-ios mt-0.5 ${activeTab === "chats" ? "font-bold" : "font-medium"}`}>
              Chats
            </span>
          </button>

          {/* 2. Updates / Status */}
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
              activeTab === "status"
                ? "text-[#007AFF] dark:text-[#0A84FF]"
                : "text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            <CircleDot className={`w-[23px] h-[23px] ${activeTab === "status" ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
            <span className={`text-[11px] font-ios mt-0.5 ${activeTab === "status" ? "font-bold" : "font-medium"}`}>
              Updates
            </span>
          </button>

          {/* 3. Calls */}
          <button
            type="button"
            onClick={() => setActiveTab("calls")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
              activeTab === "calls"
                ? "text-[#007AFF] dark:text-[#0A84FF]"
                : "text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            <Phone className={`w-[23px] h-[23px] ${activeTab === "calls" ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
            <span className={`text-[11px] font-ios mt-0.5 ${activeTab === "calls" ? "font-bold" : "font-medium"}`}>
              Calls
            </span>
          </button>

          {/* 4. Find People */}
          <button
            type="button"
            onClick={() => setActiveTab("find")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
              activeTab === "find"
                ? "text-[#007AFF] dark:text-[#0A84FF]"
                : "text-[#8E8E93] hover:text-black dark:hover:text-white"
            }`}
          >
            <Search className={`w-[23px] h-[23px] ${activeTab === "find" ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
            <span className={`text-[11px] font-ios mt-0.5 ${activeTab === "find" ? "font-bold" : "font-medium"}`}>
              Find
            </span>
          </button>

          {/* 5. You / Profile (with User Avatar & Settings) */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#8E8E93] hover:text-black dark:hover:text-white transition-all active:scale-95 group"
          >
            <div className="relative">
              <Avatar
                src={user.profile.avatar}
                name={user.profile.displayName}
                username={user.profile.username}
                size="xs"
              />
              <span className="w-2 h-2 rounded-full bg-[#34C759] absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F9F9F9] dark:ring-[#161618]" />
            </div>
            <span className="text-[11px] font-medium font-ios mt-0.5 truncate max-w-[55px]">
              You
            </span>
          </button>
        </nav>
      )}

      {/* Modals */}
      {/* Real-time WebRTC Voice & Video Calling Modal */}
      {activeWebRTCCall && (
        <WebRTCCallModal
          callData={activeWebRTCCall}
          onEndCall={handleEndWebRTCCall}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onOpenLightbox={(target) => setLightboxTarget(target)}
          onOpenQRCode={(tab) => {
            setShowSettings(false);
            setShowQRModal(tab || "my-code");
          }}
        />
      )}

      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}

      {showQRModal && (
        <QRCodeModal
          onClose={() => setShowQRModal(null)}
          onScanSuccess={handleQRScanSuccess}
          initialTab={showQRModal}
        />
      )}

      {viewProfileUsername && (
        <UserProfileModal
          username={viewProfileUsername}
          onClose={() => setViewProfileUsername(null)}
          onStartChat={handleStartChatWithUser}
          onReport={(type, id) => setReportTarget({ type, id })}
          onBlockUser={handleBlockUser}
          onOpenQRCode={(username) => {
            setViewProfileUsername(null);
            setShowQRModal("my-code");
          }}
        />
      )}

      {/* HD Avatar Lightbox (Opens full screen image on any avatar click) */}
      {lightboxTarget && (
        <AvatarLightbox
          isOpen={true}
          onClose={() => setLightboxTarget(null)}
          avatarUrl={lightboxTarget.avatar}
          name={lightboxTarget.name}
          username={lightboxTarget.username}
          bio={lightboxTarget.bio}
          isOnline={lightboxTarget.isOnline}
          onStartChat={
            lightboxTarget.username
              ? () => handleStartChatWithUser({ username: lightboxTarget.username! })
              : undefined
          }
          onStartCall={
            lightboxTarget.username
              ? (type) => handleStartCallWithUser({ username: lightboxTarget.username!, callType: type })
              : undefined
          }
        />
      )}

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
