"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Heart,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Share2,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import { UserStatusType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { format, formatDistanceToNow } from "date-fns";

interface StatusViewerModalProps {
  statuses: UserStatusType[];
  initialIndex?: number;
  currentUserId: string;
  onClose: () => void;
  onReply?: (targetUsername: string, text: string) => void;
  onStatusDeleted?: (statusId: string) => void;
}

const DEFAULT_IMAGE_DURATION = 6500; // 6.5 seconds for images & text

export function StatusViewerModal({
  statuses: initialStatuses,
  initialIndex = 0,
  currentUserId,
  onClose,
  onReply,
  onStatusDeleted,
}: StatusViewerModalProps) {
  const [statuses, setStatuses] = useState<UserStatusType[]>(initialStatuses);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStatus = statuses[currentIndex];
  const isMine = currentStatus?.userId === currentUserId;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  // Initialize status on index change
  useEffect(() => {
    if (!currentStatus) return;
    setLiked(!!currentStatus.isLikedByMe);
    setLikesCount(currentStatus.likes?.length || 0);
    setProgress(0);

    // Record view if not mine
    if (!isMine) {
      fetch(`/api/status/${currentStatus.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [currentIndex, currentStatus, isMine]);

  // Video and Timer Sync
  useEffect(() => {
    if (!currentStatus) return;

    // For video: playback controls progress
    if (currentStatus.type === "VIDEO") {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (videoRef.current) {
        if (isPaused || showViewersSheet) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
      return;
    }

    // For images and text: interval timer
    if (isPaused || showViewersSheet) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const step = 50;
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (step / DEFAULT_IMAGE_DURATION) * 100;
      });
    }, step);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, showViewersSheet, currentStatus]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  // Hold to pause interaction
  const handleHoldStart = () => {
    isHoldingRef.current = true;
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleHoldEnd = () => {
    isHoldingRef.current = false;
    setIsPaused(false);
    if (videoRef.current && currentStatus?.type === "VIDEO") {
      videoRef.current.play().catch(() => {});
    }
  };

  // Video time update handler
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const pct = (current / duration) * 100;
      setProgress(pct);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  const handleToggleLike = async () => {
    if (!currentStatus) return;
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/status/${currentStatus.id}/like`, { method: "POST" });
    } catch (e) {
      setLiked(!nextState);
      setLikesCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleDeleteStatus = async () => {
    if (!currentStatus || !confirm("Are you sure you want to delete this status update?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/status/${currentStatus.id}`, { method: "DELETE" });
      if (res.ok) {
        onStatusDeleted?.(currentStatus.id);
        const updated = statuses.filter((s) => s.id !== currentStatus.id);
        if (updated.length === 0) {
          onClose();
        } else {
          setStatuses(updated);
          setCurrentIndex(Math.min(currentIndex, updated.length - 1));
          setProgress(0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !currentStatus?.user?.profile?.username) return;
    onReply?.(
      currentStatus.user.profile.username,
      `Replying to status: "${currentStatus.content || "media"}"\n\n${replyText.trim()}`
    );
    setReplyText("");
    onClose();
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-fade-in">
      {/* Top Header & Segmented Progress Bar */}
      <div className="p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent z-30 space-y-3">
        {/* Segmented Progress Bars (Instagram/WhatsApp style) */}
        <div className="flex items-center gap-1.5 w-full">
          {statuses.map((s, idx) => (
            <div
              key={s.id || idx}
              className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info & Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentStatus.user?.profile?.avatar}
              name={currentStatus.user?.profile?.displayName}
              username={currentStatus.user?.profile?.username}
              size="sm"
            />
            <div>
              <p className="font-bold text-[15px] leading-tight font-ios">
                {currentStatus.user?.profile?.displayName || "User"}
              </p>
              <p className="text-[12px] text-white/70">
                {formatDistanceToNow(new Date(currentStatus.createdAt), { addSuffix: true })}
                {currentStatus.type === "VIDEO" && " • 📹 Video"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pause indicator pill when holding */}
            {isPaused && !showViewersSheet && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md animate-pulse">
                Paused ⏸
              </span>
            )}

            {/* Delete button for my status */}
            {isMine && (
              <button
                type="button"
                onClick={handleDeleteStatus}
                disabled={isDeleting}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF3B30]/30 hover:text-[#FF3B30] flex items-center justify-center text-white transition-colors"
                title="Delete Status"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Story Media Display with Hold-To-Pause and Tap Zones */}
      <div
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {/* Left & Right Tap Zones (30% left / 30% right) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[30%] z-20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-[30%] z-20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        />

        {/* Content Display */}
        {currentStatus.type === "TEXT" ? (
          <div
            className={`w-full max-w-lg h-full max-h-[580px] rounded-[32px] bg-gradient-to-br ${
              currentStatus.bgColor || "from-[#00A884] to-[#075E54]"
            } flex items-center justify-center p-8 text-center shadow-2xl animate-scale-in`}
          >
            <p className="text-white font-bold text-[28px] sm:text-[34px] leading-snug break-words">
              {currentStatus.content}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-lg h-full max-h-[620px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center relative shadow-2xl">
            {currentStatus.type === "VIDEO" ? (
              <video
                ref={videoRef}
                src={currentStatus.mediaUrl || ""}
                autoPlay
                playsInline
                controls={false}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={currentStatus.mediaUrl || ""}
                alt="Status"
                className="w-full h-full object-contain bg-black"
              />
            )}

            {currentStatus.content && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/65 backdrop-blur-md p-3.5 rounded-[18px] text-white text-center text-[15px] font-medium border border-white/10 shadow-lg">
                {currentStatus.content}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions Footer */}
      <footer className="p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent z-30 flex flex-col gap-2">
        {isMine ? (
          <div className="w-full max-w-lg mx-auto flex items-center justify-between text-white">
            <button
              type="button"
              onClick={() => setShowViewersSheet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full text-[14px] font-bold hover:bg-white/25 active:scale-95 transition-all"
            >
              <Eye className="w-4 h-4 text-[#34D399]" />
              <span>{currentStatus.views?.length || 0} views</span>
            </button>

            <div className="flex items-center gap-1.5 text-[14px] text-white/80">
              <Heart className="w-4 h-4 text-[#FF2D55] fill-[#FF2D55]" />
              <span>{likesCount} likes</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                placeholder={`Reply to ${currentStatus.user?.profile?.displayName || "status"}...`}
                className="w-full pl-4 pr-10 py-2.5 bg-white/20 backdrop-blur-md rounded-full text-white placeholder-white/70 text-[14px] focus:outline-none border border-white/20"
              />
              {replyText.trim() && (
                <button
                  type="button"
                  onClick={handleSendReply}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#00A884] text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleLike}
              className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-125 ${
                liked
                  ? "bg-[#FF2D55]/20 text-[#FF2D55]"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart
                className={`w-6 h-6 ${liked ? "fill-[#FF2D55] text-[#FF2D55]" : ""}`}
              />
            </button>
          </div>
        )}
      </footer>

      {/* Viewers Sheet for My Status */}
      {showViewersSheet && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 flex flex-col justify-end p-3 animate-fade-in"
          onClick={() => setShowViewersSheet(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-[#1C1C1E] border border-white/10 rounded-[28px] overflow-hidden p-4 space-y-3 max-h-[60vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white">
              <span className="font-bold text-[16px] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#34D399]" />
                <span>Viewed by {currentStatus.views?.length || 0}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowViewersSheet(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {currentStatus.views?.length === 0 ? (
                <div className="text-center py-8 text-white/50 text-[14px]">
                  No views yet
                </div>
              ) : (
                currentStatus.views?.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2 rounded-[14px] bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={v.user?.profile?.avatar}
                        name={v.user?.profile?.displayName}
                        username={v.user?.profile?.username}
                        size="sm"
                      />
                      <div>
                        <p className="text-[14px] font-bold text-white">
                          {v.user?.profile?.displayName}
                        </p>
                        <p className="text-[12px] text-[#34D399]">
                          {formatUsername(v.user?.profile?.username)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[12px] text-white/50">
                      {format(new Date(v.viewedAt), "h:mm a")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
