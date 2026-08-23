"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onSendVoice: (audioUrl: string, duration: number, isViewOnce?: boolean) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSendVoice, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [micError, setMicError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      cleanupMedia();
    };
  }, []);

  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const getBestMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg;codecs=opus",
      "",
    ];
    for (const t of types) {
      if (!t || (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t))) {
        return t;
      }
    }
    return "";
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setMicError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const mimeType = getBestMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      startTimer();
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setMicError("Microphone access is required to record voice notes.");
      setTimeout(() => {
        onCancel();
      }, 2500);
    }
  };

  const handleStopAndSend = async () => {
    if (!mediaRecorderRef.current) return;

    stopTimer();
    const finalDuration = seconds;
    setIsUploading(true);

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      try {
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const file = new File([audioBlob], `voice_${Date.now()}.${extension}`, { type: mimeType });

        let audioUrl = "";

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.url) {
            audioUrl = data.url;
          }
        } catch (uploadErr) {
          console.warn("Upload API failed, converting to Data URL:", uploadErr);
        }

        // If server upload didn't return a URL, convert audioBlob to Base64 Data URL locally
        if (!audioUrl) {
          audioUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });
        }

        if (audioUrl) {
          onSendVoice(audioUrl, finalDuration || 1, isViewOnce);
        }
      } catch (e) {
        console.error("Voice processing error:", e);
        onCancel();
      } finally {
        setIsUploading(false);
        cleanupMedia();
      }
    };

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const handleCancel = () => {
    stopTimer();
    cleanupMedia();
    onCancel();
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const remaining = s % 60;
    return `${m}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  if (micError) {
    return (
      <div className="flex items-center justify-between gap-3 w-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[14px] px-4 py-2 text-[13px] font-semibold text-[#FF3B30] animate-fade-in">
        <span>⚠️ {micError}</span>
        <button type="button" onClick={handleCancel} className="underline text-[12px]">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 w-full bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.06] rounded-[20px] px-4 py-1.5 shadow-xs animate-fade-in select-none">
      {/* Recording status indicator */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-ping absolute" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] relative" />
        </div>
        <span className="text-[14px] font-semibold text-black dark:text-white font-ios">
          {formatSeconds(seconds)}
        </span>

        {/* Dynamic visualizer bars */}
        <div className="hidden sm:flex items-center gap-1 h-4 ml-2">
          <div className="w-0.5 bg-[#FF3B30] rounded-full animate-wave-1 h-2" />
          <div className="w-0.5 bg-[#FF3B30] rounded-full animate-wave-2 h-4" />
          <div className="w-0.5 bg-[#FF3B30] rounded-full animate-wave-3 h-2.5" />
          <div className="w-0.5 bg-[#FF3B30] rounded-full animate-wave-4 h-4" />
          <div className="w-0.5 bg-[#FF3B30] rounded-full animate-wave-2 h-3" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* View Once Toggle Button */}
        <button
          type="button"
          onClick={() => setIsViewOnce((prev) => !prev)}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
            isViewOnce
              ? "bg-[#00A884] text-white ring-2 ring-[#00A884]/40"
              : "border border-dashed border-[#8E8E93] text-[#8E8E93] hover:text-[#00A884] hover:border-[#00A884]"
          }`}
          title={isViewOnce ? "View Once Enabled" : "Send as View Once"}
        >
          ①
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full active:scale-95 transition-all"
          title="Discard recording"
        >
          <Trash2 className="w-4 h-4 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={handleStopAndSend}
          disabled={isUploading}
          className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#009272] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5 stroke-[2.2]" />
          )}
        </button>
      </div>
    </div>
  );
}

