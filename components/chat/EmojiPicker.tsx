"use client";

import React, { useState } from "react";
import { Smile, Sparkles, Heart, ThumbsUp, Laugh, Frown } from "lucide-react";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: "Quick Reactions",
    emojis: ["❤️", "👍", "🔥", "😂", "😮", "😢", "🎉", "👏", "🙏", "💯", "🚀", "✨"],
  },
  {
    name: "Smileys & Emotion",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
      "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    ],
  },
  {
    name: "Gestures & People",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎",
      "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
    ],
  },
  {
    name: "Objects & Symbols",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "⭐",
      "🌟", "✨", "⚡", "💥", "🔥", "🌈", "☀️", "🌙", "💡", "🎯",
      "🏆", "🎉", "🎊", "🎁", "🚀", "💻", "📱", "🔒", "🔑", "📌",
    ],
  },
];

export function EmojiPicker({ onSelectEmoji, onClose }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-3 animate-fade-in z-50">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeTab === idx
                ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {cat.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-1 max-h-48 overflow-y-auto p-1">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
              if (onClose) onClose();
            }}
            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
