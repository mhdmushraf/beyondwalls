import React from "react";
import { MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", text: "text-lg" },
  md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-xl" },
  lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6", text: "text-2xl" },
};

/**
 * Beyond Walls brand lockup — solid navy (#141E3E) icon + wordmark.
 * Brand standard: always write the name as "Beyond Walls" (two words, capital B and W).
 * Lowercase "beyondwalls" only in URLs, emails and handles.
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
          onDark ? "bg-white shadow-lg shadow-black/20" : "bg-[#141E3E] shadow-lg shadow-[#141E3E]/25",
          "flex items-center justify-center flex-shrink-0"
        )}
      >
        <MonitorPlay className={cn(s.icon, onDark ? "text-[#141E3E]" : "text-white")} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold font-heading tracking-tight whitespace-nowrap select-none",
            s.text,
            onDark ? "text-white" : "text-[#141E3E]"
          )}
        >
          Beyond Walls
        </span>
      )}
    </div>
  );
}