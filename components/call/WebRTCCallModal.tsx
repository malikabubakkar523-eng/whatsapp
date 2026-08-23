"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";
import { getSocket } from "@/lib/socket";

export interface ActiveCallData {
  callId: string;
  conversationId: string;
  otherUser: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string | null;
  };
  callType: "VOICE" | "VIDEO";
  isIncoming: boolean;
}

interface WebRTCCallModalProps {
  callData: ActiveCallData;
  onEndCall: (durationSeconds: number, status: "COMPLETED" | "MISSED" | "REJECTED") => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function WebRTCCallModal({ callData, onEndCall }: WebRTCCallModalProps) {
  const [callState, setCallState] = useState<"RINGING" | "CONNECTED" | "ENDED">(
    callData.isIncoming ? "RINGING" : "RINGING"
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(callData.callType === "VOICE");
  const [duration, setDuration] = useState(0);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebRTC and Audio/Video Streams
  useEffect(() => {
    let isMounted = true;
    const socket = getSocket();

    async function setupMediaAndPeer() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callData.callType === "VIDEO",
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && callData.callType === "VIDEO") {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setHasRemoteVideo(true);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("call:signal", {
              targetUserId: callData.otherUser.id,
              callId: callData.callId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        // If caller (outgoing), create offer
        if (!callData.isIncoming) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("call:invite", {
            callId: callData.callId,
            conversationId: callData.conversationId,
            targetUserId: callData.otherUser.id,
            callType: callData.callType,
            caller: {
              userId: socket.id || "",
              displayName: "You",
              username: "you",
            },
          });
          socket.emit("call:signal", {
            targetUserId: callData.otherUser.id,
            callId: callData.callId,
            signal: offer,
          });
        }
      } catch (err) {
        console.warn("Camera/Mic access error or user denied:", err);
      }
    }

    setupMediaAndPeer();

    // Socket Event Listeners
    const handleCallAccepted = async () => {
      setCallState("CONNECTED");
    };

    const handleCallEnded = () => {
      cleanup();
      onEndCall(duration, "COMPLETED");
    };

    const handleSignal = async (data: { signal: any }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !data.signal) return;

      try {
        if (data.signal.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call:signal", {
            targetUserId: callData.otherUser.id,
            callId: callData.callId,
            signal: answer,
          });
        } else if (data.signal.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
        } else if (data.signal.type === "candidate" && data.signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        }
      } catch (e) {
        console.warn("Signal handling warning:", e);
      }
    };

    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:signal", handleSignal);

    return () => {
      isMounted = false;
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:signal", handleSignal);
      cleanup();
    };
  }, [callData]);

  // Duration Timer
  useEffect(() => {
    if (callState === "CONNECTED") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAcceptIncoming = async () => {
    setCallState("CONNECTED");
    const socket = getSocket();
    socket.emit("call:accept", {
      callId: callData.callId,
      callerId: callData.otherUser.id,
      targetUserId: socket.id,
    });
  };

  const handleRejectOrEnd = () => {
    const socket = getSocket();
    if (callState === "RINGING" && callData.isIncoming) {
      socket.emit("call:reject", {
        callId: callData.callId,
        callerId: callData.otherUser.id,
        targetUserId: socket.id,
      });
      cleanup();
      onEndCall(0, "REJECTED");
    } else {
      socket.emit("call:end", {
        callId: callData.callId,
        otherUserId: callData.otherUser.id,
      });
      cleanup();
      onEndCall(duration, duration > 0 ? "COMPLETED" : "MISSED");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md h-[560px] max-h-[90vh] bg-[#161618] border border-white/10 rounded-[32px] overflow-hidden flex flex-col justify-between p-6 shadow-2xl relative">
        {/* Top Header */}
        <div className="text-center z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {callData.callType === "VIDEO" ? "HD Video Call" : "HD Voice Call"} • End-to-End Encrypted
            </span>
          </div>

          <p className="text-xs text-emerald-400 font-medium tracking-wide">
            {callState === "RINGING"
              ? callData.isIncoming
                ? "Incoming Call..."
                : "Calling..."
              : `Connected • ${formatTimer(duration)}`}
          </p>
        </div>

        {/* Video Streams Container (For Video Calls) */}
        {callData.callType === "VIDEO" && (
          <div className="absolute inset-0 z-0 bg-black">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${callState === "CONNECTED" ? "block" : "hidden"}`}
            />
            {/* Local Video Thumbnail */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-28 h-40 object-cover rounded-2xl absolute top-16 right-4 border-2 border-white/20 shadow-2xl z-20"
            />
          </div>
        )}

        {/* Center Avatar & User Info (Shown in Voice Calls or while Ringing) */}
        {(callData.callType === "VOICE" || callState === "RINGING" || !hasRemoteVideo) && (
          <div className="flex flex-col items-center justify-center flex-1 my-auto z-10 space-y-4">
            <div className="relative">
              <Avatar
                src={callData.otherUser.avatar}
                name={callData.otherUser.displayName}
                username={callData.otherUser.username}
                size="2xl"
              />
              {callState === "RINGING" && (
                <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-500/60 animate-ping pointer-events-none" />
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white font-ios">
                {callData.otherUser.displayName}
              </h2>
              <p className="text-sm text-emerald-400 font-medium mt-0.5">
                {formatUsername(callData.otherUser.username)}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="z-10 pt-4 flex items-center justify-center gap-6">
          {callState === "RINGING" && callData.isIncoming ? (
            /* Incoming Call Accept & Reject Buttons */
            <div className="flex items-center justify-around w-full px-6">
              {/* Reject Button */}
              <button
                type="button"
                onClick={handleRejectOrEnd}
                className="w-16 h-16 rounded-full bg-[#FF3B30] hover:bg-[#D70015] text-white flex flex-col items-center justify-center shadow-lg shadow-[#FF3B30]/40 active:scale-95 transition-transform cursor-pointer"
              >
                <PhoneOff className="w-7 h-7" />
                <span className="text-[10px] font-bold mt-0.5">Decline</span>
              </button>

              {/* Accept Button */}
              <button
                type="button"
                onClick={handleAcceptIncoming}
                className="w-16 h-16 rounded-full bg-[#34C759] hover:bg-[#28A745] text-white flex flex-col items-center justify-center shadow-lg shadow-[#34C759]/40 active:scale-95 transition-transform animate-bounce cursor-pointer"
              >
                <Phone className="w-7 h-7" />
                <span className="text-[10px] font-bold mt-0.5">Accept</span>
              </button>
            </div>
          ) : (
            /* Active / Outgoing Call Controls */
            <>
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMuted
                    ? "bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/30"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleRejectOrEnd}
                className="w-16 h-16 rounded-full bg-[#FF3B30] hover:bg-[#D70015] text-white flex items-center justify-center shadow-xl shadow-[#FF3B30]/40 active:scale-95 transition-transform cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Video Toggle */}
              {callData.callType === "VIDEO" && (
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isVideoDisabled
                      ? "bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/30"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                  title={isVideoDisabled ? "Turn Video On" : "Turn Video Off"}
                >
                  {isVideoDisabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
