"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  duration?: number | null;
  isMine?: boolean;
}

export function AudioPlayer({ src, duration: initialDuration, isMine = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
        });
    }
  };

  const handleSpeedToggle = () => {
    if (!audioRef.current) return;
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleBarClick = (ratio: number) => {
    if (!audioRef.current || !duration) return;
    const targetTime = ratio * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const waveformHeights = [35, 60, 25, 80, 45, 70, 95, 40, 55, 30, 75, 90, 35, 65, 45, 75, 55, 25, 65, 40];

  return (
    <div className="flex items-center gap-3 p-1.5 min-w-[220px] max-w-xs sm:max-w-sm select-none">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button (iOS WhatsApp Circular Button) */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={hasError}
        className="w-10 h-10 rounded-full bg-[#00A884] dark:bg-[#00A884] text-white flex items-center justify-center shadow-xs hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-white" />
        ) : (
          <Play className="w-5 h-5 fill-white ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 flex flex-col gap-1 min-w-[130px]">
        <div className="flex items-center gap-1 h-6 cursor-pointer py-1">
          {waveformHeights.map((h, i) => {
            const progressRatio = duration > 0 ? currentTime / duration : 0;
            const barRatio = (i + 1) / waveformHeights.length;
            const isPassed = barRatio <= progressRatio;

            return (
              <div
                key={i}
                onClick={() => handleBarClick(barRatio)}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-[#00A884] dark:bg-[#34D399]"
                    : "bg-black/20 dark:bg-white/20"
                } ${isPlaying && isPassed ? (i % 2 === 0 ? "opacity-80" : "opacity-100") : ""}`}
              />
            );
          })}
        </div>

        {/* Time duration & Speed control */}
        <div className="flex items-center justify-between text-[11px] text-[#8E8E93] dark:text-[#8E8E93] font-medium">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}</span>

          {isPlaying && (
            <button
              type="button"
              onClick={handleSpeedToggle}
              className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 text-[10px] font-bold text-black dark:text-white"
            >
              {playbackRate}x
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

