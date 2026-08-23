"use client";

import React from "react";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function AppLogo({ size = "md", showText = false, className = "" }: AppLogoProps) {
  const sizeClasses = {
    xs: "w-7 h-7",
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizes = {
    xs: "text-[14px]",
    sm: "text-[16px]",
    md: "text-[18px]",
    lg: "text-[22px]",
    xl: "text-[28px]",
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* 3D Green Paper-Plane Circular App Logo (Cropped to circular badge) */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0 relative bg-emerald-500/10`}
      >
        <img
          src="/app-logo-full.jpg"
          alt="ChatFlow Logo"
          className="w-full h-full object-cover scale-[1.78] -translate-y-[6.5%] select-none pointer-events-none"
        />
      </div>

      {showText && (
        <span
          className={`${textSizes[size]} font-bold tracking-tight text-black dark:text-white font-ios leading-none`}
        >
          Chats
        </span>
      )}
    </div>
  );
}
