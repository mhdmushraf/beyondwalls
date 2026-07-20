import React from "react";
import { MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", text: "text-lg" },
  md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-xl" },
  lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6", text: "text-2xl" },
};

/**
 * BeyondWalls brand lockup — gradient icon + wordmark.
 * Used across the nav, footer, sidebar, auth pages, and mobile header.
 *
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} onDark  — true when rendered on a dark background (footer, auth panels)
 * @param {boolean} showText
 */
export default function BrandLogo({
  size = "md",
  onDark = false,
  showText = true,
  className,
}) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          s.box,
          "bg-gradient-to-br from-[#6F3FFD] to-[#5A2DED] flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0"
        )}
      >
        <MonitorPlay className={cn(s.icon, "text-white")} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold font-heading tracking-tight select-none",
            s.text,
            onDark ? "text-white" : "text-[#5A2DED]"
          )}
        >
          BeyondWalls
        </span>
      )}
    </div>
  );
}