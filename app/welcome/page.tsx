"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import {
  MessageSquare,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  AtSign,
  Users,
  Mic,
  Smile,
  Phone,
  Video,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);
  return (
    <div className="min-h-screen bg-wa-bgLight dark:bg-wa-bgDark text-gray-900 dark:text-white flex flex-col justify-between selection:bg-brand-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-wa-borderLight dark:border-wa-borderDark bg-white/80 dark:bg-wa-cardDark/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <MessageSquare className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              ChatFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xs font-bold animate-fade-in">
          <AtSign className="w-4 h-4" />
          <span>Username-First Messaging Platform • Zero Phone Numbers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-[1.1]">
          Connect freely via <span className="text-brand-600 dark:text-brand-400">@username</span>. Chat in real time.
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl">
          ChatFlow lets you search and chat with anyone directly by their unique username. Fast, private, voice notes, video calls, and group channels.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 hover:scale-105"
          >
            <span>Claim Your @Username</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-wa-cardDark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left w-full">
          <div className="p-5 rounded-3xl bg-white dark:bg-wa-cardDark border border-wa-borderLight dark:border-wa-borderDark shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <AtSign className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              No Phone Numbers
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your phone number is completely private. Find friends and collaborate using unique @usernames.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-wa-cardDark border border-wa-borderLight dark:border-wa-borderDark shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              Real-Time Sockets & Calls
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Instant messaging, typing indicators, delivery checkmarks, voice calls, video calls, and call history logs.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-wa-cardDark border border-wa-borderLight dark:border-wa-borderDark shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              Voice Notes & Media
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Record voice notes directly in the browser with live sound waves, upload photos, videos, and documents from your device.
            </p>
          </div>
        </div>
      </main>

      {/* Footer with malikabubakkar copyright */}
      <footer className="border-t border-wa-borderLight dark:border-wa-borderDark bg-white dark:bg-wa-cardDark py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-600 dark:text-brand-400">ChatFlow</span>
            <span>• Connect through @usernames</span>
          </div>

          <p className="text-center font-medium">
            © 2026 ChatFlow — Developed by <span className="font-bold text-brand-600 dark:text-brand-400">malikabubakkar</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
