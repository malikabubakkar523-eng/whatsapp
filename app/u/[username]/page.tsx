"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { AppLogo } from "@/components/ui/AppLogo";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquare, ArrowRight, Loader2, Sparkles, User, ShieldCheck } from "lucide-react";
import { formatUsername } from "@/utils/username";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserDirectChatPage({ params }: UserPageProps) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username || "";
  const cleanUsername = rawUsername.replace(/^@/, "").trim();

  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<{
    displayName: string;
    username: string;
    avatar?: string | null;
    bio?: string | null;
    isOnline?: boolean;
  } | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // Fetch public user profile info
  useEffect(() => {
    if (!cleanUsername) return;
    fetch(`/api/users/${cleanUsername}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setProfile(data.user);
        } else {
          setProfile({
            displayName: cleanUsername,
            username: cleanUsername,
          });
        }
      })
      .catch(() => {
        setProfile({
          displayName: cleanUsername,
          username: cleanUsername,
        });
      })
      .finally(() => setIsFetchingProfile(false));
  }, [cleanUsername]);

  // If already logged in, automatically redirect to main app with chat opened
  useEffect(() => {
    if (!isLoading && user && cleanUsername) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("chatflow_pending_chat_user", cleanUsername);
      }
      router.replace(`/?user=${encodeURIComponent(cleanUsername)}`);
    }
  }, [user, isLoading, cleanUsername, router]);

  const handleStartChat = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chatflow_pending_chat_user", cleanUsername);
    }
    if (user) {
      router.push(`/?user=${encodeURIComponent(cleanUsername)}`);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(`/?user=${cleanUsername}`)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0B141A] flex flex-col justify-between items-center p-4 selection:bg-[#00A884] selection:text-white font-ios">
      {/* Top App Header */}
      <header className="w-full max-w-lg py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size="sm" showText={true} />
        </Link>

        <Link
          href="/login"
          className="text-sm font-bold text-[#00A884] dark:text-[#34D399] hover:underline"
        >
          Sign In
        </Link>
      </header>

      {/* Profile Card Container (WhatsApp Contact Link Style) */}
      <main className="w-full max-w-md bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-scale-in">
        {isFetchingProfile ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A884]" />
            <p className="text-xs text-gray-500 font-medium">Opening Chat with @{cleanUsername}...</p>
          </div>
        ) : (
          <>
            {/* User Avatar & Online Status */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar
                  src={profile?.avatar}
                  name={profile?.displayName || cleanUsername}
                  username={cleanUsername}
                  size="xl"
                  className="shadow-xl ring-4 ring-[#00A884]/20"
                />
                {profile?.isOnline && (
                  <span className="w-4 h-4 rounded-full bg-[#34C759] ring-2 ring-white dark:ring-[#1C1C1E] absolute bottom-1 right-1 shadow-md" />
                )}
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {profile?.displayName || cleanUsername}
                </h1>
                <p className="text-sm font-semibold text-[#00A884] dark:text-[#34D399] mt-0.5">
                  {formatUsername(cleanUsername)}
                </p>
              </div>

              {profile?.bio && (
                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs bg-gray-50 dark:bg-[#2C2C2E] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleStartChat}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#008069] to-[#00A884] hover:from-[#00705b] hover:to-[#009272] text-white text-base font-bold shadow-lg shadow-[#00A884]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-white/20" />
                <span>Message {formatUsername(cleanUsername)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A884]" />
                <span>End-to-end encrypted messaging via ChatFlow</span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg py-4 text-center text-xs text-gray-400">
        ChatFlow • Real-time instant messaging platform
      </footer>
    </div>
  );
}
