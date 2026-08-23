"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Ban,
  ShieldAlert,
  Users,
  Calendar,
  Phone,
  Video,
  Loader2,
  Share2,
  QrCode,
  Pencil,
  Check,
  RotateCcw,
  AtSign,
  Image as ImageIcon,
  Film,
  FileText,
  Music,
  Download,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import {
  getCustomContactName,
  setCustomContactName,
  removeCustomContactName,
} from "@/utils/contactNames";
import { format } from "date-fns";

interface UserProfileModalProps {
  username: string;
  onClose: () => void;
  onStartChat: (user: { id: string; username: string }) => void;
  onReport: (targetType: "USER", targetId: string) => void;
  onBlockUser: (userId: string) => void;
  onOpenQRCode?: (username: string) => void;
}

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  duration?: number | null;
  category: "MEDIA" | "DOCS" | "AUDIO";
  isMine: boolean;
  caption?: string;
  createdAt: string;
}

export function UserProfileModal({
  username,
  onClose,
  onStartChat,
  onReport,
  onBlockUser,
  onOpenQRCode,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [customName, setCustomName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Shared Media Section State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaCounts, setMediaCounts] = useState({ total: 0, media: 0, docs: 0, audio: 0 });
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"MEDIA" | "DOCS" | "AUDIO">("MEDIA");
  const [activeLightboxItem, setActiveLightboxItem] = useState<MediaItem | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const refreshName = (currentProfile: any) => {
    if (!currentProfile) return;
    const name = getCustomContactName(currentProfile.username, currentProfile.displayName);
    setCustomName(name);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          refreshName(data.user);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [username]);

  // Load shared media files
  useEffect(() => {
    async function loadMedia() {
      setIsLoadingMedia(true);
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}/media`);
        if (res.ok) {
          const data = await res.json();
          setMediaItems(data.media || []);
          if (data.counts) {
            setMediaCounts(data.counts);
          }
        }
      } catch (err) {
        console.error("Failed to load user media:", err);
      } finally {
        setIsLoadingMedia(false);
      }
    }
    if (username) {
      loadMedia();
    }
  }, [username]);

  const handleSaveCustomName = (nameToSave: string) => {
    if (!profile) return;
    setCustomContactName(profile.username, nameToSave);
    setCustomName(nameToSave.trim() || profile.displayName);
    setIsEditingName(false);
  };

  const handleResetToDefault = () => {
    if (!profile) return;
    removeCustomContactName(profile.username);
    setCustomName(profile.displayName);
    setIsEditingName(false);
  };

  const handleSetToUsername = () => {
    if (!profile) return;
    const usernameName = `@${profile.username}`;
    handleSaveCustomName(usernameName);
  };

  const filteredMedia = mediaItems.filter((item) => item.category === mediaTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* iOS Navigation Header Bar */}
        <header className="h-[56px] px-4 bg-[#F6F6F6]/90 dark:bg-[#1C1C1E]/90 ios-blur border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between z-20 flex-shrink-0">
          <span className="text-[17px] font-bold text-black dark:text-white font-ios">
            Contact Info
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center text-[13px] font-bold active:scale-95 transition-all cursor-pointer"
          >
            ✕
          </button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A884]" />
          </div>
        ) : error || !profile ? (
          <div className="text-center py-12 p-4 flex-1">
            <p className="text-[#FF3B30] font-semibold text-[15px]">{error || "User not found"}</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* WhatsApp Profile Avatar Card */}
            <div className="bg-white dark:bg-[#2C2C2E] rounded-[22px] p-5 shadow-xs flex flex-col items-center text-center space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
              <Avatar
                src={profile.avatar}
                name={customName || profile.displayName}
                username={profile.username}
                size="xl"
                isOnline={profile.isOnline}
                showOnlineIndicator={true}
              />

              <div className="w-full flex flex-col items-center">
                {isEditingName ? (
                  <div className="w-full space-y-2 pt-1 animate-fade-in">
                    <label className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                      Edit Contact Name / Nickname
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder={profile.displayName}
                      autoFocus
                      className="w-full px-3.5 py-2 text-[15px] font-semibold text-black dark:text-white bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-center"
                    />

                    {/* Shortcut helper buttons */}
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={handleSetToUsername}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] hover:bg-[#00A884]/25 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <AtSign className="w-3 h-3" />
                        <span>Use @{profile.username}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-4 py-1.5 text-[13px] font-medium text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCustomName(nameInput)}
                        className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[13px] font-bold rounded-[10px] shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Name</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-1.5 max-w-full">
                      <h3 className="text-[22px] font-bold text-black dark:text-white font-ios leading-tight truncate">
                        {customName || profile.displayName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(customName || profile.displayName);
                          setIsEditingName(true);
                        }}
                        className="p-1.5 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors active:scale-95 cursor-pointer"
                        title="Edit Contact Name / Nickname"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>

                    {customName && customName !== profile.displayName && (
                      <p className="text-[12px] text-[#8E8E93]">
                        Original: {profile.displayName}
                      </p>
                    )}

                    <p className="text-[14px] font-semibold text-[#00A884] dark:text-[#34D399] mt-0.5">
                      {formatUsername(profile.username)}
                    </p>

                    {profile.username === "meta_ai" && (
                      <div className="mt-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#00D2FF]/20 via-[#9B51E0]/20 to-[#FF2A6D]/20 text-[#007AFF] dark:text-[#38BDF8] border border-[#00D2FF]/30">
                          Official AI Assistant ✨
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F2F2F7] dark:bg-[#1C1C1E] text-[#8E8E93]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.username === "meta_ai" || profile.isOnline ? "bg-[#34C759] animate-pulse" : "bg-[#8E8E93]"
                  }`}
                />
                <span>
                  {profile.username === "meta_ai"
                    ? "Always Online"
                    : profile.isOnline
                    ? "Online"
                    : profile.lastSeen
                    ? `Last seen ${format(new Date(profile.lastSeen), "MMM d, h:mm a")}`
                    : "Offline"}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Message, Audio, Video) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onStartChat({ id: profile.id, username: profile.username });
                  onClose();
                }}
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Message</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Starting voice call with " + profile.displayName)}
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <Phone className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Audio</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Starting video call with " + profile.displayName)}
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <Video className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Video</span>
              </button>
            </div>

            {/* WhatsApp Media, Links & Docs Card */}
            <div className="bg-white dark:bg-[#2C2C2E] rounded-[20px] p-4 shadow-xs border border-black/[0.04] dark:border-white/[0.06] space-y-3">
              {/* Media Header & Toggle */}
              <div
                onClick={() => setIsMediaExpanded(!isMediaExpanded)}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00A884]/15 text-[#00A884] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-black dark:text-white font-ios">
                      Media, Links & Docs
                    </h4>
                    <p className="text-[11px] text-[#8E8E93]">
                      All shared photos, videos, files & voice notes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#8E8E93] group-hover:text-[#00A884] transition-colors">
                  <span className="text-[13px] font-bold">
                    {mediaCounts.total}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isMediaExpanded ? "rotate-90" : ""}`} />
                </div>
              </div>

              {/* Horizontal Preview Strip (When Collapsed) */}
              {!isMediaExpanded && (
                <div className="pt-1">
                  {isLoadingMedia ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#8E8E93]" />
                    </div>
                  ) : mediaItems.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {mediaItems.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.category === "MEDIA") setActiveLightboxItem(item);
                            else setIsMediaExpanded(true);
                          }}
                          className="aspect-square rounded-[12px] bg-[#F2F2F7] dark:bg-[#1C1C1E] overflow-hidden relative cursor-pointer group/thumb border border-black/[0.04] dark:border-white/[0.06]"
                        >
                          {item.fileType.startsWith("video/") ? (
                            <div className="w-full h-full bg-black/60 flex items-center justify-center text-white">
                              <Film className="w-6 h-6 text-[#00A884]" />
                            </div>
                          ) : item.category === "MEDIA" ? (
                            <img
                              src={item.url}
                              alt={item.fileName}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                            />
                          ) : item.category === "AUDIO" ? (
                            <div className="w-full h-full flex items-center justify-center text-[#007AFF]">
                              <Music className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#5856D6]">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#8E8E93] text-center py-2">
                      No media, docs, or voice notes shared yet
                    </p>
                  )}
                </div>
              )}

              {/* Expanded Categorized View (Media / Docs / Audio Tabs) */}
              {isMediaExpanded && (
                <div className="space-y-3 pt-2 animate-fade-in border-t border-black/[0.04] dark:border-white/[0.06]">
                  {/* Category Tabs */}
                  <div className="flex items-center p-1 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[14px] text-[13px] font-bold">
                    <button
                      type="button"
                      onClick={() => setMediaTab("MEDIA")}
                      className={`flex-1 py-1.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mediaTab === "MEDIA"
                          ? "bg-white dark:bg-[#2C2C2E] text-[#00A884] shadow-xs"
                          : "text-[#8E8E93] hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Media ({mediaCounts.media})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaTab("DOCS")}
                      className={`flex-1 py-1.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mediaTab === "DOCS"
                          ? "bg-white dark:bg-[#2C2C2E] text-[#00A884] shadow-xs"
                          : "text-[#8E8E93] hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Docs ({mediaCounts.docs})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaTab("AUDIO")}
                      className={`flex-1 py-1.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mediaTab === "AUDIO"
                          ? "bg-white dark:bg-[#2C2C2E] text-[#00A884] shadow-xs"
                          : "text-[#8E8E93] hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>Audio ({mediaCounts.audio})</span>
                    </button>
                  </div>

                  {/* Tab Content Display */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredMedia.length === 0 ? (
                      <div className="text-center py-6 text-[#8E8E93] text-[13px]">
                        No {mediaTab.toLowerCase()} items found
                      </div>
                    ) : mediaTab === "MEDIA" ? (
                      /* Photos & Videos 3-Column Grid */
                      <div className="grid grid-cols-3 gap-2">
                        {filteredMedia.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setActiveLightboxItem(item)}
                            className="aspect-square rounded-[12px] bg-black/10 overflow-hidden relative cursor-pointer group border border-black/[0.06] dark:border-white/[0.08]"
                          >
                            {item.fileType.startsWith("video/") ? (
                              <div className="w-full h-full bg-black/80 flex items-center justify-center text-white relative">
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Film className="w-6 h-6 text-[#00A884]" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : mediaTab === "DOCS" ? (
                      /* Document Files List */
                      <div className="space-y-1.5">
                        {filteredMedia.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            download={item.fileName}
                            className="flex items-center gap-3 p-2.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#1C1C1E] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-black dark:text-white truncate">
                                {item.fileName}
                              </p>
                              <p className="text-[11px] text-[#8E8E93]">
                                {Math.round(item.fileSize / 1024)} KB • {format(new Date(item.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <Download className="w-4 h-4 text-[#8E8E93] hover:text-[#00A884] flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      /* Voice Notes & Audio List */
                      <div className="space-y-1.5">
                        {filteredMedia.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#1C1C1E]"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setPlayingAudioId(playingAudioId === item.id ? null : item.id);
                              }}
                              className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all cursor-pointer"
                            >
                              {playingAudioId === item.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-black dark:text-white truncate">
                                Voice Note ({item.duration ? `${item.duration}s` : "Audio"})
                              </p>
                              <p className="text-[11px] text-[#8E8E93]">
                                {format(new Date(item.createdAt), "MMM d, h:mm a")}
                              </p>
                              {playingAudioId === item.id && (
                                <audio
                                  src={item.url}
                                  autoPlay
                                  onEnded={() => setPlayingAudioId(null)}
                                  className="hidden"
                                />
                              )}
                            </div>
                            <a
                              href={item.url}
                              download={item.fileName || "voice-note.webm"}
                              className="p-1.5 text-[#8E8E93] hover:text-[#00A884] rounded-full"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bio Inset Card */}
            {profile.bio && (
              <div className="p-4 rounded-[20px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  About
                </span>
                <p className="text-[14px] text-black dark:text-white leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Metadata Grouped Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3.5 rounded-[18px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2.5 shadow-xs">
                <Calendar className="w-4 h-4 text-[#007AFF]" />
                <div>
                  <p className="text-[11px] text-[#8E8E93]">Joined</p>
                  <p className="font-semibold text-black dark:text-white text-[13px]">
                    {profile.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "Recently"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[18px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2.5 shadow-xs">
                <Users className="w-4 h-4 text-[#007AFF]" />
                <div>
                  <p className="text-[11px] text-[#8E8E93]">Groups</p>
                  <p className="font-semibold text-black dark:text-white text-[13px]">
                    {profile.sharedGroupsCount || 0} mutual
                  </p>
                </div>
              </div>
            </div>

            {/* Safety & Moderation Actions */}
            {profile.username !== "meta_ai" && (
              <div className="bg-white dark:bg-[#2C2C2E] rounded-[20px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onBlockUser(profile.id);
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-[14px] font-semibold text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Ban className="w-4 h-4 text-[#8E8E93]" />
                  <span>{profile.hasBlocked ? "Unblock Contact" : "Block Contact"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onReport("USER", profile.id);
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-[14px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Report Contact</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Media Lightbox / Video Viewer Modal */}
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-fade-in text-white"
            onClick={() => setActiveLightboxItem(null)}
          >
            <div className="flex items-center justify-between z-20">
              <div>
                <p className="text-[15px] font-bold font-ios">{activeLightboxItem.fileName}</p>
                <p className="text-[12px] text-white/70">
                  {format(new Date(activeLightboxItem.createdAt), "MMMM d, yyyy • h:mm a")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeLightboxItem.url}
                  download={activeLightboxItem.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveLightboxItem(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 flex items-center justify-center p-2 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeLightboxItem.fileType.startsWith("video/") ? (
                <video
                  src={activeLightboxItem.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                />
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.fileName}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {activeLightboxItem.caption && (
              <div className="text-center text-white/90 text-[14px] bg-black/40 backdrop-blur-sm p-2 rounded-xl max-w-lg mx-auto">
                {activeLightboxItem.caption}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
