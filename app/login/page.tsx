"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { AppLogo } from "@/components/ui/AppLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("deleted") === "true") {
        setDeletedSuccess(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/");
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please provide both email/username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login({ identifier, password });
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Invalid login credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wa-bgLight dark:bg-wa-bgDark flex flex-col justify-center items-center p-4 selection:bg-brand-600 selection:text-white">
      <div className="w-full max-w-md bg-white dark:bg-wa-cardDark border border-wa-borderLight dark:border-wa-borderDark rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Chat Illustration */}
          <img
            src="https://img.icons8.com/3d-fluency/94/secured-letter.png"
            alt="Secure login"
            className="w-20 h-20 drop-shadow-lg mb-1"
            loading="lazy"
          />
          <AppLogo size="lg" showText={false} className="shadow-lg hover:scale-105 transition-transform" />
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Welcome to ChatFlow
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time messaging via unique <span className="font-bold text-brand-600 dark:text-brand-400">@usernames</span>
          </p>
        </div>

        {deletedSuccess && (
          <div className="p-3.5 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-xs font-semibold text-green-700 dark:text-green-300 rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
            <span>Your account and @username have been permanently deleted. You can no longer log in with those credentials.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 text-xs font-semibold text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Email or @Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com or @username"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Developer Copyright */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-400">
            © 2026 ChatFlow — Developed by <span className="font-bold text-brand-600 dark:text-brand-400">malikabubakkar</span>
          </p>
        </div>
      </div>
    </div>
  );
}
