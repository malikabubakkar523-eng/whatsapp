"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Phone,
  Video,
  Info,
  Reply,
  Copy,
  Trash2,
  Pin,
  Check,
  CheckCheck,
  Download,
  FileText,
  X,
  ShieldAlert,
  Ban,
  Users,
  Image as ImageIcon,
  Camera,
  Loader2,
  ChevronLeft,
  PhoneCall,
  VideoOff,
  MicOff,
  PhoneMissed,
  Plus,
  MoreVertical,
  Pencil,
  RotateCcw,
  AtSign,
} from "lucide-react";
import { ConversationType, MessageTypeData, MessageType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import {
  getCustomContactName,
  setCustomContactName,
  removeCustomContactName,
  CONTACT_NAME_CHANGE_EVENT,
} from "@/utils/contactNames";
import { AudioPlayer } from "./AudioPlayer";
import { VoiceRecorder } from "./VoiceRecorder";
import { EmojiPicker } from "./EmojiPicker";
import { MediaStudioModal } from "./MediaStudioModal";
import { format, isToday, isYesterday } from "date-fns";

interface ChatAreaProps {
  conversation: ConversationType | null;
  messages: MessageTypeData[];
  currentUserId: string;
  isTyping?: boolean;
  typingUsernames?: string[];
  onSendMessage: (data: {
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
  }) => void;
  onSendReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onPinMessage: (messageId: string, isPinned: boolean) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onViewProfile?: (username: string) => void;
  onReport?: (targetType: "USER" | "MESSAGE" | "GROUP", targetId: string) => void;
  onBlockUser?: (userId: string) => void;
  isLoadingMessages?: boolean;
  onBackToChatList?: () => void;
  onOpenLightbox?: (data: {
    avatar?: string | null;
    name: string;
    username?: string | null;
    bio?: string | null;
    isOnline?: boolean;
  }) => void;
  onStartCall?: (data: { callType: "VOICE" | "VIDEO" }) => void;
}

export function ChatArea({
  conversation,
  messages,
  currentUserId,
  isTyping = false,
  typingUsernames = [],
  onSendMessage,
  onSendReaction,
  onDeleteMessage,
  onPinMessage,
  onTypingStart,
  onTypingStop,
  onViewProfile,
  onReport,
  onBlockUser,
  isLoadingMessages = false,
  onBackToChatList,
  onOpenLightbox,
  onStartCall,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<MessageTypeData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeCallModal, setActiveCallModal] = useState<"VOICE" | "VIDEO" | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);
  const [activeContextMenuId, setActiveContextMenuId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nameVersion, setNameVersion] = useState(0);
  const [isViewOnceInput, setIsViewOnceInput] = useState(false);
  const [viewOnceModalData, setViewOnceModalData] = useState<MessageTypeData | null>(null);
  const [activeImageLightbox, setActiveImageLightbox] = useState<{
    url: string;
    fileName?: string;
    senderName?: string;
    time?: string;
  } | null>(null);
  const [mediaStudioFiles, setMediaStudioFiles] = useState<File[] | null>(null);

  // Edit Name in Drawer State
  const [isEditingDrawerName, setIsEditingDrawerName] = useState(false);
  const [drawerNameInput, setDrawerNameInput] = useState("");
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoDisabled, setIsCallVideoDisabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleNameChange = () => setNameVersion((v) => v + 1);
    window.addEventListener(CONTACT_NAME_CHANGE_EVENT, handleNameChange);
    return () => window.removeEventListener(CONTACT_NAME_CHANGE_EVENT, handleNameChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Call timer effect
  useEffect(() => {
    if (activeCallModal) {
      setCallDurationSeconds(0);
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCallModal]);

  const handleEndCall = async (status: "COMPLETED" | "MISSED" = "COMPLETED") => {
    if (!conversation) return;
    const finalSeconds = callDurationSeconds;
    const callType = activeCallModal || "VOICE";
    setActiveCallModal(null);

    // Log call via API
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          callType,
          status,
          durationSeconds: finalSeconds,
        }),
      });

      // Format call message in chat
      const durText = finalSeconds > 0 ? ` (${Math.floor(finalSeconds / 60)}m ${finalSeconds % 60}s)` : "";
      const icon = callType === "VIDEO" ? "🎥 Video call" : "📞 Voice call";
      onSendMessage({
        content: `${icon} • ${status === "MISSED" ? "Missed" : "Ended"}${durText}`,
        type: "CALL",
      });
    } catch (e) {
      console.error("Failed to log call:", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onTypingStart();

    // Auto resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onTypingStop();
    onSendMessage({
      content: inputText.trim(),
      type: "TEXT",
      isViewOnce: isViewOnceInput,
      replyToId: replyingTo?.id || null,
    });
    setInputText("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setIsViewOnceInput(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setShowAttachMenu(false);
    try {
      const formData = new FormData();
      formData.append("file", file);

      let fileUrl = "";
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          fileUrl = data.url;
        }
      } catch (uploadErr) {}

      // Resilient fallback
      if (!fileUrl) {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      if (fileUrl) {
        let type: MessageType = "FILE";
        if (file.type.startsWith("image/")) type = "IMAGE";
        else if (file.type.startsWith("video/")) type = "VIDEO";
        else if (file.type.startsWith("audio/")) type = "AUDIO";

        onSendMessage({
          content: inputText.trim(),
          type,
          isViewOnce: isViewOnceInput,
          replyToId: replyingTo?.id || null,
          attachments: [
            {
              url: fileUrl,
              fileName: file.name,
              fileType: file.type || "application/octet-stream",
              fileSize: file.size,
            },
          ],
        });

        setInputText("");
        setReplyingTo(null);
        setIsViewOnceInput(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMediaStudio = async (data: {
    items: Array<{
      file: File;
      caption: string;
      filter: string;
      rotation: number;
      isViewOnce: boolean;
      quality: "HD" | "NORMAL";
    }>;
    sharedCaption: string;
    isViewOnce: boolean;
    isHD: boolean;
  }) => {
    setIsUploading(true);
    try {
      const uploadedAttachments: Array<{
        url: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        duration?: number | null;
      }> = [];

      for (const item of data.items) {
        let mediaUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", item.file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const resData = await res.json();
          if (res.ok && resData.url) {
            mediaUrl = resData.url;
          }
        } catch (e) {}

        // Resilient fallback to local Data URL
        if (!mediaUrl) {
          mediaUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(item.file);
          });
        }

        uploadedAttachments.push({
          url: mediaUrl,
          fileName: item.file.name,
          fileType: item.file.type || "application/octet-stream",
          fileSize: item.file.size,
        });
      }

      const firstIsVideo = data.items[0]?.file.type.startsWith("video/");
      const msgType: MessageType = firstIsVideo ? "VIDEO" : "IMAGE";

      onSendMessage({
        content: data.sharedCaption || inputText.trim(),
        type: msgType,
        isViewOnce: data.isViewOnce,
        replyToId: replyingTo?.id || null,
        attachments: uploadedAttachments,
      });

      setInputText("");
      setReplyingTo(null);
      setIsViewOnceInput(false);
      setMediaStudioFiles(null);
    } catch (err) {
      console.error("Media studio send error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDateHeader = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "TODAY";
    if (isYesterday(d)) return "YESTERDAY";
    return format(d, "MMMM d, yyyy").toUpperCase();
  };

  const formatLastSeen = (dateStr?: string | Date | null) => {
    if (!dateStr) return "offline";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "offline";
      if (isToday(d)) return `last seen today at ${format(d, "h:mm a")}`;
      if (isYesterday(d)) return `last seen yesterday at ${format(d, "h:mm a")}`;
      return `last seen ${format(d, "MMM d 'at' h:mm a")}`;
    } catch (e) {
      return "offline";
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F2F2F7] dark:bg-[#000000] text-center select-none relative">
        {onBackToChatList && (
          <button
            type="button"
            onClick={onBackToChatList}
            className="absolute top-4 left-4 flex items-center gap-1 text-[#007AFF] dark:text-[#0A84FF] text-[16px] font-semibold md:hidden active:opacity-60"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Chats</span>
          </button>
        )}
        <div className="w-16 h-16 rounded-[22px] bg-[#00A884]/15 flex items-center justify-center text-[#00A884] mb-3 shadow-xs">
          <Send className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-[20px] font-bold text-black dark:text-white font-ios tracking-tight">
          Select or Start a Chat
        </h2>
        <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs font-normal">
          Pick a conversation from the list or search a <span className="font-semibold text-[#00A884] dark:text-[#34D399]">@username</span> to start messaging.
        </p>
      </div>
    );
  }

  const isGroup = conversation.isGroup;
  const isSelf = conversation.isSelf;
  const rawTitle = isSelf ? "You (Message yourself)" : isGroup ? conversation.name : conversation.otherUser?.displayName || "User";
  const title = !isGroup && !isSelf && conversation.otherUser?.username
    ? getCustomContactName(conversation.otherUser.username, rawTitle)
    : rawTitle;
  const username = !isGroup && !isSelf ? conversation.otherUser?.username : isSelf ? "you" : null;
  const avatar = isGroup ? conversation.avatar : conversation.otherUser?.avatar;
  const isOnline = !isGroup && !isSelf && conversation.otherUser?.isOnline;
  const isMetaAI = !isGroup && !isSelf && (username?.toLowerCase() === "meta_ai" || rawTitle?.toLowerCase() === "meta ai" || rawTitle?.toLowerCase().includes("meta ai"));

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  // Group messages by date
  let lastDateHeader = "";

  return (
    <div className="flex-1 flex flex-row h-full overflow-hidden bg-[#EFEAE2] dark:bg-[#0B141A] chat-pattern-light dark:chat-pattern-dark relative">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          e.target.value = "";
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        multiple
        accept="image/*,video/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setMediaStudioFiles(Array.from(e.target.files));
          }
          e.target.value = "";
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*,video/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setMediaStudioFiles(Array.from(e.target.files));
          }
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* Main Messaging Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* iOS Top Navigation Bar */}
        <header className="h-[60px] px-3 bg-[#F6F6F6]/90 dark:bg-[#1E1E1E]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] text-black dark:text-white flex items-center justify-between z-20 select-none flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* iOS Back Button with chevron */}
            {onBackToChatList && (
              <button
                type="button"
                onClick={onBackToChatList}
                className="flex items-center text-[#007AFF] dark:text-[#0A84FF] -ml-1 pr-1 py-1 hover:opacity-75 active:opacity-40 transition-opacity font-normal text-[17px]"
                title="Back"
              >
                <ChevronLeft className="w-6 h-6 -mr-1 stroke-[2.5]" />
                <span className="hidden sm:inline font-ios">Chats</span>
              </button>
            )}

            {/* Contact Avatar & Header Meta */}
            <button
              type="button"
              onClick={() => {
                if (username && !isSelf && onViewProfile) onViewProfile(username);
                else setShowRightDrawer(!showRightDrawer);
              }}
              className="flex items-center gap-2.5 text-left group min-w-0 focus:outline-none"
            >
              <Avatar
                src={avatar}
                name={title || undefined}
                username={username || undefined}
                size="sm"
                isOnline={isSelf ? true : !!isOnline}
                showOnlineIndicator={!isGroup}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox?.({
                    avatar,
                    name: title || "User",
                    username,
                    bio: conversation.otherUser?.bio,
                    isOnline: !!isOnline,
                  });
                }}
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-[16px] text-black dark:text-white truncate font-ios leading-tight">
                    {title}
                  </h2>
                  {isMetaAI && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#00D2FF]/20 via-[#9B51E0]/20 to-[#FF2A6D]/20 text-[#007AFF] dark:text-[#38BDF8]">
                      AI ✨
                    </span>
                  )}
                </div>

                {isTyping ? (
                  <p className="text-[12px] font-medium text-[#00A884] dark:text-[#34D399] flex items-center gap-1 leading-none mt-0.5">
                    <span>
                      {typingUsernames.length > 1
                        ? `${typingUsernames.join(", ")} are typing`
                        : `${typingUsernames[0] || "typing"}...`}
                    </span>
                    <span className="flex gap-0.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  </p>
                ) : isMetaAI ? (
                  <p className="text-[12px] text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] font-semibold leading-none mt-0.5">
                    Always online • Meta AI
                  </p>
                ) : isSelf ? (
                  <p className="text-[12px] text-[#8E8E93] truncate leading-none mt-0.5">
                    Message yourself • Saved notes 📌
                  </p>
                ) : isGroup ? (
                  <p className="text-[12px] text-[#8E8E93] truncate leading-none mt-0.5">
                    {conversation.members.length} members
                  </p>
                ) : isOnline ? (
                  <p className="text-[12px] text-[#00A884] dark:text-[#34D399] font-medium flex items-center gap-1.5 leading-none mt-0.5 animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-[#00A884] dark:bg-[#34D399] animate-pulse shadow-[0_0_8px_rgba(0,168,132,0.6)]" />
                    <span>online</span>
                  </p>
                ) : (
                  <p className="text-[12px] text-[#8E8E93] truncate font-normal leading-none mt-0.5 animate-fade-in">
                    {formatLastSeen(conversation.otherUser?.lastSeen)}
                  </p>
                )}
              </div>
            </button>
          </div>

          {/* Action buttons (Video Call, Voice Call, Info) styled with iOS Blue */}
          {!isSelf && (
            <div className="flex items-center gap-2 text-[#007AFF] dark:text-[#0A84FF]">
              <button
                type="button"
                onClick={() => {
                  if (onStartCall) onStartCall({ callType: "VIDEO" });
                  else setActiveCallModal("VIDEO");
                }}
                className="p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
                title="Video Call"
              >
                <Video className="w-5 h-5 stroke-[1.9]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onStartCall) onStartCall({ callType: "VOICE" });
                  else setActiveCallModal("VOICE");
                }}
                className="p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
                title="Voice Call"
              >
                <Phone className="w-5 h-5 stroke-[1.9]" />
              </button>
            </div>
          )}
        </header>

        {/* Message Timeline */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#00A884]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#8E8E93] p-6">
              <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 shadow-xs flex items-center justify-center text-[#00A884] mb-3">
                <Send className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-[15px] font-semibold text-black dark:text-white">
                {isSelf
                  ? "This is your personal chat!"
                  : "No messages yet"}
              </p>
              <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
                {isSelf
                  ? "Save notes, voice memos, and photos here."
                  : "Send a message or voice note to start chatting."}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUserId;
              const isDeleted = msg.isDeleted || msg.deletedForEveryone;
              const isCallMsg = msg.type === "CALL";
              const timeStr = format(new Date(msg.createdAt), "h:mm a");

              // Check if date header pill should be rendered
              const currentDateHeader = formatDateHeader(msg.createdAt);
              const showDateHeader = currentDateHeader !== lastDateHeader;
              if (showDateHeader) {
                lastDateHeader = currentDateHeader;
              }

              // Special Render for Call Log Message in Chat
              if (isCallMsg) {
                const isVideo = msg.content.toLowerCase().includes("video");
                const isMissed = msg.content.toLowerCase().includes("missed");

                return (
                  <React.Fragment key={msg.id}>
                    {showDateHeader && (
                      <div className="flex justify-center my-3 select-none">
                        <span className="px-3 py-1 rounded-[8px] bg-white/75 dark:bg-[#182229]/85 ios-blur text-[11px] font-semibold text-[#8E8E93] shadow-xs uppercase tracking-wider">
                          {currentDateHeader}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-center my-1.5 select-none animate-fade-in">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 border border-black/[0.06] dark:border-white/[0.08] shadow-xs text-[13px] text-black dark:text-white font-medium">
                        {isMissed ? (
                          <PhoneMissed className="w-4 h-4 text-[#FF3B30] stroke-[2]" />
                        ) : isVideo ? (
                          <Video className="w-4 h-4 text-[#00A884] stroke-[2]" />
                        ) : (
                          <Phone className="w-4 h-4 text-[#00A884] stroke-[2]" />
                        )}
                        <span>{msg.content}</span>
                        <span className="text-[11px] text-[#8E8E93] font-normal">
                          • {timeStr}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-3 select-none">
                      <span className="px-3 py-1 rounded-[8px] bg-white/75 dark:bg-[#182229]/85 ios-blur text-[11px] font-semibold text-[#8E8E93] shadow-xs uppercase tracking-wider">
                        {currentDateHeader}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"} group relative`}
                  >
                    {/* Sender Name in Group */}
                    {isGroup && !isMine && msg.sender?.profile && (
                      <span className="text-[11px] font-semibold text-[#00A884] dark:text-[#34D399] ml-3 mb-0.5">
                        {msg.sender.profile.displayName} ({formatUsername(msg.sender.profile.username)})
                      </span>
                    )}

                    {/* Bubble Container */}
                    <div className="relative max-w-[85%] sm:max-w-[72%]">
                      {/* Floating iOS Quick Reactions & Context Trigger */}
                      <div
                        className={`absolute top-0 -translate-y-1/2 ${
                          isMine ? "right-0" : "left-0"
                        } hidden group-hover:flex items-center gap-1 bg-white/95 dark:bg-[#1C1C1E]/95 ios-blur border border-black/[0.08] dark:border-white/[0.08] shadow-md rounded-full px-2 py-1 z-20 animate-fade-in`}
                      >
                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onSendReaction(msg.id, emoji)}
                            className="text-[14px] hover:scale-125 active:scale-95 transition-transform px-0.5"
                          >
                            {emoji}
                          </button>
                        ))}

                        <div className="h-3 w-[1px] bg-black/10 dark:bg-white/10 mx-0.5" />

                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8E8E93] hover:text-black dark:hover:text-white"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8E8E93] hover:text-black dark:hover:text-white"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        {isMine && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(msg.id, true)}
                            className="p-1 rounded-full hover:bg-[#FF3B30]/10 text-[#FF3B30]"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        )}
                      </div>

                      {/* WhatsApp iOS Message Bubble */}
                      <div
                        className={`p-2.5 sm:px-3.5 sm:py-2 text-[15px] leading-relaxed transition-all relative ${
                          isMine
                            ? "bg-[#D9FDD3] dark:bg-[#005C4B] text-black dark:text-white bubble-sent-ios"
                            : "bg-white dark:bg-[#202C33] text-black dark:text-white bubble-recv-ios"
                        }`}
                      >
                        {/* Quoted Reply Card */}
                        {msg.replyTo && (
                          <div
                            className={`mb-2 p-2 rounded-[10px] text-[13px] border-l-4 ${
                              isMine
                                ? "bg-black/[0.06] dark:bg-black/25 border-[#00A884] text-black/80 dark:text-white/80"
                                : "bg-black/[0.04] dark:bg-black/25 border-[#00A884] text-black/80 dark:text-white/80"
                            }`}
                          >
                            <span className="font-semibold block truncate text-[#00A884] dark:text-[#34D399] text-[12px]">
                              {msg.replyTo.sender?.profile?.displayName || "Reply"}
                            </span>
                            <span className="truncate block text-[12px] opacity-80 mt-0.5">
                              {msg.replyTo.content || "Attachment"}
                            </span>
                          </div>
                        )}

                        {isDeleted ? (
                          <p className="italic text-[13px] opacity-60">
                            🚫 This message was deleted
                          </p>
                        ) : msg.isViewOnce ? (
                          /* WhatsApp Native View-Once Message Bubble */
                          <div className="my-0.5">
                            {msg.viewOnceOpened ? (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-black/[0.05] dark:bg-black/25 text-[#8E8E93] text-[14px] font-semibold select-none">
                                <span className="w-5 h-5 rounded-full border border-dashed border-[#8E8E93] flex items-center justify-center text-[11px] font-bold">
                                  1
                                </span>
                                <span>Opened</span>
                                <Check className="w-3.5 h-3.5 text-[#8E8E93] ml-1" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewOnceModalData(msg);
                                  fetch(`/api/messages/${msg.id}/view-once`, { method: "POST" }).catch(() => {});
                                }}
                                className="flex items-center gap-2.5 px-3.5 py-2 rounded-[14px] bg-[#00A884]/15 hover:bg-[#00A884]/25 text-[#00A884] dark:text-[#34D399] text-[14px] font-bold cursor-pointer transition-all active:scale-95 select-none"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#00A884] text-white flex items-center justify-center text-[11px] font-bold">
                                  1
                                </span>
                                <span>
                                  {msg.type === "IMAGE"
                                    ? "Photo"
                                    : msg.type === "VIDEO"
                                    ? "Video"
                                    : msg.type === "AUDIO"
                                    ? "Voice message"
                                    : "View Once"}
                                </span>
                                <span className="text-[11px] font-normal opacity-75 ml-2">Tap to view</span>
                              </button>
                            )}
                            {msg.content && msg.content !== "" && (
                              <p className="text-[13px] text-[#8E8E93] mt-1 px-1">
                                {msg.content}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Video Attachment (Interactive In-Chat Video Player) */}
                            {msg.type === "VIDEO" && msg.attachments?.[0] && (
                              <div className="mb-1.5 rounded-[18px] overflow-hidden max-w-sm relative shadow-xs border border-black/[0.06] dark:border-white/[0.08] bg-black">
                                <video
                                  src={msg.attachments[0].url}
                                  controls
                                  playsInline
                                  className="w-full h-auto max-h-80 object-cover rounded-[18px]"
                                />
                              </div>
                            )}

                            {/* Image Attachment (Single or Multi-Grid with Lightbox) */}
                            {msg.type === "IMAGE" && msg.attachments && msg.attachments.length > 0 && (
                              <div
                                className={`mb-1.5 rounded-[18px] overflow-hidden max-w-sm ${
                                  msg.attachments.length > 1 ? "grid grid-cols-2 gap-1" : ""
                                }`}
                              >
                                {msg.attachments.map((att, attIdx) => (
                                  <div
                                    key={attIdx}
                                    className="cursor-pointer group/img relative shadow-xs border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] overflow-hidden"
                                    onClick={() =>
                                      setActiveImageLightbox({
                                        url: att.url,
                                        fileName: att.fileName,
                                        senderName: msg.sender?.profile?.displayName || "User",
                                        time: timeStr,
                                      })
                                    }
                                  >
                                    <img
                                      src={att.url}
                                      alt="Attachment"
                                      className={`w-full ${
                                        msg.attachments!.length > 1 ? "h-36 object-cover" : "h-auto max-h-80 object-cover"
                                      } rounded-[14px] group-hover/img:scale-[1.02] transition-transform duration-200`}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors flex items-center justify-center">
                                      <span className="opacity-0 group-hover/img:opacity-100 px-3 py-1.5 bg-black/65 backdrop-blur-md rounded-full text-white text-[12px] font-bold shadow-lg transition-opacity flex items-center gap-1.5 scale-95 group-hover/img:scale-100 duration-150">
                                        <ImageIcon className="w-3.5 h-3.5" /> View Photo
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Voice Audio Player */}
                            {msg.type === "AUDIO" && msg.attachments?.[0] && (
                              <div className="my-1">
                                <AudioPlayer
                                  src={msg.attachments[0].url}
                                  duration={msg.attachments[0].duration}
                                  isMine={isMine}
                                />
                              </div>
                            )}

                            {/* File / Document Attachment */}
                            {msg.type === "FILE" && msg.attachments?.[0] && (
                              <a
                                href={msg.attachments[0].url}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className={`flex items-center gap-2.5 p-2.5 rounded-[12px] text-[13px] font-medium my-1 transition-colors ${
                                  isMine
                                    ? "bg-black/[0.05] dark:bg-black/25 hover:bg-black/[0.08]"
                                    : "bg-black/[0.04] dark:bg-black/25 hover:bg-black/[0.07]"
                                }`}
                              >
                                <FileText className="w-6 h-6 text-[#00A884] dark:text-[#34D399] flex-shrink-0 stroke-[1.8]" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{msg.attachments[0].fileName}</p>
                                  <p className="text-[11px] opacity-70">
                                    {Math.round(msg.attachments[0].fileSize / 1024)} KB
                                  </p>
                                </div>
                                <Download className="w-4 h-4 flex-shrink-0 opacity-70" />
                              </a>
                            )}

                            {/* Text Content */}
                            {msg.content && (
                              <p className="selectable-text whitespace-pre-wrap break-words font-normal">
                                {msg.content}
                              </p>
                            )}
                          </>
                        )}

                        {/* Inline Time & Read Receipts Ticks */}
                        <div className="flex items-center justify-end gap-1 text-[11px] text-[#8E8E93] dark:text-[#8E8E93] mt-0.5 ml-3 float-right select-none">
                          {msg.isPinned && <Pin className="w-3 h-3 fill-current stroke-[1.5]" />}
                          <span>{timeStr}</span>

                          {isMine && !isDeleted && (
                            <span className="ml-0.5">
                              {msg.status === "READ" ? (
                                <CheckCheck className="w-4 h-4 text-[#53BDEB] stroke-[2.2]" />
                              ) : msg.status === "DELIVERED" ? (
                                <CheckCheck className="w-4 h-4 text-[#8E8E93] stroke-[2]" />
                              ) : (
                                <Check className="w-4 h-4 text-[#8E8E93] stroke-[2]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reaction Pill Badges at Bubble Bottom Edge */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 -mt-2.5 z-10 relative ${isMine ? "justify-end mr-2" : "justify-start ml-2"}`}>
                          {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji) => {
                            const count = msg.reactions.filter((r) => r.emoji === emoji).length;
                            return (
                              <span
                                key={emoji}
                                onClick={() => onSendReaction(msg.id, emoji)}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[12px] bg-white dark:bg-[#202C33] border border-black/[0.08] dark:border-white/[0.08] shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                              >
                                <span>{emoji}</span>
                                {count > 1 && <span className="text-[11px] font-semibold">{count}</span>}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex items-start my-1 animate-fade-in">
              <div className="px-3.5 py-2 rounded-[16px] rounded-bl-[4px] bg-white dark:bg-[#202C33] shadow-xs flex items-center gap-1 text-[#8E8E93]">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Replying Preview Bar (iOS Style) */}
        {replyingTo && (
          <div className="px-4 py-2 bg-[#F6F6F6] dark:bg-[#1E1E1E] border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[13px] animate-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="w-4 h-4 text-[#007AFF] flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-[#007AFF]">
                  Replying to {replyingTo.sender?.profile?.displayName || "User"}
                </span>
                <p className="text-[#8E8E93] truncate text-[12px]">
                  {replyingTo.content || "Attachment"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 text-[#8E8E93] hover:text-black dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* iOS Attachment Action Sheet Popup */}
        {showAttachMenu && (
          <div className="absolute bottom-[68px] left-3 z-50 bg-white/95 dark:bg-[#2C2C2E]/95 ios-blur rounded-[16px] shadow-ios-sheet border border-black/[0.08] dark:border-white/[0.08] p-2 min-w-[200px] animate-pop-in">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span>Photos & Videos</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF2D55]/15 text-[#FF2D55] flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span>Camera</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[14px] text-black dark:text-white font-medium text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Document</span>
            </button>
          </div>
        )}

        {/* Bottom Message Input Bar (Modern WhatsApp iOS Style) */}
        <div className="p-2 sm:px-3 sm:py-2.5 bg-[#F6F6F6]/90 dark:bg-[#1E1E1E]/90 ios-blur border-t border-black/[0.08] dark:border-white/[0.08] relative z-20">
          {/* Meta AI Quick Prompt Suggestion Chips */}
          {isMetaAI && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none animate-fade-in select-none">
              {[
                "💡 Weekend ideas",
                "📝 Write an email",
                "💻 Explain React hooks",
                "🌍 Translate to Urdu",
                "⚡ Tell a cool fact",
              ].map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => {
                    setInputText(promptText);
                    textareaRef.current?.focus();
                  }}
                  className="px-3 py-1 rounded-full bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.08] text-[12px] text-black dark:text-white font-medium hover:bg-[#00D2FF]/10 dark:hover:bg-[#00D2FF]/10 hover:border-[#00D2FF]/30 transition-all whitespace-nowrap shadow-xs active:scale-95 flex-shrink-0"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-3 z-50 animate-pop-in">
              <EmojiPicker
                onSelectEmoji={(emoji) => setInputText((prev) => prev + emoji)}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          {showVoiceRecorder ? (
            <VoiceRecorder
              onSendVoice={(audioUrl, duration, isViewOnce) => {
                onSendMessage({
                  content: "",
                  type: "AUDIO",
                  isViewOnce: !!isViewOnce,
                  attachments: [
                    {
                      url: audioUrl,
                      fileName: "voice_note.webm",
                      fileType: "audio/webm",
                      fileSize: 15000,
                      duration,
                    },
                  ],
                });
                setShowVoiceRecorder(false);
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <div className="flex items-end gap-2">
              {/* Attachment Plus '+' Button */}
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex-shrink-0 ${
                  showAttachMenu ? "text-[#007AFF] rotate-45" : "text-[#007AFF] dark:text-[#0A84FF]"
                }`}
                title="Attach"
              >
                <Plus className="w-6 h-6 stroke-[2.2] transition-transform" />
              </button>

              {/* iOS Pill Input Container */}
              <div className="flex-1 flex items-center bg-white dark:bg-[#2C2C2E] rounded-[20px] px-3.5 py-1.5 border border-black/[0.06] dark:border-white/[0.06] shadow-xs">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message"
                  className="selectable-text flex-1 bg-transparent border-none text-[15px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-0 resize-none max-h-28 py-1 leading-normal font-ios"
                />

                {/* View Once Toggle Button in Input Bar */}
                <button
                  type="button"
                  onClick={() => setIsViewOnceInput((prev) => !prev)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all flex-shrink-0 mr-1.5 ${
                    isViewOnceInput
                      ? "bg-[#00A884] text-white ring-2 ring-[#00A884]/40 scale-105"
                      : "border border-dashed border-[#8E8E93] text-[#8E8E93] hover:text-[#00A884] hover:border-[#00A884]"
                  }`}
                  title={isViewOnceInput ? "View Once Enabled" : "Send as View Once (Photo/Video/Audio)"}
                >
                  1
                </button>

                {/* Emoji Trigger */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-[#8E8E93] hover:text-[#007AFF] rounded-full transition-colors flex-shrink-0"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>

              {/* Right Action: Camera & Voice Note / Send Button */}
              {inputText.trim() ? (
                <button
                  type="button"
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#009272] text-white flex items-center justify-center shadow-xs transition-all active:scale-95 flex-shrink-0 animate-pop-in"
                  title="Send"
                >
                  <Send className="w-4 h-4 ml-0.5 stroke-[2.2]" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full active:scale-95 transition-all flex-shrink-0"
                    title="Camera"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#00A884]" />
                    ) : (
                      <Camera className="w-5 h-5 stroke-[2]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVoiceRecorder(true)}
                    className="p-2 text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full active:scale-95 transition-all flex-shrink-0"
                    title="Voice Note"
                  >
                    <Mic className="w-5 h-5 stroke-[2]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Simulated Live Call Modal with iOS Dark Blur */}
      {activeCallModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-[28px] w-full max-w-sm p-6 text-center text-white space-y-6 shadow-2xl">
            <div className="flex flex-col items-center space-y-3">
              <Avatar
                src={avatar}
                name={title || undefined}
                username={username || undefined}
                size="xl"
                isOnline={true}
              />
              <div>
                <h3 className="text-[20px] font-bold font-ios">{title}</h3>
                <p className="text-[13px] text-[#34D399] font-medium">{formatUsername(username)}</p>
                <p className="text-[14px] text-[#34C759] font-semibold mt-2 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
                  <span>{activeCallModal === "VOICE" ? "Voice Call" : "Video Call"} • {formatSecs(callDurationSeconds)}</span>
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#34D399] text-[11px] font-bold">
                    <span>✨ HD Audio • Noise Suppressed</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 pt-2">
              <button
                type="button"
                onClick={() => setIsCallMuted((prev) => !prev)}
                className={`p-3.5 rounded-full transition-all active:scale-95 ${
                  isCallMuted
                    ? "bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title={isCallMuted ? "Unmute" : "Mute"}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => handleEndCall("COMPLETED")}
                className="p-4 rounded-full bg-[#FF3B30] hover:bg-[#D70015] text-white shadow-lg shadow-[#FF3B30]/30 active:scale-95 transition-all"
                title="End Call"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </button>

              <button
                type="button"
                onClick={() => setIsCallVideoDisabled((prev) => !prev)}
                className={`p-3.5 rounded-full transition-all active:scale-95 ${
                  isCallVideoDisabled
                    ? "bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title={isCallVideoDisabled ? "Turn Video On" : "Turn Video Off"}
              >
                {isCallVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Contact / Group Info Drawer */}
      {showRightDrawer && (
        <aside className="w-72 sm:w-80 bg-white dark:bg-[#1C1C1E] border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col h-full overflow-y-auto p-4 z-30 animate-slide-in-right">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
            <h3 className="font-bold text-[16px] text-black dark:text-white font-ios">
              {isGroup ? "Group Info" : "Contact Info"}
            </h3>
            <button
              type="button"
              onClick={() => setShowRightDrawer(false)}
              className="p-1 rounded-lg text-[#8E8E93] hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <Avatar
              src={avatar}
              name={title || undefined}
              username={username || undefined}
              size="xl"
              isOnline={!!isOnline}
              showOnlineIndicator={!isGroup}
            />

            {!isGroup && !isSelf && conversation.otherUser ? (
              <div className="w-full flex flex-col items-center">
                {isEditingDrawerName ? (
                  <div className="w-full space-y-2 pt-1 animate-fade-in">
                    <input
                      type="text"
                      value={drawerNameInput}
                      onChange={(e) => setDrawerNameInput(e.target.value)}
                      placeholder={conversation.otherUser.displayName}
                      autoFocus
                      className="w-full px-3 py-1.5 text-[14px] font-semibold text-black dark:text-white bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px] border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-center"
                    />

                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDrawerNameInput(`@${conversation.otherUser!.username}`)}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399]"
                      >
                        Use @username
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerNameInput(conversation.otherUser!.displayName)}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#767680]/15 text-[#8E8E93]"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingDrawerName(false)}
                        className="px-3 py-1 text-[12px] text-[#8E8E93]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (conversation.otherUser?.username) {
                            setCustomContactName(conversation.otherUser.username, drawerNameInput);
                          }
                          setIsEditingDrawerName(false);
                        }}
                        className="px-3 py-1 bg-[#007AFF] text-white text-[12px] font-bold rounded-[8px]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <h4 className="font-bold text-[18px] text-black dark:text-white font-ios truncate">
                        {title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerNameInput(title || "");
                          setIsEditingDrawerName(true);
                        }}
                        className="p-1 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors"
                        title="Edit Contact Name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {username && (
                      <span className="text-[13px] font-medium text-[#00A884] dark:text-[#34D399]">
                        {formatUsername(username)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-[18px] text-black dark:text-white font-ios">
                  {title}
                </h4>
                {username && (
                  <span className="text-[13px] font-medium text-[#00A884] dark:text-[#34D399]">
                    {formatUsername(username)}
                  </span>
                )}
              </div>
            )}

            {conversation.otherUser?.bio && (
              <p className="text-[13px] text-[#8E8E93] px-3 py-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] mt-2">
                {conversation.otherUser.bio}
              </p>
            )}
          </div>

          <div className="pt-4 space-y-2 mt-auto">
            {!isGroup && !isSelf && conversation.otherUser && onBlockUser && (
              <button
                type="button"
                onClick={() => onBlockUser(conversation.otherUser!.id)}
                className="w-full py-2.5 px-3 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[13px] font-semibold text-black dark:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Ban className="w-4 h-4 text-[#8E8E93]" />
                <span>Block Contact</span>
              </button>
            )}

            {!isSelf && onReport && (
              <button
                type="button"
                onClick={() =>
                  onReport(
                    isGroup ? "GROUP" : "USER",
                    isGroup ? conversation.id : conversation.otherUser?.id || conversation.id
                  )
                }
                className="w-full py-2.5 px-3 rounded-[12px] bg-[#FF3B30]/10 text-[#FF3B30] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report {isGroup ? "Group" : "Contact"}</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* WhatsApp View-Once Media Viewer Modal */}
      {viewOnceModalData && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none"
          onClick={() => setViewOnceModalData(null)}
        >
          <header className="flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00A884] text-white flex items-center justify-center text-[12px] font-bold">
                1
              </span>
              <span className="font-bold text-[16px] font-ios">
                View Once Media
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewOnceModalData(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div
            className="flex-1 flex items-center justify-center p-4 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {viewOnceModalData.type === "IMAGE" && viewOnceModalData.attachments?.[0] && (
              <img
                src={viewOnceModalData.attachments[0].url}
                alt="View Once Photo"
                className="max-w-full max-h-full object-contain rounded-[20px] shadow-2xl animate-scale-in"
              />
            )}

            {viewOnceModalData.type === "VIDEO" && viewOnceModalData.attachments?.[0] && (
              <video
                src={viewOnceModalData.attachments[0].url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-[20px] shadow-2xl"
              />
            )}

            {viewOnceModalData.type === "AUDIO" && viewOnceModalData.attachments?.[0] && (
              <div className="w-full max-w-md p-6 bg-[#1C1C1E] rounded-[24px] border border-white/10 shadow-2xl space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#00A884]/20 text-[#00A884] flex items-center justify-center mx-auto">
                  <Mic className="w-8 h-8" />
                </div>
                <p className="text-white font-bold text-[18px]">
                  View Once Voice Note
                </p>
                <audio
                  src={viewOnceModalData.attachments[0].url}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
          </div>

          <footer className="text-center text-white/60 text-[12px] pb-2">
            This media will expire immediately after you close it.
          </footer>
        </div>
      )}

      {/* Interactive Fullscreen Image Lightbox Modal */}
      {activeImageLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-fade-in select-none"
          onClick={() => setActiveImageLightbox(null)}
        >
          {/* Top Header */}
          <div
            className="flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold text-[16px] font-ios">{activeImageLightbox.senderName || "User"}</p>
                <p className="text-[12px] text-white/70">{activeImageLightbox.time || "Photo"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeImageLightbox.url}
                download={activeImageLightbox.fileName || "chatflow-image.jpg"}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveImageLightbox(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image Display */}
          <div
            className="flex-1 flex items-center justify-center p-2 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImageLightbox.url}
              alt="Photo Preview"
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-[20px] shadow-2xl animate-scale-in"
            />
          </div>

          <footer className="text-center text-white/50 text-[12px] pb-2">
            Tap outside or click ✕ to close
          </footer>
        </div>
      )}

      {/* WhatsApp Media Studio Editor & Multi-Send Preview Modal */}
      {mediaStudioFiles && mediaStudioFiles.length > 0 && (
        <MediaStudioModal
          isOpen={true}
          initialFiles={mediaStudioFiles}
          onClose={() => setMediaStudioFiles(null)}
          onSend={handleSendMediaStudio}
        />
      )}
    </div>
  );
}
