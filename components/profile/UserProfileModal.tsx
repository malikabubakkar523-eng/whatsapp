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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import {
  getCustomContactName,
  setCustomContactName,
  removeCustomContactName,
  CONTACT_NAME_CHANGE_EVENT,
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* iOS Navigation Bar */}
        <header className="h-[54px] px-4 bg-[#F6F6F6]/90 dark:bg-[#1C1C1E]/90 ios-blur border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between z-20">
          <span className="text-[17px] font-bold text-black dark:text-white font-ios">
            Contact Info
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center text-[12px]"
          >
            ✕
          </button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A884]" />
          </div>
        ) : error || !profile ? (
          <div className="text-center py-12 p-4">
            <p className="text-[#FF3B30] font-semibold text-[15px]">{error || "User not found"}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* WhatsApp Profile Avatar Card */}
            <div className="bg-white dark:bg-[#2C2C2E] rounded-[20px] p-5 shadow-xs flex flex-col items-center text-center space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
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
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] hover:bg-[#00A884]/25 transition-colors flex items-center gap-1"
                      >
                        <AtSign className="w-3 h-3" />
                        <span>Use @{profile.username}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-4 py-1.5 text-[13px] font-medium text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCustomName(nameInput)}
                        className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[13px] font-bold rounded-[10px] shadow-xs active:scale-95 transition-all flex items-center gap-1"
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
                        className="p-1.5 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors active:scale-95"
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
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs"
              >
                <MessageSquare className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Message</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Starting voice call with " + profile.displayName)}
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs"
              >
                <Phone className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Audio</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Starting video call with " + profile.displayName)}
                className="p-3 rounded-[16px] bg-white dark:bg-[#2C2C2E] text-[#007AFF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs"
              >
                <Video className="w-5 h-5 stroke-[2]" />
                <span className="text-[12px] font-semibold">Video</span>
              </button>
            </div>

            {/* Bio Inset Card */}
            {profile.bio && (
              <div className="p-4 rounded-[16px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
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
              <div className="p-3.5 rounded-[16px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2.5 shadow-xs">
                <Calendar className="w-4 h-4 text-[#007AFF]" />
                <div>
                  <p className="text-[11px] text-[#8E8E93]">Joined</p>
                  <p className="font-semibold text-black dark:text-white text-[13px]">
                    {profile.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "Recently"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[16px] bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2.5 shadow-xs">
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
              <div className="bg-white dark:bg-[#2C2C2E] rounded-[16px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onBlockUser(profile.id);
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-[14px] font-semibold text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] flex items-center justify-center gap-2 transition-colors"
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
                  className="w-full px-4 py-3 text-[14px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/5 flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Report Contact</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

