import React, { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "framer-motion";

// 2.7 — lazy-load so three.js is not in the initial bundle
const ScreenFieldCanvas = lazy(() => import("./ScreenFieldCanvas"));

const TRUST_MARKERS = ["Dubai-based", "Pay only for what runs", "No hardware required"];

export default function BrandPanel({ title, body }) {
  const reduceMotion = useReducedMotion();
  const dur = reduceMotion ? 0 : 0.5;

  return (
    <div className="bw-brand-panel">
      {/* 3.3 — static fallback (visible when WebGL is not active) */}
      <div className="bw-brand-static-fallback" />

      {/* WebGL canvas — covers fallback when active */}
      <Suspense fallback={null}>
        <ScreenFieldCanvas />
      </Suspense>

      {/* 3.2 — scrim for text legibility */}
      <div className="bw-brand-scrim" />

      {/* Content */}
      <div className="bw-brand-logo">
        <div className="bw-brand-logo-mark">
          <div className="bw-brand-logo-mark-inner" />
        </div>
        <span className="bw-brand-logo-text">Beyond Walls</span>
      </div>

      <div className="bw-brand-content">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: reduceMotion ? 0 : 0.08 }}
        >
          {title}
        </motion.h2>
        {body && (
          <motion.p
            className="bw-brand-subtext"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.16 }}
          >
            {body}
          </motion.p>
        )}
        {/* 3.5 — trust markers */}
        <motion.div
          className="bw-brand-trust"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: reduceMotion ? 0 : 0.24 }}
        >
          {TRUST_MARKERS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </motion.div>
      </div>

      <div className="bw-brand-status">
        <span className="bw-brand-status-dot" />
        4,800+ screens · UAE-wide network
      </div>
    </div>
  );
}