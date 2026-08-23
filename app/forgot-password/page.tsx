"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

import { AppLogo } from "@/components/ui/AppLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-chat-bg-light dark:bg-chat-bg-dark flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <AppLogo size="lg" showText={false} className="shadow-lg hover:scale-105 transition-transform" />
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Check your inbox
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              We have sent password reset instructions to <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@chatflow.app"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
