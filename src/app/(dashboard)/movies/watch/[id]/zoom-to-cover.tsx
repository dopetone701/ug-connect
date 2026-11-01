"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./zoom-to-cover.css";

export type VideoFit = "contain" | "cover";

type Props = {
  /** current fit, owned by the parent (videoFit in watch-client) */
  fit: VideoFit;
  /** called when a pinch switches the fit */
  onFitChange: (fit: VideoFit) => void;
  /** turn the gesture off (desktop, mini player, fullscreen shell, etc.) */
  enabled?: boolean;
  /** pinch-out ratio needed to switch to cover */
  zoomInThreshold?: number;
  /** pinch-in ratio needed to reset to contain */
  zoomOutThreshold?: number;
  children: ReactNode;
};

const distance = (a: Touch, b: Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

/**
 * Pinch-to-cover.
 *  - Pinch OUT  -> "cover"   (fills the frame, no further zoom possible)
 *  - Pinch IN   -> "contain" (back to normal)
 * There is no free zoom: only these two states exist.
 */
export default function ZoomToCover({
  fit,
  onFitChange,
  enabled = true,
  zoomInThreshold = 1.12,
  zoomOutThreshold = 0.88,
  children,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<VideoFit>(fit);
  const startDistRef = useRef(0);
  const pinchingRef = useRef(false);
  const handledRef = useRef(false); // one switch per pinch
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    fitRef.current = fit;
  }, [fit]);

  const showHint = useCallback((text: string) => {
    setHint(text);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHint(null), 900);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !enabled) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchingRef.current = true;
        handledRef.current = false;
        startDistRef.current = distance(e.touches[0], e.touches[1]);
      } else {
        pinchingRef.current = false;
      }
    };

    const onMove = (e: TouchEvent) => {
      if (!pinchingRef.current || e.touches.length !== 2) return;
      // block the browser's own page pinch while we handle it
      if (e.cancelable) e.preventDefault();
      if (handledRef.current || !startDistRef.current) return;

      const ratio = distance(e.touches[0], e.touches[1]) / startDistRef.current;

      if (ratio >= zoomInThreshold && fitRef.current !== "cover") {
        handledRef.current = true;
        fitRef.current = "cover";
        onFitChange("cover");
        showHint("Zoomed to fill");
      } else if (ratio <= zoomOutThreshold && fitRef.current !== "contain") {
        handledRef.current = true;
        fitRef.current = "contain";
        onFitChange("contain");
        showHint("Original");
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchingRef.current = false;
        handledRef.current = false;
        startDistRef.current = 0;
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled, onFitChange, showHint, zoomInThreshold, zoomOutThreshold]);

  return (
    <div
      ref={wrapRef}
      className={`zoom-to-cover ${enabled ? "is-enabled" : ""} ${fit === "cover" ? "is-cover" : "is-contain"}`}
    >
      {children}
      {hint && (
        <div className="zoom-to-cover-hint" role="status" aria-live="polite">
          {hint}
        </div>
      )}
    </div>
  );
}

