"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Plus,
  Trash2,
  RotateCw,
  Sparkles,
  Check,
  Loader2,
  Film,
  Image as ImageIcon,
  Smile,
  Sliders,
  Eye,
} from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";

export interface MediaDraftItem {
  id: string;
  file: File;
  previewUrl: string;
  type: "IMAGE" | "VIDEO";
  caption: string;
  filter: "none" | "vivid" | "warm" | "cool" | "bw" | "vintage";
  rotation: number;
}

interface MediaStudioModalProps {
  isOpen: boolean;
  initialFiles: File[];
  onClose: () => void;
  onSend: (data: {
    items: Array<{
      file: File;
      caption: string;
      filter: string;
      rotation: number;
      isViewOnce: boolean;
      quality: "HD" | "NORMAL";
    }>;
    sharedCaption: string;
    isViewOnce: boolean;
    isHD: boolean;
  }) => Promise<void>;
}

const FILTERS = [
  { id: "none", name: "Original", style: "" },
  { id: "vivid", name: "Vivid", style: "contrast(1.2) saturate(1.35) brightness(1.05)" },
  { id: "warm", name: "Warm", style: "sepia(0.35) saturate(1.2) hue-rotate(-15deg)" },
  { id: "cool", name: "Cool", style: "saturate(0.9) hue-rotate(25deg) brightness(1.05)" },
  { id: "bw", name: "B&W", style: "grayscale(1) contrast(1.2)" },
  { id: "vintage", name: "Vintage", style: "sepia(0.6) contrast(1.1) brightness(0.95)" },
];

export function MediaStudioModal({
  isOpen,
  initialFiles,
  onClose,
  onSend,
}: MediaStudioModalProps) {
  const [items, setItems] = useState<MediaDraftItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHD, setIsHD] = useState(true);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [sharedCaption, setSharedCaption] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMoreInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize draft items from initialFiles
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const draftList: MediaDraftItem[] = initialFiles.map((file, idx) => ({
        id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        caption: "",
        filter: "none",
        rotation: 0,
      }));
      setItems(draftList);
      setActiveIndex(0);
      setSharedCaption("");
      setIsViewOnce(false);
    }
  }, [initialFiles]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[activeIndex] || items[0];

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDrafts: MediaDraftItem[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}_more_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      caption: "",
      filter: "none",
      rotation: 0,
    }));

    setItems((prev) => [...prev, ...newDrafts]);
    if (e.target) e.target.value = "";
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (items.length <= 1) {
      onClose();
      return;
    }
    const updated = items.filter((_, idx) => idx !== indexToRemove);
    setItems(updated);
    if (activeIndex >= updated.length) {
      setActiveIndex(updated.length - 1);
    }
  };

  const handleRotate = () => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === activeIndex ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );
  };

  const handleSetFilter = (filterId: "none" | "vivid" | "warm" | "cool" | "bw" | "vintage") => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === activeIndex ? { ...item, filter: filterId } : item))
    );
  };

  const handleSendAll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSend({
        items: items.map((item) => ({
          file: item.file,
          caption: item.caption,
          filter: item.filter,
          rotation: item.rotation,
          isViewOnce,
          quality: isHD ? "HD" : "NORMAL",
        })),
        sharedCaption: sharedCaption.trim(),
        isViewOnce,
        isHD,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFilterStyle =
    FILTERS.find((f) => f.id === currentItem?.filter)?.style || "";

  return (
    <div className="fixed inset-0 z-50 bg-[#0B141A] flex flex-col justify-between text-white select-none animate-fade-in">
      {/* Hidden file input for adding more media */}
      <input
        type="file"
        ref={addMoreInputRef}
        multiple
        accept="image/*,video/*"
        onChange={handleAddMoreFiles}
        className="hidden"
      />

      {/* Top Action Header Bar */}
      <header className="h-[60px] px-4 sm:px-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
        {/* Left: Close / Cancel */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          title="Cancel"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Center: HD Quality & Quick Action Badges */}
        <div className="flex items-center gap-2">
          {/* HD Quality Toggle */}
          <button
            type="button"
            onClick={() => setIsHD(!isHD)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              isHD
                ? "bg-[#00A884] text-white shadow-[0_0_12px_rgba(0,168,132,0.6)] scale-105"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title="HD Media Quality"
          >
            <span>HD</span>
            {isHD && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Image Filter Toggle (Images only) */}
          {currentItem?.type === "IMAGE" && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                showFilters || currentItem.filter !== "none"
                  ? "bg-[#00A884] text-white shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white/90"
              }`}
              title="Filters & Effects"
            >
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

          {/* Rotate Tool (Images only) */}
          {currentItem?.type === "IMAGE" && (
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 active:scale-95 transition-all cursor-pointer"
              title="Rotate Image"
            >
              <RotateCw className="w-4 h-4 stroke-[2]" />
            </button>
          )}

          {/* Delete Current Item */}
          <button
            type="button"
            onClick={() => handleRemoveItem(activeIndex)}
            className="p-2 rounded-full bg-white/10 hover:bg-[#FF3B30]/30 hover:text-[#FF3B30] text-white/80 active:scale-95 transition-all cursor-pointer"
            title="Delete this photo/video"
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Right: Item Counter */}
        <div className="px-3 py-1 rounded-full bg-white/10 text-[13px] font-semibold text-white/90 font-ios">
          {activeIndex + 1} of {items.length}
        </div>
      </header>

      {/* Filter Presets Shelf (Slide down when filter icon clicked) */}
      {showFilters && currentItem?.type === "IMAGE" && (
        <div className="px-4 py-2 bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto z-30 animate-pop-in">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSetFilter(f.id as any)}
              className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentItem.filter === f.id
                  ? "bg-[#00A884] text-white shadow-xs scale-105"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Center Media Canvas / Preview */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative overflow-hidden">
        {currentItem?.type === "IMAGE" ? (
          <img
            src={currentItem.previewUrl}
            alt="Preview"
            style={{
              filter: currentFilterStyle,
              transform: `rotate(${currentItem.rotation}deg)`,
            }}
            className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none"
          />
        ) : (
          <div className="max-h-[60vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black">
            <video
              src={currentItem.previewUrl}
              controls
              playsInline
              className="max-h-[60vh] max-w-full object-contain rounded-2xl"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Area (Thumbnails Strip + Caption + Send) */}
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-3 sm:p-4 space-y-3 z-30">
        {/* Thumbnails Carousel (If multiple media items or to add more) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {items.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`w-12 h-12 rounded-[12px] overflow-hidden flex-shrink-0 cursor-pointer relative transition-all ${
                activeIndex === idx
                  ? "ring-2 ring-[#00A884] scale-110 shadow-lg"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "IMAGE" ? (
                <img
                  src={item.previewUrl}
                  alt="Thumb"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1C272E] flex items-center justify-center">
                  <Film className="w-5 h-5 text-[#00A884]" />
                </div>
              )}
            </div>
          ))}

          {/* Add More Media Button */}
          <button
            type="button"
            onClick={() => addMoreInputRef.current?.click()}
            className="w-12 h-12 rounded-[12px] border-2 border-dashed border-white/30 hover:border-[#00A884] text-white/60 hover:text-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
            title="Add more photos or videos"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Caption Input & View Once & Send Action Row */}
        <div className="max-w-2xl mx-auto flex items-center gap-2 relative">
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-50 animate-pop-in">
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="relative z-50">
                <EmojiPicker
                  onSelectEmoji={(emoji) => {
                    setSharedCaption((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            </div>
          )}

          {/* Caption Input Container */}
          <div className="flex-1 flex items-center bg-[#1F2C34] rounded-[24px] px-3.5 py-1.5 border border-white/10 shadow-inner">
            {/* Emoji Trigger */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-white/60 hover:text-[#00A884] rounded-full transition-colors flex-shrink-0 cursor-pointer"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={sharedCaption}
              onChange={(e) => setSharedCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 bg-transparent border-none text-[15px] text-white placeholder-white/50 focus:outline-none focus:ring-0 px-2 py-1 font-ios"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAll();
                }
              }}
            />

            {/* View Once "(1)" Toggle */}
            <button
              type="button"
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all flex-shrink-0 cursor-pointer ${
                isViewOnce
                  ? "bg-[#00A884] text-white ring-2 ring-[#00A884]/40 scale-105 shadow-[0_0_10px_rgba(0,168,132,0.6)]"
                  : "border border-dashed border-white/40 text-white/60 hover:text-[#00A884] hover:border-[#00A884]"
              }`}
              title={isViewOnce ? "View Once Enabled (1)" : "Send as View Once (Photo/Video)"}
            >
              1
            </button>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendAll}
            disabled={isSubmitting}
            className="w-12 h-12 rounded-full bg-[#00A884] hover:bg-[#009272] active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,168,132,0.45)] transition-all flex-shrink-0 cursor-pointer"
            title={`Send ${items.length} item${items.length > 1 ? "s" : ""}`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-5 h-5 ml-0.5 stroke-[2.2]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
