"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Users,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  FileText,
  Video,
  Pin,
  SquarePen,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Plus,
  User,
  Ban,
  Trash2,
  BellOff,
  Bell,
  ChevronRight,
  Pencil,
  RotateCcw,
  AtSign,
  Lock,
  Unlock,
  Archive,
  ArchiveRestore,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ChevronLeft,
  X,
  Bot,
  UserPlus,
  Mail,
  MoreVertical,
  Settings,
} from "lucide-react";
import { ConversationType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { AppLogo } from "@/components/ui/AppLogo";
import { formatUsername } from "@/utils/username";
import {
  getCustomContactName,
  setCustomContactName,
  removeCustomContactName,
  CONTACT_NAME_CHANGE_EVENT,
} from "@/utils/contactNames";
import { format, isToday, isYesterday } from "date-fns";

interface ChatListProps {
  conversations: ConversationType[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  isLoading?: boolean;
  onOpenLightbox?: (data: {
    avatar?: string | null;
    name: string;
    username?: string | null;
    bio?: string | null;
    isOnline?: boolean;
  }) => void;
  onOpenQRCode?: (tab?: "my-code" | "scan") => void;
  onViewProfile?: (username: string) => void;
  onBlockUser?: (userId: string) => void;
  onOpenSettings?: () => void;
  onOpenMetaAI?: () => void;
  currentUser?: any;
}

export function ChatList({
  conversations,
  selectedId,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  isLoading = false,
  onOpenLightbox,
  onOpenQRCode,
  onViewProfile,
  onBlockUser,
  onOpenSettings,
  onOpenMetaAI,
  currentUser,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "UNREAD" | "DIRECT" | "GROUPS">("ALL");
  const [contextMenuConv, setContextMenuConv] = useState<ConversationType | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // Chat Lock & Archive State (Persisted)
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [chatLockPin, setChatLockPin] = useState<string | null>(null);
  const [viewingArchived, setViewingArchived] = useState(false);
  const [viewingLocked, setViewingLocked] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // PIN Dialog Modal State
  const [showPinModal, setShowPinModal] = useState<{
    mode: "SETUP" | "UNLOCK_CHAT" | "UNLOCK_FOLDER";
    targetConvId?: string;
  } | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinConfirmInput, setPinConfirmInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Edit Name Dialog State
  const [editingConv, setEditingConv] = useState<ConversationType | null>(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [nameVersion, setNameVersion] = useState(0);

  // Load persisted Chat Lock & Archive from localStorage
  useEffect(() => {
    try {
      const savedLocked = localStorage.getItem("chatflow_locked_chats");
      const savedArchived = localStorage.getItem("chatflow_archived_chats");
      const savedPin = localStorage.getItem("chatflow_chatlock_pin");
      const savedPinned = localStorage.getItem("chatflow_pinned_chats");
      const savedMuted = localStorage.getItem("chatflow_muted_chats");

      if (savedLocked) setLockedIds(JSON.parse(savedLocked));
      if (savedArchived) setArchivedIds(JSON.parse(savedArchived));
      if (savedPin) setChatLockPin(savedPin);
      if (savedPinned) setPinnedIds(JSON.parse(savedPinned));
      if (savedMuted) setMutedIds(JSON.parse(savedMuted));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleNameChange = () => setNameVersion((v) => v + 1);
    window.addEventListener(CONTACT_NAME_CHANGE_EVENT, handleNameChange);
    return () => window.removeEventListener(CONTACT_NAME_CHANGE_EVENT, handleNameChange);
  }, []);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);

  const handleTouchStart = (conv: ConversationType) => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      setContextMenuConv(conv);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  // Toggle Pin
  const togglePin = (convId: string) => {
    const next = pinnedIds.includes(convId)
      ? pinnedIds.filter((id) => id !== convId)
      : [...pinnedIds, convId];
    setPinnedIds(next);
    localStorage.setItem("chatflow_pinned_chats", JSON.stringify(next));
    setContextMenuConv(null);
  };

  // Toggle Mute
  const toggleMute = (convId: string) => {
    const next = mutedIds.includes(convId)
      ? mutedIds.filter((id) => id !== convId)
      : [...mutedIds, convId];
    setMutedIds(next);
    localStorage.setItem("chatflow_muted_chats", JSON.stringify(next));
    setContextMenuConv(null);
  };

  // Toggle Archive
  const toggleArchive = (convId: string) => {
    const next = archivedIds.includes(convId)
      ? archivedIds.filter((id) => id !== convId)
      : [...archivedIds, convId];
    setArchivedIds(next);
    localStorage.setItem("chatflow_archived_chats", JSON.stringify(next));
    setContextMenuConv(null);
  };

  // Toggle Lock
  const handleLockToggle = (convId: string) => {
    const isCurrentlyLocked = lockedIds.includes(convId);

    if (isCurrentlyLocked) {
      // Unlock chat -> ask for PIN
      setShowPinModal({ mode: "UNLOCK_CHAT", targetConvId: convId });
      setPinInput("");
      setPinError("");
      setContextMenuConv(null);
    } else {
      // Lock chat
      if (!chatLockPin) {
        // No PIN set -> setup PIN first
        setShowPinModal({ mode: "SETUP", targetConvId: convId });
        setPinInput("");
        setPinConfirmInput("");
        setPinError("");
        setContextMenuConv(null);
      } else {
        const next = [...lockedIds, convId];
        setLockedIds(next);
        localStorage.setItem("chatflow_locked_chats", JSON.stringify(next));
        setContextMenuConv(null);
      }
    }
  };

  // Handle PIN Form Submit
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPinModal) return;

    if (showPinModal.mode === "SETUP") {
      if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
        setPinError("PIN must be exactly 4 numeric digits.");
        return;
      }
      if (pinInput !== pinConfirmInput) {
        setPinError("PINs do not match. Please try again.");
        return;
      }
      localStorage.setItem("chatflow_chatlock_pin", pinInput);
      setChatLockPin(pinInput);

      if (showPinModal.targetConvId) {
        const next = [...lockedIds, showPinModal.targetConvId];
        setLockedIds(next);
        localStorage.setItem("chatflow_locked_chats", JSON.stringify(next));
      }
      setShowPinModal(null);
      setPinInput("");
      setPinConfirmInput("");
    } else if (showPinModal.mode === "UNLOCK_CHAT") {
      if (pinInput !== chatLockPin) {
        setPinError("Incorrect 4-digit PIN. Try again.");
        return;
      }
      if (showPinModal.targetConvId) {
        const next = lockedIds.filter((id) => id !== showPinModal.targetConvId);
        setLockedIds(next);
        localStorage.setItem("chatflow_locked_chats", JSON.stringify(next));
      }
      setShowPinModal(null);
      setPinInput("");
    } else if (showPinModal.mode === "UNLOCK_FOLDER") {
      if (pinInput !== chatLockPin) {
        setPinError("Incorrect 4-digit PIN. Try again.");
        return;
      }
      setShowPinModal(null);
      setViewingLocked(true);
      setPinInput("");
    }
  };

  const hideChat = (convId: string) => {
    setHiddenIds((prev) => [...prev, convId]);
    setContextMenuConv(null);
  };

  const formatMessageTime = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MM/dd/yy");
  };

  const getResolvedTitle = (c: ConversationType) => {
    if (c.isSelf) return "You (Message yourself)";
    if (c.isGroup) return c.name || "Group";
    const raw = c.otherUser?.displayName || "User";
    if (c.otherUser?.username) {
      return getCustomContactName(c.otherUser.username, raw);
    }
    return raw;
  };

  // Filter conversations
  const filteredConversations = conversations
    .filter((c) => {
      // If viewing archived folder -> only show archived chats
      if (viewingArchived) {
        return archivedIds.includes(c.id);
      }

      // If viewing locked folder -> only show locked chats
      if (viewingLocked) {
        return lockedIds.includes(c.id);
      }

      // Normal chat list: hide archived & locked chats from primary feed
      if (archivedIds.includes(c.id)) return false;
      if (lockedIds.includes(c.id)) return false;

      if (!searchQuery.trim() && hiddenIds.includes(c.id)) return false;
      if (activeFilter === "DIRECT" && c.isGroup) return false;
      if (activeFilter === "GROUPS" && !c.isGroup) return false;
      if (activeFilter === "UNREAD" && (!c.unreadCount || c.unreadCount === 0)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = getResolvedTitle(c);
        const username = c.otherUser?.username || "";
        const lastMsg = c.lastMessage?.content || "";
        return (
          title.toLowerCase().includes(q) ||
          username.toLowerCase().includes(q) ||
          lastMsg.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => (pinnedIds.includes(b.id) ? 1 : 0) - (pinnedIds.includes(a.id) ? 1 : 0));

  // Counts
  const archivedCount = conversations.filter((c) => archivedIds.includes(c.id)).length;
  const lockedCount = conversations.filter((c) => lockedIds.includes(c.id)).length;

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none border-r border-black/[0.08] dark:border-white/[0.08] relative">
      {/* Glassmorphism Sticky Top Header */}
      <div className="pt-3 px-4 pb-2.5 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl ios-blur sticky top-0 z-30 border-b border-black/[0.08] dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          {/* Header Left (Start): Logo + Chat Heading */}
          <div className="flex items-center gap-2.5 min-w-0">
            {viewingArchived || viewingLocked ? (
              <button
                type="button"
                onClick={() => {
                  setViewingArchived(false);
                  setViewingLocked(false);
                }}
                className="flex items-center gap-1 text-[#007AFF] dark:text-[#0A84FF] text-[16px] font-semibold font-ios active:opacity-60 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Chats</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <AppLogo size="md" showText={false} className="shadow-md hover:scale-105 transition-transform" />
                <span className="text-[22px] font-extrabold tracking-tight text-black dark:text-white font-ios leading-none">
                  Chats
                </span>
              </div>
            )}
            {(viewingArchived || viewingLocked) && (
              <span className="text-[19px] font-bold text-black dark:text-white font-ios ml-1">
                {viewingArchived ? "Archived" : "Locked Chats 🔒"}
              </span>
            )}
          </div>

          {/* Header Right: 1. Group Icon, 2. Find People Icon, 3. 3-Dots Menu */}
          <div className="flex items-center gap-1.5">
            {/* 1. Group Icon */}
            <button
              type="button"
              onClick={onOpenNewGroup}
              className="text-[#007AFF] dark:text-[#0A84FF] p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-transform cursor-pointer"
              title="New Group"
            >
              <Users className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 2. Find People Icon */}
            <button
              type="button"
              onClick={onOpenNewChat}
              className="text-[#007AFF] dark:text-[#0A84FF] p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-transform cursor-pointer"
              title="Find People"
            >
              <UserPlus className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 3. 3-Dots Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="text-[#007AFF] dark:text-[#0A84FF] p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-transform cursor-pointer"
                title="More Options"
              >
                <MoreVertical className="w-5 h-5 stroke-[2]" />
              </button>

              {/* 3-Dots Glassmorphism Dropdown */}
              {showMenuDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenuDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white/95 dark:bg-[#252528]/95 ios-blur rounded-[16px] shadow-ios-sheet border border-black/[0.08] dark:border-white/[0.1] p-1.5 animate-pop-in">
                    {/* Unread Messages Filter Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter(activeFilter === "UNREAD" ? "ALL" : "UNREAD");
                        setShowMenuDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#007AFF]" />
                        <span>{activeFilter === "UNREAD" ? "Show All Chats" : "Unread Messages"}</span>
                      </span>
                      {activeFilter === "UNREAD" && (
                        <span className="w-2 h-2 rounded-full bg-[#00A884]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenNewGroup();
                        setShowMenuDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#34C759]" />
                      <span>New Group</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenNewChat();
                        setShowMenuDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#007AFF]" />
                      <span>Find People</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (chatLockPin) {
                          setShowPinModal({ mode: "UNLOCK_FOLDER" });
                        } else {
                          setShowPinModal({ mode: "SETUP" });
                        }
                        setShowMenuDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-[#FF9500]" />
                      <span>Locked Chats ({lockedCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setViewingArchived(true);
                        setShowMenuDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4 text-[#8E8E93]" />
                      <span>Archived ({archivedCount})</span>
                    </button>

                    {onOpenSettings && (
                      <>
                        <div className="my-1 border-t border-black/[0.06] dark:border-white/[0.08]" />
                        <button
                          type="button"
                          onClick={() => {
                            onOpenSettings();
                            setShowMenuDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#8E8E93]" />
                          <span>Settings</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 pb-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search chats or messages"
              className="w-full pl-9 pr-8 py-1.5 bg-[#767680]/12 dark:bg-[#767680]/24 border-none rounded-[10px] text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-0 font-normal transition-all"
            />
          </div>
        </div>

        {/* Filter Pills (Hidden when viewing folders) */}
        {!viewingArchived && !viewingLocked && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["ALL", "UNREAD", "DIRECT", "GROUPS"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-[#00A884] text-white shadow-xs"
                    : "bg-[#767680]/12 dark:bg-[#767680]/24 text-[#8E8E93]"
                }`}
              >
                {filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Conversation Feed */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#161618] pb-16">
        {/* Top Pinned Folder: Locked Chats */}
        {!viewingArchived && !viewingLocked && lockedCount > 0 && (
          <div
            onClick={() => {
              if (chatLockPin) {
                setShowPinModal({ mode: "UNLOCK_FOLDER" });
                setPinInput("");
                setPinError("");
              } else {
                setViewingLocked(true);
              }
            }}
            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-black dark:text-white font-ios">
                  Locked Chats
                </p>
                <p className="text-[12px] text-[#8E8E93]">Protected with 4-digit PIN</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] text-[12px] font-bold">
                {lockedCount}
              </span>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </div>
          </div>
        )}

        {/* Top Pinned Folder: Archived Chats */}
        {!viewingArchived && !viewingLocked && archivedCount > 0 && (
          <div
            onClick={() => setViewingArchived(true)}
            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-black dark:text-white font-ios">
                  Archived Chats
                </p>
                <p className="text-[12px] text-[#8E8E93]">Muted & hidden from main feed</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] text-[12px] font-bold">
                {archivedCount}
              </span>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 dark:bg-[#2C2C2E] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-[#8E8E93] text-center space-y-2">
            <p className="text-[16px] font-semibold">
              {viewingArchived
                ? "No Archived Chats"
                : viewingLocked
                ? "No Locked Chats"
                : "No Conversations"}
            </p>
            <p className="text-[12px] max-w-xs">
              {viewingArchived
                ? "Right-click or long-press any chat and choose 'Archive Chat' to store it here."
                : viewingLocked
                ? "Right-click or long-press any chat and select 'Lock Chat' to protect it."
                : "Tap the compose button to start messaging friends or Meta AI!"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const isPinned = pinnedIds.includes(conv.id);
            const isMuted = mutedIds.includes(conv.id);
            const isLocked = lockedIds.includes(conv.id);
            const isArchived = archivedIds.includes(conv.id);
            const title = getResolvedTitle(conv);
            const unread = isArchived ? 0 : conv.unreadCount || 0;
            const lastMsg = conv.lastMessage;
            const isMetaAIConv = conv.otherUser?.username?.toLowerCase() === "meta_ai";

            return (
              <div
                key={conv.id}
                onTouchStart={() => handleTouchStart(conv)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuConv(conv);
                }}
              >
                <div
                  onClick={() => {
                    if (!isLongPressTriggered.current) {
                      onSelectConversation(conv.id);
                    }
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3.5 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#F2F2F7] dark:bg-[#2C2C2E]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <Avatar
                    src={conv.isGroup ? conv.avatar : conv.otherUser?.avatar}
                    username={conv.otherUser?.username}
                    name={title}
                    size="lg"
                    isOnline={isMetaAIConv ? true : conv.otherUser?.isOnline}
                    showOnlineIndicator={true}
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold truncate font-ios">{title}</span>
                        {isMetaAIConv && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#00D2FF]/20 via-[#9B51E0]/20 to-[#FF2A6D]/20 text-[#007AFF] dark:text-[#38BDF8]">
                            AI ✨
                          </span>
                        )}
                        {isPinned && <Pin className="w-3.5 h-3.5 text-[#8E8E93] rotate-45" />}
                        {isMuted && <VolumeX className="w-3.5 h-3.5 text-[#8E8E93]" />}
                        {isLocked && <Lock className="w-3.5 h-3.5 text-[#007AFF]" />}
                        {isArchived && <Archive className="w-3.5 h-3.5 text-[#00A884]" />}
                      </div>
                      <span
                        className={`text-[12px] ${
                          unread > 0 ? "text-[#34C759] font-bold" : "text-[#8E8E93]"
                        }`}
                      >
                        {formatMessageTime(lastMsg?.createdAt || conv.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="truncate text-[14px] text-[#8E8E93]">
                        {isMetaAIConv && !lastMsg?.content
                          ? "Always online • Ask anything ✨"
                          : lastMsg?.content || "Tap to start conversation"}
                      </span>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#34C759] text-white text-[11px] font-bold rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-[76px] border-b border-black/[0.06] dark:border-white/[0.06]" />
              </div>
            );
          })
        )}
      </div>



      {/* iOS Context Menu Action Sheet */}
      {contextMenuConv && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end p-3 animate-fade-in"
          onClick={() => setContextMenuConv(null)}
        >
          <div
            className="w-full max-w-sm bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[24px] overflow-hidden shadow-2xl z-10 animate-slide-up border border-black/[0.08] dark:border-white/[0.1] divide-y divide-black/[0.06] dark:divide-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Contact Preview */}
            <div className="p-4 flex items-center gap-3 bg-white dark:bg-[#2C2C2E]">
              <Avatar
                src={
                  contextMenuConv.isGroup
                    ? contextMenuConv.avatar
                    : contextMenuConv.otherUser?.avatar
                }
                name={getResolvedTitle(contextMenuConv)}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate font-ios">
                  {getResolvedTitle(contextMenuConv)}
                </p>
                {!contextMenuConv.isGroup && contextMenuConv.otherUser?.username && (
                  <p className="text-[12px] font-semibold text-[#00A884] dark:text-[#34D399]">
                    {formatUsername(contextMenuConv.otherUser.username)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {/* 1. Contact Info */}
              {!contextMenuConv.isGroup && contextMenuConv.otherUser?.username && (
                <button
                  type="button"
                  onClick={() => {
                    setContextMenuConv(null);
                    onViewProfile?.(contextMenuConv.otherUser!.username!);
                  }}
                  className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <User className="w-5 h-5 text-[#007AFF]" /> Contact Info
                </button>
              )}

              {/* 2. Edit Name / Nickname */}
              {!contextMenuConv.isGroup && contextMenuConv.otherUser?.username && (
                <button
                  type="button"
                  onClick={() => {
                    const conv = contextMenuConv;
                    setContextMenuConv(null);
                    setEditingConv(conv);
                    setEditNameInput(getResolvedTitle(conv));
                  }}
                  className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <Pencil className="w-5 h-5 text-[#007AFF]" /> Edit Name / Nickname
                </button>
              )}

              {/* 3. Lock Chat (with 4-Digit PIN) */}
              <button
                type="button"
                onClick={() => handleLockToggle(contextMenuConv.id)}
                className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                {lockedIds.includes(contextMenuConv.id) ? (
                  <>
                    <Unlock className="w-5 h-5 text-[#34C759]" /> Unlock Chat
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-[#007AFF]" /> Lock Chat (4-Digit PIN)
                  </>
                )}
              </button>

              {/* 4. Archive Chat */}
              <button
                type="button"
                onClick={() => toggleArchive(contextMenuConv.id)}
                className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                {archivedIds.includes(contextMenuConv.id) ? (
                  <>
                    <ArchiveRestore className="w-5 h-5 text-[#34C759]" /> Unarchive Chat
                  </>
                ) : (
                  <>
                    <Archive className="w-5 h-5 text-[#00A884] dark:text-[#34D399]" /> Archive Chat (Mute)
                  </>
                )}
              </button>

              {/* 5. Pin / Unpin */}
              <button
                type="button"
                onClick={() => togglePin(contextMenuConv.id)}
                className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <Pin className="w-5 h-5 text-[#FF9500]" />
                {pinnedIds.includes(contextMenuConv.id) ? "Unpin Chat" : "Pin Chat"}
              </button>

              {/* 6. Mute / Unmute */}
              <button
                type="button"
                onClick={() => toggleMute(contextMenuConv.id)}
                className="w-full px-4 py-3 text-[15px] flex items-center gap-3 text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                {mutedIds.includes(contextMenuConv.id) ? (
                  <>
                    <Bell className="w-5 h-5 text-[#34C759]" /> Unmute Notifications
                  </>
                ) : (
                  <>
                    <BellOff className="w-5 h-5 text-[#8E8E93]" /> Mute Notifications
                  </>
                )}
              </button>

              {/* 7. Delete & Hide */}
              <button
                type="button"
                onClick={() => hideChat(contextMenuConv.id)}
                className="w-full px-4 py-3 text-[15px] text-[#FF3B30] flex items-center gap-3 hover:bg-[#FF3B30]/5"
              >
                <Trash2 className="w-5 h-5" /> Delete & Hide Chat
              </button>
            </div>

            <div className="p-2 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
              <button
                type="button"
                onClick={() => setContextMenuConv(null)}
                className="w-full py-3 bg-white dark:bg-[#2C2C2E] rounded-[16px] text-[#007AFF] font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State-of-the-art iOS / WhatsApp Passcode Dialog */}
      {showPinModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowPinModal(null);
            setPinInput("");
            setPinConfirmInput("");
            setPinError("");
          }}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)] space-y-5 border border-black/[0.08] dark:border-white/[0.1] text-center relative animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing Lock Badge */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008069] via-[#00A884] to-[#25D366] text-white flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(0,168,132,0.4)]">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-[20px] font-extrabold text-black dark:text-white font-ios tracking-tight">
                {showPinModal.mode === "SETUP" ? "Set Chat Lock PIN" : "Enter Chat PIN"}
              </h3>
              <p className="text-[13px] text-[#8E8E93] mt-1">
                {showPinModal.mode === "SETUP"
                  ? "Choose a secure 4-digit PIN to lock private conversations"
                  : "Enter your 4-digit code to access locked chats"}
              </p>
            </div>

            {pinError && (
              <div className="text-[12px] font-semibold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 py-2 px-3 rounded-[12px] animate-shake">
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
              {/* Primary PIN Digits Row */}
              <div className="space-y-1.5">
                {showPinModal.mode === "SETUP" && (
                  <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block text-left ml-1">
                    Enter New PIN
                  </label>
                )}
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    autoFocus
                    className="w-full text-center tracking-[16px] text-[26px] font-extrabold py-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#00A884] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {/* Confirm PIN Digits Row (Only in SETUP mode) */}
              {showPinModal.mode === "SETUP" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block text-left ml-1">
                    Confirm PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={pinConfirmInput}
                      onChange={(e) =>
                        setPinConfirmInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="••••"
                      className="w-full text-center tracking-[16px] text-[26px] font-extrabold py-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#00A884] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(null);
                    setPinInput("");
                    setPinConfirmInput("");
                    setPinError("");
                  }}
                  className="flex-1 py-3 rounded-[14px] text-[14px] font-bold text-[#8E8E93] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    showPinModal.mode === "SETUP"
                      ? pinInput.length !== 4 || pinConfirmInput.length !== 4
                      : pinInput.length !== 4
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-[#008069] to-[#00A884] hover:opacity-90 disabled:opacity-40 text-white font-bold text-[14px] rounded-[14px] shadow-[0_4px_16px_rgba(0,168,132,0.35)] active:scale-95 transition-all cursor-pointer"
                >
                  {showPinModal.mode === "SETUP" ? "Set PIN" : "Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Name / Set Nickname Dialog */}
      {editingConv && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingConv(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-2xl space-y-4 border border-black/[0.08] dark:border-white/[0.1]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[17px] font-bold text-black dark:text-white font-ios">
                Edit Contact Name
              </span>
              <button
                type="button"
                onClick={() => setEditingConv(null)}
                className="text-[#8E8E93] hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1">
                  Custom Name or Nickname
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder={editingConv.otherUser?.displayName}
                  autoFocus
                  className="w-full px-3.5 py-2 text-[15px] font-semibold text-black dark:text-white bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {editingConv.otherUser?.username && (
                  <button
                    type="button"
                    onClick={() => setEditNameInput(`@${editingConv.otherUser!.username}`)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] flex items-center gap-1 hover:bg-[#00A884]/25"
                  >
                    <AtSign className="w-3 h-3" />
                    <span>Use @{editingConv.otherUser.username}</span>
                  </button>
                )}

                {editingConv.otherUser?.displayName && (
                  <button
                    type="button"
                    onClick={() => setEditNameInput(editingConv.otherUser!.displayName)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#767680]/15 text-[#8E8E93] flex items-center gap-1 hover:text-black dark:hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Original ({editingConv.otherUser.displayName})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingConv(null)}
                className="px-4 py-2 text-[14px] font-medium text-[#8E8E93] hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingConv.otherUser?.username) {
                    setCustomContactName(editingConv.otherUser.username, editNameInput);
                  }
                  setEditingConv(null);
                }}
                className="px-5 py-2 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[14px] font-bold rounded-[12px] shadow-xs active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
