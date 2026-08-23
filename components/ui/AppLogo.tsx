"use client";

import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function AppLogo({ size = "md", showText = false, className = "" }: AppLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    xs: "text-[15px]",
    sm: "text-[17px]",
    md: "text-[20px]",
    lg: "text-[24px]",
    xl: "text-[32px]",
  };

  const iconSizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Glossy WhatsApp Paper-Plane Badge */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-[0_4px_16px_rgba(0,168,132,0.35)] ring-2 ring-[#00A884]/40 bg-white dark:bg-[#1C1C1E] active:scale-95 transition-transform duration-200`}
      >
        {!imgFailed ? (
          <img
            src="/logo.png"
            alt="ChatFlow Logo"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover select-none pointer-events-none drop-shadow-xs"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-[#25D366] via-[#00A884] to-[#075E54]">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            <Send className={`${iconSizes[size]} text-white fill-white/30 -rotate-12 translate-x-0.5 -translate-y-0.5 drop-shadow-md`} />
          </div>
        )}
      </div>

      {showText && (
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight text-gray-900 dark:text-white font-ios leading-none`}
        >
          ChatFlow
        </span>
      )}
    </div>
  );
}
