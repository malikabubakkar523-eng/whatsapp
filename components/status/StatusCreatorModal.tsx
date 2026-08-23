"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Type,
  Image as ImageIcon,
  Palette,
  Send,
  Loader2,
  Smile,
  Sparkles,
} from "lucide-react";

interface StatusCreatorModalProps {
  onClose: () => void;
  onStatusCreated: () => void;
}

const BG_GRADIENTS = [
  "from-[#00A884] to-[#075E54]", // WhatsApp Emerald
  "from-[#6366F1] to-[#4338CA]", // Indigo
  "from-[#EC4899] to-[#BE185D]", // Pink / Rose
  "from-[#F59E0B] to-[#D97706]", // Amber
  "from-[#8B5CF6] to-[#6D28D9]", // Purple
  "from-[#10B981] to-[#047857]", // Mint Green
  "from-[#EF4444] to-[#B91C1C]", // Crimson Red
  "from-[#1F2937] to-[#111827]", // Obsidian Dark
];

export function StatusCreatorModal({ onClose, onStatusCreated }: StatusCreatorModalProps) {
  const [mode, setMode] = useState<"TEXT" | "MEDIA">("TEXT");
  const [text, setText] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMode("MEDIA");
    }
  };

  const handleCycleBg = () => {
    setBgIndex((prev) => (prev + 1) % BG_GRADIENTS.length);
  };

  const handleSubmit = async () => {
    if (mode === "TEXT" && !text.trim()) return;
    if (mode === "MEDIA" && !mediaFile && !mediaPreview) return;

    setIsSubmitting(true);
    try {
      let mediaUrl = null;
      let type = "TEXT";

      if (mode === "MEDIA" && mediaFile) {
        const formData = new FormData();
        formData.append("file", mediaFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          mediaUrl = uploadData.url;
          type = mediaFile.type.startsWith("video/") ? "VIDEO" : "IMAGE";
        } else {
          throw new Error(uploadData.error || "Media upload failed");
        }
      }

      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content: mode === "TEXT" ? text.trim() : caption.trim(),
          mediaUrl,
          bgColor: BG_GRADIENTS[bgIndex],
        }),
      });

      if (res.ok) {
        onStatusCreated();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post status");
      }
    } catch (e: any) {
      alert(e.message || "Failed to create status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-fade-in select-none">
      {/* Top Controls */}
      <header className="p-4 flex items-center justify-between text-white z-20">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {mode === "TEXT" && (
            <button
              type="button"
              onClick={handleCycleBg}
              className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1.5 text-[13px] font-bold text-white hover:bg-black/60 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Color</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            title="Upload Photo / Video"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            className="hidden"
          />
        </div>
      </header>

      {/* Main Status Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {mode === "TEXT" ? (
          <div
            className={`w-full max-w-lg h-full max-h-[600px] rounded-[32px] bg-gradient-to-br ${BG_GRADIENTS[bgIndex]} flex items-center justify-center p-8 shadow-2xl transition-all duration-300 relative`}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a status..."
              autoFocus
              maxLength={700}
              className="w-full bg-transparent text-white text-center font-bold text-[28px] sm:text-[34px] leading-tight placeholder-white/50 focus:outline-none resize-none overflow-y-auto max-h-[400px]"
            />
            <div className="absolute bottom-4 right-6 text-white/60 text-[12px] font-semibold">
              {text.length}/700
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg h-full max-h-[600px] rounded-[32px] overflow-hidden bg-black relative flex items-center justify-center">
            {mediaPreview && (
              mediaFile?.type.startsWith("video/") ? (
                <video src={mediaPreview} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={mediaPreview} alt="Status Preview" className="w-full h-full object-contain" />
              )
            )}
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                  setMode("TEXT");
                }}
                className="p-2 rounded-full bg-black/60 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <footer className="p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 z-20">
        {mode === "MEDIA" && (
          <div className="w-full max-w-lg mx-auto">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-4 py-3 bg-white/15 backdrop-blur-md rounded-[20px] text-white placeholder-white/60 text-[15px] focus:outline-none border border-white/10"
            />
          </div>
        )}

        <div className="w-full max-w-lg mx-auto flex items-center justify-between">
          <div className="text-[12px] text-white/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Disappears after 24 hours</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting || (mode === "TEXT" && !text.trim())}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-full bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-bold text-[15px] flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Post Status</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
