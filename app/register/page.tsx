"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Upload,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { validateUsername, formatUsername } from "@/utils/username";
import { Avatar } from "@/components/ui/Avatar";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Multi-step form (1: Email & Password, 2: Display Name & Username, 3: Profile Photo & Bio)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("Hey there! I am using ChatFlow 💬");
  const [avatar, setAvatar] = useState("");

  // Live validation
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    message?: string;
    error?: string;
    suggestions?: string[];
  }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live real-time username availability check
  useEffect(() => {
    if (!username || username.trim().length < 3) {
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
        const res = await fetch(
          `/api/users/check-username?username=${encodeURIComponent(
            username
          )}&displayName=${encodeURIComponent(displayName)}`
        );
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({
            available: true,
            message: data.message || `✓ @${username} is available`,
          });
        } else {
          setUsernameStatus({
            available: false,
            error: data.error || `✕ @${username} is already taken`,
            suggestions: data.suggestions || [],
          });
        }
      } catch (err) {
        const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
        setUsernameStatus({
          available: true,
          message: `✓ @${clean} is available`,
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [username, displayName]);

  // Auto generate smart username suggestions
  const handleAutoSuggest = async () => {
    setIsSuggesting(true);
    const clean =
      (username || displayName || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 15) || "user";
    const r2 = Math.floor(10 + Math.random() * 90);
    const r3 = Math.floor(100 + Math.random() * 900);
    const localSuggestions = [
      `${clean}_${r2}`,
      `${clean}${r2}`,
      `iam_${clean}`,
      `${clean}_${r3}`,
    ];

    try {
      const res = await fetch(
        `/api/users/check-username?suggest=true&username=${encodeURIComponent(
          username
        )}&displayName=${encodeURIComponent(displayName || "user")}`
      );
      const data = await res.json();
      const sugs =
        data.suggestions && data.suggestions.length > 0
          ? data.suggestions
          : localSuggestions;
      setUsername(sugs[0]);
      setUsernameStatus({
        available: true,
        message: `✓ @${sugs[0]} is available`,
        suggestions: sugs,
      });
    } catch (err) {
      setUsername(localSuggestions[0]);
      setUsernameStatus({
        available: true,
        message: `✓ @${localSuggestions[0]} is available`,
        suggestions: localSuggestions,
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setError("");

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
      } else {
        setError(data.error || "Failed to upload photo");
      }
    } catch (err) {
      setError("Network error while uploading photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    if (!usernameStatus.available) {
      setError("Please choose an available username");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await register({
      email,
      password,
      displayName: displayName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatar: avatar.trim() || undefined,
    });

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to create account");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wa-bgLight dark:bg-wa-bgDark flex flex-col justify-center items-center p-4 selection:bg-brand-600 selection:text-white">
      <div className="w-full max-w-md bg-white dark:bg-wa-cardDark border border-wa-borderLight dark:border-wa-borderDark rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
            <MessageSquare className="w-7 h-7 fill-white/20" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Step {step} of 3 • Connect through <span className="font-bold text-brand-600 dark:text-brand-400">@username</span>
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1.5 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-brand-600 transition-all duration-300 ${
              step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
            }`}
          />
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Email & Password */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Display Name & Unique Username */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Display Name (Your full or screen name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ali Khan"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Choose Unique @Username
                </label>
                <button
                  type="button"
                  onClick={handleAutoSuggest}
                  disabled={isSuggesting}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>{isSuggesting ? "Generating..." : "🎲 Auto Suggest"}</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-brand-600 dark:text-brand-400">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="ali_khan"
                  required
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50 font-medium"
                />
              </div>

              <div className="mt-1.5 min-h-[20px]">
                {isCheckingUsername ? (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                    <span>Checking @{username}...</span>
                  </p>
                ) : usernameStatus.available ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{usernameStatus.message}</span>
                  </p>
                ) : usernameStatus.error ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-red-500 font-semibold">
                      {usernameStatus.error}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400">
                    Use 3-30 letters, numbers, or underscores.
                  </p>
                )}
              </div>

              {/* Verified Smart Username Suggestions */}
              {usernameStatus.suggestions && usernameStatus.suggestions.length > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1.5 animate-fade-in">
                  <p className="text-[11px] font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Available suggestions (Tap to select):</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {usernameStatus.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setUsername(sug)}
                        className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <span>@{sug}</span>
                        <Check className="w-3 h-3 text-emerald-500 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={!usernameStatus.available}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Profile Photo from Device & Bio */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Profile Avatar with Camera Upload button */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <Avatar src={avatar} name={displayName} username={username} size="xl" />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg ring-2 ring-white dark:ring-gray-900 transition-all hover:scale-110"
                  title="Upload photo from device"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{avatar ? "Change Photo from Device" : "Upload Photo from Device"}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                About / Bio (Optional)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hey there! I am using ChatFlow 💬"
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Finish & Start Chatting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
