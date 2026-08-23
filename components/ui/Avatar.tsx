import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  username?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  isOnline?: boolean;
  showOnlineIndicator?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function Avatar({
  src,
  name = "User",
  username,
  size = "md",
  isOnline = false,
  showOnlineIndicator = false,
  className = "",
  onClick,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const indicatorSizes = {
    xs: "w-2 h-2 ring-1",
    sm: "w-2.5 h-2.5 ring-1.5",
    md: "w-3 h-3 ring-2",
    lg: "w-3.5 h-3.5 ring-2",
    xl: "w-4 h-4 ring-2",
    "2xl": "w-5 h-5 ring-2",
  };

  // Automatically upscale low-resolution image query parameters to HD
  const getHighResUrl = (url?: string | null): string | null => {
    if (!url) return null;
    let enhanced = url;
    if (enhanced.includes("unsplash.com")) {
      enhanced = enhanced.replace(/w=\d+/, "w=400").replace(/q=\d+/, "q=90");
    }
    return enhanced;
  };

  const hdSrc = getHighResUrl(src);

  const getInitials = (str: string) => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const getGradient = (str: string) => {
    const gradients = [
      "from-[#00A884] to-[#005C4B]",
      "from-[#007AFF] to-[#0040DD]",
      "from-[#5856D6] to-[#3634A3]",
      "from-[#AF52DE] to-[#6A0DAD]",
      "from-[#34C759] to-[#1E8238]",
      "from-[#FF9500] to-[#C96B00]",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const isMetaAI =
    username?.toLowerCase() === "meta_ai" ||
    name?.toLowerCase() === "meta ai" ||
    name?.toLowerCase().includes("chatflow ai");

  return (
    <div
      onClick={onClick}
      className={`relative inline-block flex-shrink-0 select-none ${
        onClick ? "cursor-pointer hover:opacity-90 active:scale-95 transition-transform" : ""
      } ${className}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-xs ${
          isMetaAI
            ? "p-[2.5px] bg-gradient-to-tr from-[#00D2FF] via-[#9B51E0] to-[#FF2A6D] shadow-sm shadow-[#00D2FF]/20"
            : "bg-[#E5E5EA] dark:bg-[#2C2C2E]"
        }`}
      >
        {isMetaAI ? (
          <div className="w-full h-full rounded-full bg-[#161618] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00D2FF]/30 via-[#9B51E0]/30 to-[#FF2A6D]/30" />
            <svg
              className="w-3/5 h-3/5 text-white relative z-10 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" stroke="url(#meta-grad)" strokeWidth="2.5" />
              <path d="m9 12 2 2 4-4" stroke="transparent" />
              <defs>
                <linearGradient id="meta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D2FF" />
                  <stop offset="50%" stopColor="#9B51E0" />
                  <stop offset="100%" stopColor="#FF2A6D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ) : hdSrc && !imageError ? (
          <img
            src={hdSrc}
            alt={name || username || "Avatar"}
            loading="eager"
            decoding="async"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
            className="w-full h-full object-cover select-none"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${getGradient(
              name || username || "User"
            )} flex items-center justify-center font-ios text-white tracking-wider`}
          >
            {getInitials(name || username || "User")}
          </div>
        )}
      </div>

      {showOnlineIndicator && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${
            indicatorSizes[size]
          } ring-2 ring-white dark:ring-[#161618] ${
            isMetaAI || isOnline ? "bg-[#34C759] shadow-xs" : "bg-[#8E8E93]"
          }`}
          title={isMetaAI || isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

