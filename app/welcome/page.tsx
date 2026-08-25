"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AppLogo } from "@/components/ui/AppLogo";
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
  Check,
  CheckCheck,
  Sparkles,
  Bot,
  CircleDot,
  Eye,
  Heart,
  Moon,
  Sun,
  ShieldCheck,
  Smartphone,
  Layers,
  ChevronRight,
  Menu,
  X,
  FileText,
  HelpCircle,
  Send,
  BookOpen,
  Scale,
  AlertTriangle,
  UserCheck,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "call">("chat");
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [helpForm, setHelpForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F2F5] dark:bg-[#0C1317] text-gray-900 dark:text-[#E9EDEF] flex flex-col selection:bg-[#00A884] selection:text-white transition-colors duration-200">
      {/* ============================================================ */}
      {/* 1. FIXED MODERN HEADER                                        */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[#111B21]/90 backdrop-blur-xl transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showText={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-600 dark:text-[#8696A0]">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("messaging")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Messaging
            </button>
            <button
              onClick={() => scrollToSection("calls")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Voice & Video
            </button>
            <button
              onClick={() => scrollToSection("stories")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Stories
            </button>
            <button
              onClick={() => scrollToSection("ai")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Meta AI
            </button>
            <button
              onClick={() => scrollToSection("privacy")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => scrollToSection("rules")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Rules
            </button>
            <button
              onClick={() => scrollToSection("help")}
              className="hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors cursor-pointer"
            >
              Help
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-gray-600 dark:text-[#8696A0] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#D1D7DB] hover:text-[#00A884] dark:hover:text-[#34D399] transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-full shadow-sm shadow-[#00A884]/30 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-[#8696A0] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md px-4 py-4 space-y-3 animate-fade-in">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("messaging")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              Real-Time Messaging
            </button>
            <button
              onClick={() => scrollToSection("calls")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              Voice & Video Calls
            </button>
            <button
              onClick={() => scrollToSection("stories")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              24-Hour Stories
            </button>
            <button
              onClick={() => scrollToSection("ai")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              Meta AI Assistant
            </button>
            <button
              onClick={() => scrollToSection("privacy")}
              className="block w-full text-left py-1.5 text-sm font-medium text-gray-700 dark:text-[#D1D7DB]"
            >
              Privacy & Security
            </button>
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex gap-2">
              <Link
                href="/login"
                className="flex-1 py-2 text-center text-xs font-bold rounded-lg border border-black/[0.1] dark:border-white/[0.1]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-[#00A884] text-white"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* ============================================================ */}
      {/* 1.5  FULLSCREEN VIDEO HERO WITH FAIL-SAFE FALLBACK             */}
      {/* ============================================================ */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] overflow-hidden bg-[#0a0f12]">
        {!videoFailed ? (
          <video
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          /* High-End Futuristic Dynamic Animated Backdrop Fallback */
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1317] via-[#111b21] to-[#0a1014] overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#25D366]/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]" />
            <div className="absolute inset-0 bg-[radial-gradient(#25D366_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Mute/Unmute Toggle */}
        {!videoFailed && (
          <button
            onClick={() => setVideoMuted(!videoMuted)}
            className="absolute bottom-6 right-6 z-10 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all active:scale-90"
            title={videoMuted ? "Unmute" : "Mute"}
          >
            {videoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Overlay Content */}
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold mb-5 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-[#25D366]" />
            <span>EXPERIENCE CHATFLOW IN ACTION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] max-w-3xl drop-shadow-2xl">
            Messaging,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-[#00D2FF]">
              Reimagined
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-4 max-w-lg">
            Real-time chat, HD video calls, 24h stories, AI assistant, and live Profile Visitors tracking.
          </p>
          <div className="flex gap-3 mt-7">
            <Link
              href="/register"
              className="px-7 py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-sm rounded-full shadow-xl shadow-[#25D366]/40 active:scale-95 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollToSection("features")}
              className="px-7 py-3 bg-white/10 backdrop-blur-md border border-white/25 text-white font-bold text-sm rounded-full hover:bg-white/20 transition-all"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. HERO SECTION                                               */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A884]/10 border border-[#00A884]/20 text-[#00A884] dark:text-[#34D399] text-[13px] font-semibold animate-fade-in shadow-xs">
            <AtSign className="w-4 h-4" />
            <span>Username-First Messaging Platform • Zero Phone Numbers</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.08]">
            Connect freely via{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A884] to-[#00D2FF]">
              @username
            </span>
            .<br className="hidden sm:inline" /> Chat with 0ms speed.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-[#8696A0] max-w-2xl leading-relaxed">
            ChatFlow lets you search and chat with anyone directly by their unique username. Fast, private, voice notes,
            video calls, 24-hour stories, and intelligent Meta AI assistance.
          </p>

          {/* Chat Illustration Image */}
          <div className="w-full max-w-md mx-auto pt-2">
            <img
              src="https://img.icons8.com/3d-fluency/512/chat.png"
              alt="Chat illustration"
              className="w-full h-auto drop-shadow-xl animate-bounce-slow"
              loading="lazy"
            />
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-[#00A884]/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-xl"
            >
              <span>Claim Your @Username</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-[#111B21] border border-black/[0.08] dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#202C33] text-gray-800 dark:text-white font-bold text-sm sm:text-base rounded-full shadow-xs transition-all flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>

          {/* ============================================================ */}
          {/* INTERACTIVE LIVE MOCK CHAT PREVIEW                           */}
          {/* ============================================================ */}
          <div className="w-full max-w-2xl mt-8 pt-4">
            <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#111B21] shadow-2xl overflow-hidden text-left">
              {/* Mock Chat Header */}
              <div className="px-4 py-3 bg-[#F0F2F5] dark:bg-[#202C33] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A884] to-[#00D2FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    AK
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      Ali Khan <span className="text-xs font-normal text-gray-500 dark:text-[#8696A0]">(@ali_khan)</span>
                    </h2>
                    <p className="text-[11px] text-[#00A884] dark:text-[#34D399] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
                      <span>online</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#00A884]">
                  <span className="p-1.5 rounded-full bg-[#00A884]/10 text-xs font-semibold">HD WebRTC</span>
                </div>
              </div>

              {/* Mock Chat Body */}
              <div className="p-4 space-y-3 bg-[#EFEAE2] dark:bg-[#0B141A] min-h-[220px]">
                {/* Incoming Message */}
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="bg-white dark:bg-[#202C33] rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[13px] text-gray-800 dark:text-[#E9EDEF]">
                      Hey! Did you know ChatFlow requires zero phone numbers? Just share your @username! 🚀
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-[#8696A0] float-right mt-1 ml-3">
                      10:42 AM
                    </span>
                  </div>
                </div>

                {/* Outgoing Message with Blue Ticks */}
                <div className="flex flex-col items-end max-w-[80%] ml-auto">
                  <div className="bg-[#D9FDD3] dark:bg-[#005C4B] rounded-2xl rounded-tr-xs px-3.5 py-2 shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[13px] text-gray-800 dark:text-[#E9EDEF]">
                      Yes! And messages deliver in 0ms with double blue ticks! 💬⚡
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500 dark:text-[#8696A0]">10:43 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                    </div>
                  </div>
                </div>

                {/* Voice Note Mock Bubble */}
                <div className="flex flex-col items-end max-w-[85%] ml-auto">
                  <div className="bg-[#D9FDD3] dark:bg-[#005C4B] rounded-2xl rounded-tr-xs p-2.5 shadow-xs flex items-center gap-3 border border-black/[0.04] dark:border-white/[0.04]">
                    <div className="w-8 h-8 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-0.5 h-4">
                        {[40, 70, 90, 60, 30, 80, 100, 50, 65, 85, 45, 95, 30, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-[#00A884] rounded-full"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-[#8696A0] mt-1">
                        <span>0:14</span>
                        <div className="flex items-center gap-1">
                          <span>10:44 AM</span>
                          <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CORE FEATURES GRID                                        */}
      {/* ============================================================ */}
      <section id="features" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">Everything You Need</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Engineered for Privacy & Lightning Speed
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#8696A0] max-w-lg mx-auto">
            Every feature is crafted to give you the familiar WhatsApp experience without sharing your private phone number.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00A884]/10 text-[#00A884] flex items-center justify-center font-bold">
              <AtSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">No Phone Numbers</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Maintain 100% privacy. Search friends, colleagues, and communities directly by unique @username handles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">0ms Socket.IO Speed</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Optimistic rendering with IndexedDB client caching. Messages appear instantly and sync in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">HD WebRTC Calls</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              1-on-1 High-Definition voice & video calling with real-time ringers, call timers, and automated chat logs.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <CircleDot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">24-Hour Stories</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Post text status with gradient fonts or photo/video stories that automatically expire after 24 hours.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Meta AI Assistant</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Ask questions, generate ideas, and get instant assistance anytime with our built-in intelligent AI bot.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">View-Once & Privacy</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Send self-destructing view-once media, toggle read receipts, control online visibility, and block spammers.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. REAL-TIME MESSAGING SECTION                               */}
      {/* ============================================================ */}
      <section id="messaging" className="py-16 bg-white dark:bg-[#111B21] border-y border-black/[0.06] dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">Instant Real-Time Chat</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Single Tick. Double Grey. Double Blue.
            </h2>
            <p className="text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Full WhatsApp-style message delivery receipts synced across devices in real-time. Know exactly when your
              message is sent, delivered to the device, and opened by the recipient.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800 dark:text-[#E9EDEF]">Single Grey Tick: Message Sent</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCheck className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800 dark:text-[#E9EDEF]">Double Grey Tick: Delivered to Device</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCheck className="w-4 h-4 text-[#53BDEB]" />
                <span className="font-medium text-gray-800 dark:text-[#E9EDEF]">Double Blue Tick: Read & Opened</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#F0F2F5] dark:bg-[#0C1317] p-6 border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-3">
            {/* Messaging Illustration */}
            <div className="flex justify-center pb-2">
              <img
                src="https://img.icons8.com/3d-fluency/256/speech-bubble-with-dots.png"
                alt="Real-time messaging"
                className="w-24 h-24 drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00A884]">Real-Time Typing Indicator</span>
                <span className="text-[10px] text-gray-400">Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 dark:text-[#D1D7DB]">@usman is typing</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-500">Emoji Reactions</span>
                <span className="text-[10px] text-gray-400">Instant</span>
              </div>
              <div className="flex items-center gap-2">
                {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((e) => (
                  <span key={e} className="p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-sm">
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Visitors Feature Card */}
            <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl shadow-xs border border-[#25D366]/20 bg-[#25D366]/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00A884] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Real-Time Profile Visitors
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A884]/15 text-[#00A884] font-bold">New</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#00A884]/20 border border-[#00A884] flex items-center justify-center text-xs font-bold text-[#00A884]">
                    EW
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Emma Watson</p>
                    <p className="text-[11px] text-[#00A884]">Viewed your profile • 2m ago</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-gray-700 dark:text-gray-300">
                  Logged
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CALLS & STORIES SECTION                                   */}
      {/* ============================================================ */}
      <section id="calls" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#111B21] to-[#0C1317] text-white p-6 sm:p-8 shadow-xl border border-white/[0.08] space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#00A884] flex items-center justify-center font-bold text-lg">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Incoming Video Call...</h3>
                  <p className="text-xs text-[#34D399]">HD WebRTC Encrypted</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <div className="w-24 h-24 rounded-full bg-[#00A884]/20 border-2 border-[#00A884] flex items-center justify-center text-3xl font-bold animate-pulse">
                AK
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="p-4 rounded-full bg-[#FF3B30] text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </div>
              <div className="p-4 rounded-full bg-[#00A884] text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div id="stories" className="space-y-5">
            {/* Stories Illustration */}
            <div className="flex items-center gap-3">
              <img
                src="https://img.icons8.com/3d-fluency/94/video-call.png"
                alt="Video calls"
                className="w-14 h-14 drop-shadow-md"
                loading="lazy"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">Calls & Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Express Yourself with 24-Hour Stories & HD Calls
            </h2>
            <p className="text-sm text-gray-600 dark:text-[#8696A0] leading-relaxed">
              Share daily updates, moments, and thoughts. Upload photos, videos, or create custom gradient text status.
              Track who viewed your story and receive emoji reactions.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-xs font-medium">
                ⏱️ 24h Auto-Expiry
              </span>
              <span className="px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-xs font-medium">
                👁️ Viewers List
              </span>
              <span className="px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-xs font-medium">
                🎨 Gradient Fonts
              </span>
              <span className="px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-xs font-medium">
                ❤️ Story Likes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. META AI ASSISTANT SECTION                                 */}
      {/* ============================================================ */}
      <section id="ai" className="py-16 bg-white dark:bg-[#111B21] border-y border-black/[0.06] dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00D2FF]/10 to-[#9B51E0]/10 border border-[#00D2FF]/20 text-[#00D2FF] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Built-in Meta AI Assistant</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white max-w-2xl mx-auto">
            Your Personal AI Companion Inside Every Chat
          </h2>

          <p className="text-sm text-gray-600 dark:text-[#8696A0] max-w-xl mx-auto">
            Need recipe ideas, coding assistance, translation, or quick answers? Chat directly with @meta_ai for instant,
            intelligent multi-turn conversations.
          </p>

          <div className="max-w-lg mx-auto p-4 rounded-3xl bg-[#F0F2F5] dark:bg-[#0C1317] border border-black/[0.06] dark:border-white/[0.06] text-left space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Meta AI</span>
                <span className="text-[10px] text-gray-400 block">Always active</span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-[#D1D7DB] italic">
              "How can I help you today? Ask me about code, travel plans, creative writing, or summaries!"
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PRIVACY & SECURITY SECTION                                */}
      {/* ============================================================ */}
      <section id="privacy" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">Privacy First</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            You Are in Total Control
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#8696A0] max-w-md mx-auto">
            Granular privacy toggles ensure your data and identity remain safe at all times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
            <Shield className="w-6 h-6 text-[#00A884]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Last Seen Privacy</h3>
            <p className="text-xs text-gray-500 dark:text-[#8696A0]">
              Choose who can see when you were last active (Everyone, Contacts, Nobody).
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
            <Lock className="w-6 h-6 text-[#00D2FF]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Read Receipts</h3>
            <p className="text-xs text-gray-500 dark:text-[#8696A0]">
              Turn off blue ticks if you don't want others to know when you've read their messages.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
            <Eye className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">View-Once Media</h3>
            <p className="text-xs text-gray-500 dark:text-[#8696A0]">
              Photos and videos that self-destruct immediately after a single view.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Block & Report</h3>
            <p className="text-xs text-gray-500 dark:text-[#8696A0]">
              Instant one-click blocking and community moderation reporting against bad actors.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. RULES, REGULATIONS & COMMUNITY GUIDELINES                  */}
      {/* ============================================================ */}
      <section id="rules" className="py-16 border-b border-black/[0.04] dark:border-white/[0.04] bg-[#F8F9FA] dark:bg-[#0C1317]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold mb-3">
              <Scale className="w-3.5 h-3.5" />
              COMMUNITY STANDARDS
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Rules & Regulations
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#8696A0] mt-2 max-w-lg mx-auto">
              By using ChatFlow, you agree to follow these community guidelines to keep our platform safe and respectful.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <UserCheck className="w-5 h-5 text-[#00A884]" />, title: "Respectful Communication", desc: "Treat every user with respect. Harassment, hate speech, bullying, and discrimination are strictly prohibited." },
              { icon: <Shield className="w-5 h-5 text-blue-500" />, title: "No Spam or Scams", desc: "Sending unsolicited messages, phishing links, fraudulent content, or spam is not allowed." },
              { icon: <Eye className="w-5 h-5 text-purple-500" />, title: "Privacy & Consent", desc: "Do not share others' private information (photos, addresses, contacts) without their explicit consent." },
              { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, title: "No Illegal Content", desc: "Sharing illegal material, piracy, or content that violates laws is prohibited and will result in permanent ban." },
              { icon: <Lock className="w-5 h-5 text-emerald-500" />, title: "Account Security", desc: "Keep your login credentials safe. You are responsible for all activities under your account." },
              { icon: <BookOpen className="w-5 h-5 text-cyan-500" />, title: "Intellectual Property", desc: "Respect copyrights and trademarks. Do not distribute copyrighted material without authorization." },
              { icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />, title: "Report Violations", desc: "If you encounter violations, use the in-app report feature. Our moderation team reviews reports within 24 hours." },
              { icon: <FileText className="w-5 h-5 text-orange-500" />, title: "Terms of Service", desc: "Full terms of service and privacy policy are available in Settings. Violations may result in account suspension." },
            ].map((rule, i) => (
              <div key={i} className="flex gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-black/[0.06] dark:border-white/[0.06] hover:border-[#00A884]/30 transition-colors">
                <div className="flex-shrink-0 mt-0.5">{rule.icon}</div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{rule.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-[#8696A0] mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. HELP & SUPPORT CENTER                                     */}
      {/* ============================================================ */}
      <section id="help" className="py-16 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              SUPPORT CENTER
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Help & Support
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#8696A0] mt-2 max-w-lg mx-auto">
              Need help? Browse our FAQ or submit a support ticket below. Our team typically responds within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00A884]" /> Frequently Asked Questions
              </h3>
              {[
                { q: "How do I create an account?", a: "Tap 'Get Started', choose a unique @username, set a password, and you're ready to chat — no phone number needed." },
                { q: "Is ChatFlow free to use?", a: "Yes! ChatFlow is 100% free. All features including messaging, voice/video calls, stories, and AI assistant are included." },
                { q: "How do I find other users?", a: "Search for any user by their @username in the Find People tab. You can also scan QR codes for instant connection." },
                { q: "Can I make voice and video calls?", a: "Yes! ChatFlow supports HD voice and video calling powered by WebRTC for crystal-clear peer-to-peer connections." },
                { q: "How do I report a user?", a: "Open the user's profile → tap the three dots menu → select 'Report'. Our moderation team reviews all reports." },
                { q: "Is my data encrypted?", a: "Yes. All messages and calls use end-to-end encryption. View-once media adds an extra layer of privacy." },
              ].map((faq, i) => (
                <details key={i} className="group rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111B21] overflow-hidden">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#202C33] transition-colors">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-3 text-xs text-gray-500 dark:text-[#8696A0] leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>

            {/* Contact / Help Form */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111B21] p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#00A884]" /> Submit a Support Ticket
              </h3>
              {helpSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#00A884]/15 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-[#00A884]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Submitted!</h4>
                  <p className="text-sm text-gray-500 dark:text-[#8696A0] mt-1">We'll get back to you within 24 hours at the email you provided.</p>
                  <button
                    onClick={() => { setHelpSubmitted(false); setHelpForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-4 text-sm font-bold text-[#00A884] hover:underline"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setHelpSubmitted(true); }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-[#8696A0] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={helpForm.name}
                      onChange={(e) => setHelpForm({ ...helpForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] dark:bg-[#202C33] border border-black/[0.06] dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#00A884]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-[#8696A0] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={helpForm.email}
                      onChange={(e) => setHelpForm({ ...helpForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] dark:bg-[#202C33] border border-black/[0.06] dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#00A884]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-[#8696A0] mb-1">Subject</label>
                    <select
                      required
                      value={helpForm.subject}
                      onChange={(e) => setHelpForm({ ...helpForm, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] dark:bg-[#202C33] border border-black/[0.06] dark:border-white/[0.06] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A884]/50"
                    >
                      <option value="">Select a topic...</option>
                      <option value="account">Account Issue</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="privacy">Privacy Concern</option>
                      <option value="abuse">Report Abuse</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-[#8696A0] mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={helpForm.message}
                      onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] dark:bg-[#202C33] border border-black/[0.06] dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#00A884]/50 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00A884]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. FINAL CALL TO ACTION                                     */}
      {/* ============================================================ */}
      <section className="py-16 bg-gradient-to-br from-[#00A884] to-[#008f6f] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Start Chatting Without Sharing Your Phone Number
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Join thousands of users enjoying fast, private, and username-first real-time messaging today.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#00A884] hover:bg-gray-100 font-extrabold text-sm sm:text-base rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>Create Free Account Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FOOTER WITH DEVELOPER COPYRIGHT                           */}
      {/* ============================================================ */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111B21] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-[#8696A0]">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showText={true} />
            <span>• Fast Username-First Real-Time Chat</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-[#00A884]">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-[#00A884]">
              Register
            </Link>
            <Link href="/forgot-password" className="hover:text-[#00A884]">
              Reset Password
            </Link>
          </div>

          <p className="text-center font-medium">
            © 2026 ChatFlow — Developed by <span className="font-bold text-[#00A884] dark:text-[#34D399]">malikabubakkar</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
