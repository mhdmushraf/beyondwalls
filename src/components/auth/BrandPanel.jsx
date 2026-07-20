import React, { Suspense, lazy, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// 2.8 — lazy-load so three.js stays out of the initial bundle
const ScreenFieldCanvas = lazy(() => import("./ScreenFieldCanvas"));

const SITES = [
  "Al Nahda Mall",
  "Business Bay Tower",
  "JLT Cluster D",
  "Nesto Hypermarket",
  "Marina Walk",
];

// 3.2 — hand-placed CSS screen positions [left%, top%, width%]
const CSS_SCREENS = [
  [6, 10, 26], [54, 4, 20], [78, 26, 17], [14, 44, 22],
  [46, 38, 15], [70, 62, 24], [10, 74, 18], [42, 80, 20],
];

const CYCLE_LEN = 16; // seconds 15 down to 0

export default function BrandPanel({ title, titleAccent, body }) {
  const reduceMotion = useReducedMotion();
  const [webglActive, setWebglActive] = useState(false);

  // 4.4 — HUD state driven by a 1-second interval
  const [tick, setTick] = useState(0);
  const [sweepTrigger, setSweepTrigger] = useState(0);
  const prevSlotCycle = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const slotCycle = Math.floor(tick / CYCLE_LEN);
  const inCycle = tick % CYCLE_LEN;
  const seconds = 15 - inCycle;
  const slot = (slotCycle % 7) + 1;
  const siteIndex = Math.floor(slotCycle / 7) % SITES.length;

  // Trigger column sweep on slot rollover
  useEffect(() => {
    if (slotCycle !== prevSlotCycle.current && slotCycle > 0) {
      prevSlotCycle.current = slotCycle;
      setSweepTrigger((s) => s + 1);
    }
  }, [slotCycle]);

  const dur = reduceMotion ? 0 : 0.5;
  const progressWidth = Math.max(0, (seconds / 15) * 50);

  return (
    <div className={`bw-brand-panel${webglActive ? " bw-webgl-active" : ""}`}>
      {/* 3 — CSS screen field (mobile, reduced-motion, and WebGL-failure fallback) */}
      <div className="bw-css-field" aria-hidden="true">
        {CSS_SCREENS.map(([left, top, width], i) => {
          const rot = (i % 2 === 0 ? 1 : -1) * (2 + (i % 5));
          return (
            <div
              key={i}
              className="bw-css-screen"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${width * 0.39375}%`,
                transform: `rotate(${rot}deg)`,
                animationDelay: `${(-0.85 * i).toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>

      {/* WebGL canvas (>= 1024px only) */}
      <Suspense fallback={null}>
        <ScreenFieldCanvas sweepTrigger={sweepTrigger} onActive={setWebglActive} />
      </Suspense>

      {/* 4.2 — Vignette */}
      <div className="bw-brand-vignette" />

      {/* 4.3 — Logo lockup (top) */}
      <div className="bw-brand-logo">
        <div className="bw-brand-logo-mark">
          <div className="bw-brand-logo-mark-inner" />
        </div>
        <span className="bw-brand-logo-text">Beyond Walls</span>
      </div>

      {/* 4.3 + 4.5 + 4.6 — Pitch (middle) */}
      <motion.div
        className="bw-brand-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, delay: reduceMotion ? 0 : 0.08 }}
      >
        <div className="bw-brand-eyebrow">
          <span className="bw-brand-eyebrow-dot" />
          Network live
        </div>
        <h2 className="bw-brand-headline">
          {title}
          {titleAccent && (
            <>
              {" "}
              <span className="bw-brand-headline-accent">{titleAccent}</span>
            </>
          )}
        </h2>
        {body && <p className="bw-brand-body">{body}</p>}
      </motion.div>

      {/* 4.4 — HUD (bottom) */}
      <div className="bw-brand-hud">
        <div className="bw-hud-cell">
          <span className="bw-hud-label">SITE</span>
          <span className="bw-hud-value">{SITES[siteIndex]}</span>
        </div>
        <div className="bw-hud-rule" />
        <div className="bw-hud-cell">
          <span className="bw-hud-label">SLOT</span>
          <span className="bw-hud-value">{slot} / 7</span>
        </div>
        <div className="bw-hud-rule" />
        <div className="bw-hud-cell">
          <span className="bw-hud-label">LEFT</span>
          <span className="bw-hud-value">
            00:{String(seconds).padStart(2, "0")}
          </span>
          <div className="bw-hud-progress">
            <div
              className="bw-hud-progress-bar"
              style={{ width: `${progressWidth}px` }}
            />
          </div>
        </div>
        <div className="bw-hud-rule" />
        <div className="bw-hud-cell">
          <span className="bw-hud-label">SCREENS</span>
          <span className="bw-hud-value">64 online</span>
        </div>
      </div>
    </div>
  );
}