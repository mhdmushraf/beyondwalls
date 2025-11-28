import React, { useState, useEffect } from "react";
import { MonitorPlay, Play, Pause } from "lucide-react";

export default function LiveScreenPreview({ 
  slots = [], 
  size = "small",
  autoPlay = true 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Filter valid slots with content
  const activeSlots = slots.filter(s => s.url);

  useEffect(() => {
    if (!isPlaying || activeSlots.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlots.length);
    }, 5000); // 5 seconds per slot

    return () => clearInterval(interval);
  }, [isPlaying, activeSlots.length]);

  if (activeSlots.length === 0) {
    return (
      <div className={`bg-slate-900 rounded-lg flex items-center justify-center ${
        size === "small" ? "h-32" : "h-48"
      }`}>
        <div className="text-center text-slate-500">
          <MonitorPlay className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No active ads</p>
        </div>
      </div>
    );
  }

  const currentSlot = activeSlots[currentIndex];

  return (
    <div className="relative group">
      <div className={`bg-slate-900 rounded-lg overflow-hidden ${
        size === "small" ? "h-32" : "h-48"
      }`}>
        {currentSlot.type === "video" ? (
          <video
            key={currentSlot.url}
            src={currentSlot.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            key={currentSlot.url}
            src={currentSlot.url}
            alt={currentSlot.name || "Ad"}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay with slot info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <p className="text-white text-xs truncate flex-1">
              {currentSlot.name || `Slot ${currentIndex + 1}`}
            </p>
            <div className="flex items-center gap-1">
              {activeSlots.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Play/Pause on hover */}
        {activeSlots.length > 1 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-white" />
            ) : (
              <Play className="w-3 h-3 text-white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}