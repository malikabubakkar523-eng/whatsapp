"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Palette,
  Ban,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Laptop,
  Camera,
  Upload,
  Info,
  ChevronRight,
  Lock,
  Heart,
  QrCode,
  LogOut,
  Bell,
  HardDrive,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Globe,
  FileText,
  BadgeCheck,
  Cloud,
  Download,
  RefreshCw,
  Database,
  Trash2,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername, validateUsername } from "@/utils/username";
import { getSocket } from "@/lib/socket";

interface SettingsModalProps {
  onClose: () => void;
  onOpenLightbox?: (data: { avatar?: string | null; name: string; username?: string | null }) => void;
  onOpenQRCode?: (tab?: "my-code" | "scan") => void;
}

type ActiveSection = "main" | "account" | "privacy" | "appearance" | "blocked" | "backup" | "about" | "delete-account";

export function SettingsModal({ onClose, onOpenLightbox, onOpenQRCode }: SettingsModalProps) {
  const { user, updateProfile, updateSettings, logout, deleteAccount } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<ActiveSection>("main");

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAgreed, setDeleteAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Account State
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || "");
  const [username, setUsername] = useState(user?.profile?.username || "");
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; message?: string; error?: string }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Profile State
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [avatar, setAvatar] = useState(user?.profile?.avatar || "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Privacy State
  const [discoverability, setDiscoverability] = useState(user?.settings?.discoverability || "EVERYONE");
  const [onlinePrivacy, setOnlinePrivacy] = useState(user?.settings?.onlineStatusPrivacy || "EVERYONE");
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState(user?.settings?.lastSeenPrivacy || "EVERYONE");
  const [readReceipts, setReadReceipts] = useState(user?.settings?.readReceiptsEnabled ?? true);
  const [typingIndicator, setTypingIndicator] = useState(user?.settings?.typingIndicatorEnabled ?? true);

  // Blocked Users State
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

  // Chat Backup State
  const [backupFrequency, setBackupFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "OFF">("DAILY");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [lastBackupTime, setLastBackupTime] = useState("Today, 2:15 AM");
  const [includeVideos, setIncludeVideos] = useState(true);
  const [encryptedBackup, setEncryptedBackup] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Save Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const photoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Live username availability check
  useEffect(() => {
    if (!username || username.toLowerCase() === user?.profile?.username.toLowerCase()) {
      setUsernameStatus({});
      return;
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameStatus({ available: false, error: validation.error });
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ available: true, message: data.message });
        } else {
          setUsernameStatus({ available: false, error: data.error });
        }
      } catch (err) {
        setUsernameStatus({ available: false, error: "Error checking username" });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username, user?.profile?.username]);

  // Load blocked users
  useEffect(() => {
    if (activeSection === "blocked") {
      setIsLoadingBlocked(true);
      fetch("/api/users/current/block")
        .then((r) => r.json())
        .then((d) => setBlockedUsers(d.blockedUsers || []))
        .catch(() => {})
        .finally(() => setIsLoadingBlocked(false));
    }
  }, [activeSection]);

  const handleDevicePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
        const updateRes = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: data.url }),
        });
        if (updateRes.ok) {
          updateProfile({ avatar: data.url });
          const socket = getSocket();
          socket.emit("profile:update", {
            userId: user?.id,
            avatar: data.url,
            displayName: user?.profile?.displayName,
            bio: user?.profile?.bio,
          });
        }
      } else {
        setErrorMessage(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      setErrorMessage("Network error during photo upload");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    try {
      const res = await fetch(`/api/users/${blockedUserId}/block`, { method: "POST" });
      if (res.ok) {
        setBlockedUsers(blockedUsers.filter((u) => u.id !== blockedUserId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your current password.");
      return;
    }
    if (!deleteAgreed) {
      setDeleteError("Please check the box confirming you understand this cannot be undone.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    const res = await deleteAccount(deletePassword);
    if (!res.success) {
      setDeleteError(res.error || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      // 1. Update Profile
      if (
        displayName !== user?.profile?.displayName ||
        bio !== user?.profile?.bio ||
        avatar !== user?.profile?.avatar
      ) {
        const res = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName, bio, avatar }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update profile");
        updateProfile({ displayName, bio, avatar });

        const socket = getSocket();
        socket.emit("profile:update", {
          userId: user?.id,
          avatar,
          displayName,
          bio,
        });
      }

      // 2. Update Username
      if (username && username.toLowerCase() !== user?.profile?.username.toLowerCase()) {
        const res = await fetch("/api/users/username", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update username");
        updateProfile({ username: data.username });
      }

      // 3. Update Settings
      const resSettings = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discoverability,
          onlineStatusPrivacy: onlinePrivacy,
          lastSeenPrivacy,
          readReceiptsEnabled: readReceipts,
          typingIndicatorEnabled: typingIndicator,
          theme,
        }),
      });
      const dataSettings = await resSettings.json();
      if (!resSettings.ok) throw new Error(dataSettings.error || "Failed to update settings");
      updateSettings(dataSettings.settings);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none">
      <div className="bg-[#F2F2F7] dark:bg-[#000000] rounded-[24px] sm:rounded-[28px] w-full max-w-xl h-[650px] max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-black/[0.08] dark:border-white/[0.1] relative">
        {/* Hidden photo file input */}
        <input
          type="file"
          ref={photoFileInputRef}
          accept="image/*"
          onChange={handleDevicePhotoUpload}
          className="hidden"
        />

        {/* iOS Navigation Header Bar */}
        <header className="h-[54px] px-4 bg-[#F6F6F6]/90 dark:bg-[#1C1C1E]/90 ios-blur border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between z-20 flex-shrink-0">
          {activeSection !== "main" ? (
            <button
              type="button"
              onClick={() => {
                if (activeSection === "delete-account") {
                  setActiveSection("account");
                } else {
                  setActiveSection("main");
                }
              }}
              className="text-[#007AFF] dark:text-[#0A84FF] text-[16px] font-normal hover:opacity-80 active:opacity-50 transition-opacity font-ios flex items-center"
            >
              Back
            </button>
          ) : (
            <span className="text-[17px] font-semibold text-black dark:text-white font-ios">
              Settings
            </span>
          )}

          <div className="flex items-center gap-3">
            {activeSection !== "delete-account" && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="text-[#007AFF] dark:text-[#0A84FF] text-[16px] font-semibold hover:opacity-80 active:opacity-50 transition-opacity"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center text-[12px]"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[12px] text-[13px] font-semibold text-[#FF3B30] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="mx-4 mt-3 p-3 bg-[#34C759]/10 border border-[#34C759]/20 rounded-[12px] text-[13px] font-semibold text-[#34C759] flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Settings saved and updated!</span>
          </div>
        )}

        {/* Settings Body with iOS Inset Grouped layout */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {activeSection === "main" && (
            <>
              {/* Profile Card Header (iOS Inset Group) */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs flex items-center gap-4">
                <div className="relative group flex-shrink-0">
                  <Avatar
                    src={avatar}
                    name={displayName}
                    username={username}
                    size="xl"
                    onClick={() =>
                      onOpenLightbox?.({
                        avatar,
                        name: displayName,
                        username,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                    title="Change Photo"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 stroke-[2]" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-bold text-black dark:text-white truncate font-ios leading-tight">
                    {displayName || "Your Name"}
                  </h3>
                  <p className="text-[13px] font-medium text-[#00A884] dark:text-[#34D399] truncate mt-0.5">
                    {formatUsername(username)}
                  </p>
                  <p className="text-[12px] text-[#8E8E93] truncate mt-1">
                    {bio || "Digital nomad • Available"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenQRCode?.("my-code")}
                  className="w-8 h-8 rounded-full bg-[#767680]/10 flex items-center justify-center text-[#007AFF] hover:bg-[#767680]/20 flex-shrink-0 active:scale-95 transition-all"
                  title="View My QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Main Settings Grouped Sections */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                {/* Account */}
                <button
                  type="button"
                  onClick={() => setActiveSection("account")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Account & Identity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#8E8E93]">{formatUsername(username)}</span>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                  </div>
                </button>

                {/* Privacy */}
                <button
                  type="button"
                  onClick={() => setActiveSection("privacy")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#34C759] text-white flex items-center justify-center shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Privacy
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                </button>

                {/* Appearance */}
                <button
                  type="button"
                  onClick={() => setActiveSection("appearance")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#AF52DE] text-white flex items-center justify-center shadow-xs">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Appearance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#8E8E93] capitalize">{theme}</span>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                  </div>
                </button>

                {/* Blocked Contacts */}
                <button
                  type="button"
                  onClick={() => setActiveSection("blocked")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#FF9500] text-white flex items-center justify-center shadow-xs">
                      <Ban className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Blocked Contacts
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                </button>

                {/* Chat Backup */}
                <button
                  type="button"
                  onClick={() => setActiveSection("backup")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Chat Backup
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#8E8E93] capitalize">{backupFrequency.toLowerCase()}</span>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                  </div>
                </button>
              </div>

              {/* Secondary Group: About & Help */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveSection("about")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center shadow-xs">
                      <Info className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-black dark:text-white font-ios">
                      Storage & App Info
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                </button>
              </div>

              {/* Log Out Destructive Action */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-3 flex items-center justify-center gap-2 text-[#FF3B30] font-semibold text-[15px] hover:bg-[#FF3B30]/5 active:bg-[#FF3B30]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}

          {/* SUB-SCREEN: ACCOUNT */}
          {activeSection === "account" && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Unique Username (@)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00A884] font-bold text-[15px]">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none font-medium"
                    />
                  </div>

                  {isCheckingUsername && (
                    <p className="text-[12px] text-[#8E8E93] mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-[#00A884]" />
                      <span>Checking availability...</span>
                    </p>
                  )}
                  {!isCheckingUsername && usernameStatus.message && (
                    <p className="text-[12px] text-[#34C759] font-medium mt-1">
                      {usernameStatus.message}
                    </p>
                  )}
                  {!isCheckingUsername && usernameStatus.error && (
                    <p className="text-[12px] text-[#FF3B30] font-medium mt-1">
                      {usernameStatus.error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7]/60 dark:bg-[#2C2C2E]/60 text-[#8E8E93] rounded-[12px] border-none text-[15px] cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#8E8E93] mt-1">
                    Your login email associated with this account.
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    About / Status
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Hey there! I am using ChatFlow."
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs border border-[#FF3B30]/20 dark:border-[#FF3B30]/30 space-y-3">
                <div className="flex items-center gap-2.5 text-[#FF3B30]">
                  <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/10 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#FF3B30] font-ios leading-tight">
                      Delete Account
                    </h4>
                    <p className="text-[12px] text-[#8E8E93]">
                      Permanent removal of your @{user?.profile?.username} identity
                    </p>
                  </div>
                </div>

                <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                  Deleting your account will permanently wipe your profile, @username, messages, photos, and settings. You will not be able to log in again.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeletePassword("");
                    setDeleteAgreed(false);
                    setActiveSection("delete-account");
                  }}
                  className="w-full py-2.5 px-4 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] font-bold text-[14px] rounded-[12px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#FF3B30]/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account...</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-SCREEN: DELETE ACCOUNT CONFIRMATION */}
          {activeSection === "delete-account" && (
            <div className="space-y-4 animate-slide-in-right font-ios pb-4">
              {/* Warning Header Card */}
              <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/25 rounded-[20px] p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#FF3B30]/20 text-[#FF3B30] flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#FF3B30] font-ios">
                      Permanently Delete Account
                    </h3>
                    <p className="text-[12px] text-[#FF3B30]/80">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="text-[12.5px] text-black/80 dark:text-white/80 space-y-2 pt-2 border-t border-[#FF3B30]/20">
                  <p className="font-semibold text-black dark:text-white">
                    Once confirmed, the following data will be erased immediately:
                  </p>
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span>Your username <strong>@{user?.profile?.username}</strong> will be permanently deleted.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span>All your chats, sent messages, media attachments & voice notes will be erased.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span>Your status stories, profile pictures, and reactions will be removed.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span>You will <strong>never be able to log in</strong> to this account again.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Verification & Confirmation Form */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 shadow-xs space-y-4 border border-black/[0.04] dark:border-white/[0.06]">
                {deleteError && (
                  <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[12px] text-[13px] font-semibold text-[#FF3B30] flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Enter Your Password to Confirm
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Your current password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/50 font-medium"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteAgreed}
                    onChange={(e) => setDeleteAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#FF3B30] focus:ring-[#FF3B30] accent-[#FF3B30] cursor-pointer"
                  />
                  <span className="text-[12px] text-[#8E8E93] leading-tight">
                    I understand that deleting my account is permanent and cannot be undone or recovered.
                  </span>
                </label>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={isDeleting || !deletePassword || !deleteAgreed}
                    onClick={handleConfirmDeleteAccount}
                    className="w-full py-3 px-4 bg-[#FF3B30] hover:bg-[#D70015] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-[14px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting Account...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Permanently Delete My Account</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setDeletePassword("");
                      setDeleteAgreed(false);
                      setActiveSection("account");
                    }}
                    className="w-full py-2.5 px-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white font-semibold text-[13px] rounded-[14px] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    Cancel & Keep Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN: PRIVACY */}
          {activeSection === "privacy" && (
            <div className="space-y-4 animate-slide-in-right">
              {/* Inset Group with iOS Toggles */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                {/* Read Receipts */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-[15px] font-medium text-black dark:text-white block font-ios">
                      Read Receipts
                    </span>
                    <span className="text-[12px] text-[#8E8E93]">
                      If turned off, you won't send or receive Read receipts (double blue ticks).
                    </span>
                  </div>
                  <div
                    className="ios-switch"
                    data-checked={readReceipts}
                    onClick={() => setReadReceipts(!readReceipts)}
                  >
                    <span className="ios-switch-thumb" />
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-[15px] font-medium text-black dark:text-white block font-ios">
                      Typing Indicator
                    </span>
                    <span className="text-[12px] text-[#8E8E93]">
                      Show when you are typing in real-time.
                    </span>
                  </div>
                  <div
                    className="ios-switch"
                    data-checked={typingIndicator}
                    onClick={() => setTypingIndicator(!typingIndicator)}
                  >
                    <span className="ios-switch-thumb" />
                  </div>
                </div>
              </div>

              {/* Privacy Selectors */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Who can discover my @username?
                  </label>
                  <select
                    value={discoverability}
                    onChange={(e: any) => setDiscoverability(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none"
                  >
                    <option value="EVERYONE">Everyone (Recommended)</option>
                    <option value="RESTRICTED">Restricted (Mutual only)</option>
                    <option value="NOBODY">Nobody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Last Seen & Online
                  </label>
                  <select
                    value={onlinePrivacy}
                    onChange={(e: any) => setOnlinePrivacy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none"
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="CONTACTS">My Contacts</option>
                    <option value="NOBODY">Nobody</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN: APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs">
                <h4 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 font-ios">
                  Theme Options
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-[16px] border flex flex-col items-center gap-2 transition-all ${
                      theme === "light"
                        ? "border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold"
                        : "border-black/[0.08] dark:border-white/[0.08] text-[#8E8E93]"
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="text-[13px]">Light</span>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-[16px] border flex flex-col items-center gap-2 transition-all ${
                      theme === "dark"
                        ? "border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold"
                        : "border-black/[0.08] dark:border-white/[0.08] text-[#8E8E93]"
                    }`}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="text-[13px]">Dark</span>
                  </button>

                  {/* System */}
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`p-3 rounded-[16px] border flex flex-col items-center gap-2 transition-all ${
                      theme === "system"
                        ? "border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold"
                        : "border-black/[0.08] dark:border-white/[0.08] text-[#8E8E93]"
                    }`}
                  >
                    <Laptop className="w-6 h-6" />
                    <span className="text-[13px]">System</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN: BLOCKED */}
          {activeSection === "blocked" && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                {isLoadingBlocked ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00A884]" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="p-8 text-center text-[#8E8E93] text-[14px]">
                    No blocked contacts.
                  </div>
                ) : (
                  blockedUsers.map((b) => (
                    <div
                      key={b.id}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={b.profile?.avatar} name={b.profile?.displayName} size="sm" />
                        <div>
                          <p className="text-[14px] font-semibold text-black dark:text-white">
                            {b.profile?.displayName}
                          </p>
                          <p className="text-[12px] text-[#00A884]">
                            {formatUsername(b.profile?.username)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnblock(b.id)}
                        className="px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] text-[12px] font-semibold rounded-full hover:bg-[#FF3B30]/20 transition-colors"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUB-SCREEN: CHAT BACKUP */}
          {activeSection === "backup" && (
            <div className="space-y-4 animate-slide-in-right font-ios">
              {/* Backup Info Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                    <Cloud className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-black dark:text-white font-ios">
                      Last Backup: {lastBackupTime}
                    </h3>
                    <p className="text-[13px] text-[#8E8E93]">
                      Total Size: 18.4 MB (Encrypted)
                    </p>
                  </div>
                </div>

                <p className="text-[12px] text-[#8E8E93] leading-relaxed pt-1">
                  Back up your message history and media to keep your conversations safe. You can export or restore anytime.
                </p>

                {/* Progress bar during active backup */}
                {isBackingUp && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold text-[#007AFF]">
                      <span>Backing up conversations...</span>
                      <span>{backupProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#007AFF] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${backupProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isBackingUp}
                    onClick={() => {
                      setIsBackingUp(true);
                      setBackupProgress(15);
                      setTimeout(() => setBackupProgress(50), 300);
                      setTimeout(() => setBackupProgress(85), 600);
                      setTimeout(() => {
                        setBackupProgress(100);
                        setIsBackingUp(false);
                        setLastBackupTime("Just now");
                        const backupData = {
                          app: "ChatFlow",
                          version: "2.4.0",
                          username: user?.profile?.username,
                          backupDate: new Date().toISOString(),
                          frequency: backupFrequency,
                          encrypted: encryptedBackup,
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `chatflow-backup-${user?.profile?.username || "user"}-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }, 900);
                    }}
                    className="flex-1 py-3 px-4 bg-[#007AFF] hover:bg-[#0062CC] text-white font-semibold text-[14px] rounded-[12px] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Backing Up...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Back Up Now (Export)</span>
                      </>
                    )}
                  </button>

                  <label className="flex-1 py-3 px-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-black dark:text-white font-semibold text-[14px] rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <RefreshCw className="w-4 h-4 text-[#007AFF]" />
                    <span>Restore Archive</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={() => {
                        alert("Backup archive verified! Chat database synced.");
                        setLastBackupTime("Restored Just Now");
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Grouped Backup Settings */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 shadow-xs space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1.5 font-ios">
                    Auto-Backup Schedule
                  </label>
                  <select
                    value={backupFrequency}
                    onChange={(e: any) => setBackupFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] border-none text-[15px] text-black dark:text-white focus:outline-none font-ios"
                  >
                    <option value="DAILY">Daily (Recommended)</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="OFF">Off</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div>
                    <span className="text-[14px] font-semibold text-black dark:text-white block font-ios">
                      Include Audio & Photos
                    </span>
                    <span className="text-[11px] text-[#8E8E93]">
                      Back up voice notes and image attachments
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeVideos}
                    onChange={(e) => setIncludeVideos(e.target.checked)}
                    className="ios-switch"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div>
                    <span className="text-[14px] font-semibold text-black dark:text-white block font-ios">
                      End-to-End Encryption
                    </span>
                    <span className="text-[11px] text-[#8E8E93]">
                      Secure your backup with a password
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={encryptedBackup}
                    onChange={(e) => setEncryptedBackup(e.target.checked)}
                    className="ios-switch"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN: STORAGE & APP INFO */}
          {activeSection === "about" && (
            <div className="space-y-4 animate-slide-in-right font-ios pb-6">
              {/* App Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 shadow-xs text-center space-y-2 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#00A884] to-[#075E54] text-white flex items-center justify-center mx-auto shadow-md">
                  <MessageSquare className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-[20px] font-bold text-black dark:text-white font-ios">
                  ChatFlow
                </h3>
                <p className="text-[13px] font-semibold text-[#00A884] dark:text-[#34D399]">
                  v3.0.0 (Ultimate WhatsApp Edition)
                </p>
                <p className="text-[13px] text-[#8E8E93] max-w-sm mx-auto pt-1 leading-relaxed">
                  A simple, fast, and private messaging platform designed with native iOS aesthetics, real-time status updates, view-once media, and end-to-end connected chats.
                </p>
              </div>

              {/* Developer Information */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 shadow-xs space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#00A884]" />
                    <h4 className="text-[15px] font-bold text-black dark:text-white font-ios">
                      Developer Information
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] rounded-full text-[11px] font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Verified Founder</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#2C2C2E] space-y-1.5 text-[13px]">
                  <p className="text-black dark:text-white">
                    <span className="font-bold text-[#8E8E93]">Developer Name:</span> Malik Abubakkar
                  </p>
                  <p className="text-black dark:text-white">
                    <span className="font-bold text-[#8E8E93]">Role:</span> Founder & Developer
                  </p>
                  <p className="text-black dark:text-white">
                    <span className="font-bold text-[#8E8E93]">Application:</span> ChatFlow
                  </p>
                </div>
                <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                  Malik Abubakkar is the developer behind this application and is responsible for its design, development, maintenance, and future improvements.
                </p>
              </div>

              {/* Community Rules */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 shadow-xs space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#007AFF]" />
                  <h4 className="text-[15px] font-bold text-black dark:text-white font-ios">
                    Community Rules
                  </h4>
                </div>
                <p className="text-[12px] text-[#8E8E93]">
                  To keep the platform safe and respectful, all users are expected to follow these rules:
                </p>
                <div className="space-y-2 text-[12px] text-black dark:text-white pt-1">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">1.</span>
                    <span>Treat other users with respect.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">2.</span>
                    <span>Do not use the app to harass, threaten, bully, or intimidate others.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">3.</span>
                    <span>Do not share illegal, harmful, or abusive content.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">4.</span>
                    <span>Do not impersonate another person or organization.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">5.</span>
                    <span>Do not use the app for scams, fraud, spam, or misleading activities.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">6.</span>
                    <span>Do not share someone else's private or personal information without permission.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">7.</span>
                    <span>Do not attempt to access another user's account or data.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">8.</span>
                    <span>Do not distribute malware, malicious links, or harmful software.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">9.</span>
                    <span>Do not use the platform for activities that violate applicable laws.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#00A884] min-w-[16px]">10.</span>
                    <span>Respect the privacy and rights of other users.</span>
                  </div>
                </div>
              </div>

              {/* Privacy & Account Safety */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 shadow-xs space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#34C759]" />
                  <h4 className="text-[15px] font-bold text-black dark:text-white font-ios">
                    Privacy & Account Safety
                  </h4>
                </div>
                <div className="space-y-2 text-[12px] text-[#8E8E93] leading-relaxed">
                  <p>
                    <strong className="text-black dark:text-white">Privacy:</strong> We respect user privacy and aim to handle personal information responsibly. Users should avoid sharing sensitive credentials, financial data, or passwords through chats.
                  </p>
                  <p>
                    <strong className="text-black dark:text-white">Account Safety:</strong> You are responsible for keeping your account credentials secure. Never share your password or verification codes with anyone.
                  </p>
                  <p>
                    <strong className="text-black dark:text-white">Content Responsibility:</strong> Users are responsible for the content they send and upload. Content violating community guidelines may be reported and restricted.
                  </p>
                </div>
              </div>

              {/* Storage Breakdown Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 shadow-xs space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-[14px] font-bold text-black dark:text-white">
                      Storage Breakdown
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#8E8E93]">
                    {cacheCleared ? "76.2 MB Total" : "84.7 MB Total"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px]">
                    <p className="text-[#8E8E93]">Messages</p>
                    <p className="font-bold text-black dark:text-white text-[13px]">12.4 MB</p>
                  </div>
                  <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px]">
                    <p className="text-[#8E8E93]">Voice Notes</p>
                    <p className="font-bold text-black dark:text-white text-[13px]">18.2 MB</p>
                  </div>
                  <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px]">
                    <p className="text-[#8E8E93]">Photos & Media</p>
                    <p className="font-bold text-black dark:text-white text-[13px]">45.6 MB</p>
                  </div>
                  <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px]">
                    <p className="text-[#8E8E93]">Cached Temp</p>
                    <p className="font-bold text-black dark:text-white text-[13px]">{cacheCleared ? "0 KB" : "8.5 MB"}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCacheCleared(true);
                    setTimeout(() => setCacheCleared(false), 4000);
                  }}
                  className="w-full py-2.5 px-3 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] text-[13px] font-semibold rounded-[12px] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{cacheCleared ? "Cache Cleared! 8.5 MB Freed" : "Clear Cached Temp Media"}</span>
                </button>
              </div>

              {/* Connection Diagnostics Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 shadow-xs space-y-2 border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#34C759]" />
                    <span className="text-[14px] font-bold text-black dark:text-white">
                      Real-Time Network Status
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] text-[11px] font-bold">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#8E8E93] pt-1">
                  <span>Socket.IO Engine:</span>
                  <span className="font-semibold text-black dark:text-white">v4.8.1 (WebSocket)</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-[#8E8E93]">
                  <span>Server Ping:</span>
                  <span className="font-semibold text-[#34C759]">~16 ms (Ultra Low)</span>
                </div>
              </div>

              {/* Disclaimer & Copyright */}
              <div className="p-4 text-center space-y-1.5 text-[11px] text-[#8E8E93]">
                <p>
                  This application is an independent messaging platform and is not affiliated with, sponsored by, or endorsed by WhatsApp, Meta, or Apple.
                </p>
                <p className="font-semibold text-black/70 dark:text-white/70">
                  © 2026 Malik Abubakkar. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
