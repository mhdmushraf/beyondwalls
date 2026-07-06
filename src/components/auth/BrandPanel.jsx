import React from "react";

const SCREEN_PANELS = [
  { top: "7%", left: "8%", w: 52, h: 30, glow: false },
  { top: "12%", left: "68%", w: 44, h: 26, glow: true },
  { top: "20%", left: "84%", w: 38, h: 22, glow: false },
  { top: "34%", left: "5%", w: 48, h: 28, glow: true },
  { top: "40%", left: "90%", w: 42, h: 24, glow: false },
  { top: "52%", left: "10%", w: 50, h: 30, glow: false },
  { top: "60%", left: "78%", w: 46, h: 26, glow: true },
  { top: "68%", left: "18%", w: 40, h: 24, glow: false },
  { top: "76%", left: "62%", w: 44, h: 26, glow: false },
  { top: "84%", left: "6%", w: 36, h: 22, glow: true },
  { top: "87%", left: "82%", w: 48, h: 28, glow: false },
  { top: "28%", left: "44%", w: 42, h: 24, glow: false },
];

export default function BrandPanel({ title, body }) {
  return (
    <div className="bw-brand-panel">
      <div className="bw-brand-grid" />
      <div className="bw-brand-glow" />
      {SCREEN_PANELS.map((p, i) => (
        <div
          key={i}
          className={`bw-screen-panel${p.glow ? " bw-screen-panel--glow" : ""}`}
          style={{
            top: p.top,
            left: p.left,
            width: `${p.w}px`,
            height: `${p.h}px`,
            animationDelay: p.glow ? `${(i % 4) * 1.5}s` : undefined,
          }}
        />
      ))}

      <div className="bw-brand-logo">
        <div className="bw-brand-logo-mark">
          <div className="bw-brand-logo-mark-inner" />
        </div>
        <span className="bw-brand-logo-text">Beyond Walls</span>
      </div>

      <div className="bw-brand-content">
        <h2>{title}</h2>
        {body && <p className="bw-brand-subtext">{body}</p>}
      </div>

      <div className="bw-brand-status">
        <span className="bw-brand-status-dot" />
        4,800+ screens · UAE-wide network
      </div>
    </div>
  );
}