"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Share2,
  Download,
  Camera,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  QrCode,
  ArrowRight,
  AlertCircle,
  Copy,
} from "lucide-react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { useAuth } from "@/components/auth/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";

interface QRCodeModalProps {
  onClose: () => void;
  onScanSuccess: (username: string) => void;
  initialTab?: "my-code" | "scan";
}

export function QRCodeModal({
  onClose,
  onScanSuccess,
  initialTab = "my-code",
}: QRCodeModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"my-code" | "scan">(initialTab);

  // My Code states
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Scan states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUsername, setScannedUsername] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const username = user?.profile?.username || "user";
  const displayName = user?.profile?.displayName || "User";
  const avatarUrl = user?.profile?.avatar || "";

  // -------------------------------------------------------------
  // 1. GENERATE QR CODE WITH USER AVATAR IN CENTER
  // -------------------------------------------------------------
  useEffect(() => {
    if (tab === "my-code" && qrCanvasRef.current && user) {
      const canvas = qrCanvasRef.current;
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "https://chatflow.app";
      const payload = `${origin}/u/${encodeURIComponent(username)}`;

      QRCode.toCanvas(
        canvas,
        payload,
        {
          width: 240,
          margin: 2,
          errorCorrectionLevel: "H", // High error correction allows center avatar placement
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (err) => {
          if (err) {
            console.error("QR Code generation error:", err);
          }
        }
      );
    }
  }, [tab, user, username]);

  // -------------------------------------------------------------
  // 2. CAMERA SCANNER LOOP (jsQR)
  // -------------------------------------------------------------
  const parseUsernameFromQR = (data: string): string | null => {
    if (!data) return null;
    let clean = data.trim();
    // Pattern 1: chatflow://user/{username}
    const deepMatch = clean.match(/^chatflow:\/\/user\/([a-zA-Z0-9_.-]+)$/i);
    if (deepMatch) return deepMatch[1];

    // Pattern 2: https://.../u/{username} or ?user={username}
    const urlMatch = clean.match(/\/(?:u|user)\/([a-zA-Z0-9_.-]+)/i);
    if (urlMatch) return urlMatch[1];

    const paramMatch = clean.match(/[?&]user=([a-zA-Z0-9_.-]+)/i);
    if (paramMatch) return paramMatch[1];

    // Pattern 3: plain @username or username
    if (/^@?[a-zA-Z0-9_.-]{3,30}$/.test(clean)) {
      return clean.replace(/^@/, "");
    }

    return null;
  };

  const handleFoundCode = useCallback(
    (codeData: string) => {
      const detected = parseUsernameFromQR(codeData);
      if (detected) {
        setScannedUsername(detected);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([40, 60, 40]);
          } catch (e) {}
        }
        setTimeout(() => {
          onScanSuccess(detected);
          onClose();
        }, 800);
      }
    },
    [onScanSuccess, onClose]
  );

  const startCamera = async () => {
    setCameraError("");
    setScannedUsername(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera permission is required to scan QR codes. You can also upload a photo below."
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const tick = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleFoundCode(code.data);
          return;
        }
      }
    }

    if (!scannedUsername) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (tab === "scan") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [tab]);

  // -------------------------------------------------------------
  // 3. SCAN FROM UPLOADED IMAGE FILE
  // -------------------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setIsProcessingFile(false);
          return;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleFoundCode(code.data);
        } else {
          setCameraError("No valid ChatFlow QR code found in this image.");
        }
        setIsProcessingFile(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // 4. SHARE & DOWNLOAD ACTIONS
  // -------------------------------------------------------------
  const handleShare = async () => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://chatflow.app";
    const shareUrl = `${origin}/u/${encodeURIComponent(username)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connect with ${displayName} on ChatFlow`,
          text: `Scan my QR code or tap the link to message me on ChatFlow: @${username}`,
          url: shareUrl,
        });
        return;
      } catch (e) {}
    }

    // Fallback: Copy link
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleDownload = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const link = document.createElement("a");
    link.download = `chatflow-qr-${username}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] w-full max-w-md shadow-2xl flex flex-col overflow-hidden relative">
        {/* Hidden image input for file upload scanner */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* iOS Navigation Header Bar */}
        <header className="h-[54px] px-4 bg-[#F6F6F6]/90 dark:bg-[#1C1C1E]/90 ios-blur border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between z-20 flex-shrink-0">
          <span className="text-[17px] font-bold text-black dark:text-white font-ios">
            QR Code
          </span>

          {/* iOS Segmented Control: My Code / Scan Code */}
          <div className="flex bg-[#767680]/15 dark:bg-[#767680]/25 p-0.5 rounded-[9px]">
            <button
              type="button"
              onClick={() => setTab("my-code")}
              className={`px-3 py-1 text-[13px] font-semibold rounded-[7px] transition-all font-ios ${
                tab === "my-code"
                  ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-black dark:hover:text-white"
              }`}
            >
              My Code
            </button>
            <button
              type="button"
              onClick={() => setTab("scan")}
              className={`px-3 py-1 text-[13px] font-semibold rounded-[7px] transition-all font-ios ${
                tab === "scan"
                  ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-black dark:hover:text-white"
              }`}
            >
              Scan Code
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center text-[12px]"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* TAB 1: MY QR CODE */}
          {tab === "my-code" && (
            <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
              {/* WhatsApp iOS White Card Container */}
              <div className="w-full bg-white dark:bg-[#2C2C2E] rounded-[24px] p-6 shadow-sm border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center space-y-4">
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-1">
                  <Avatar
                    src={avatarUrl}
                    name={displayName}
                    username={username}
                    size="lg"
                  />
                  <h3 className="text-[20px] font-bold text-black dark:text-white font-ios pt-1">
                    {displayName}
                  </h3>
                  <p className="text-[14px] font-semibold text-[#00A884] dark:text-[#34D399]">
                    {formatUsername(username)}
                  </p>
                </div>

                {/* Centered QR Canvas with avatar badge */}
                <div className="relative p-3 bg-white rounded-[20px] shadow-sm border border-black/[0.04]">
                  <canvas ref={qrCanvasRef} className="rounded-[12px]" />
                  {/* Center circular avatar */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full ring-4 ring-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                      <Avatar
                        src={avatarUrl}
                        name={displayName}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#8E8E93] max-w-[260px] leading-relaxed">
                  Your QR code is private. If you share it with someone, they can scan it with their camera to message you.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-3 px-4 rounded-[14px] bg-[#007AFF] hover:bg-[#0062CC] text-white text-[15px] font-semibold shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-3 px-4 rounded-[14px] bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.08] text-black dark:text-white text-[15px] font-semibold hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center"
                  title="Save QR Code Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN QR CODE */}
          {tab === "scan" && (
            <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full aspect-square max-w-[300px] bg-black rounded-[24px] overflow-hidden shadow-lg border border-white/10 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />

                {/* Laser Scanning Line Animation */}
                {isScanning && !scannedUsername && (
                  <div className="absolute inset-x-8 top-0 h-1 bg-[#34C759] shadow-[0_0_12px_#34C759] animate-bounce-subtle pointer-events-none" />
                )}

                {/* Corner Targeting Brackets */}
                <div className="absolute inset-6 pointer-events-none">
                  {/* Top-Left */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#34C759] rounded-tl-xl" />
                  {/* Top-Right */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#34C759] rounded-tr-xl" />
                  {/* Bottom-Left */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#34C759] rounded-bl-xl" />
                  {/* Bottom-Right */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#34C759] rounded-br-xl" />
                </div>

                {/* Scanned Success Overlay */}
                {scannedUsername && (
                  <div className="absolute inset-0 bg-[#34C759]/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-pop-in">
                    <div className="w-12 h-12 rounded-full bg-white text-[#34C759] flex items-center justify-center shadow-lg mb-2">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                    <span className="text-[17px] font-bold font-ios">User Found!</span>
                    <span className="text-[14px] font-medium opacity-90">
                      @{scannedUsername}
                    </span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[12px] text-[13px] font-semibold text-[#FF3B30] flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <p className="text-[13px] text-[#8E8E93] max-w-[280px]">
                Hold your camera over a ChatFlow QR code to instantly start a chat.
              </p>

              {/* Upload Image from Gallery Fallback */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="w-full py-3 px-4 rounded-[14px] bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.08] text-black dark:text-white text-[14px] font-semibold hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
                    <span>Scanning photo...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-[#007AFF]" />
                    <span>Upload Image from Photos</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
