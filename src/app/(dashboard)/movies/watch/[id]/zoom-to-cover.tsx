"use client";
import { useEffect, useRef, useState } from "react";
import "./zoom-to-cover.css";

export type VideoFit = "contain" | "cover";

const dist = (a: Touch, b: Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

export function usePinchToCover(
  ref: React.RefObject<HTMLElement | null>,
  fit: VideoFit,
  setFit: (f: VideoFit) => void,
  enabled: boolean
) {
  const fitRef = useRef(fit);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => { fitRef.current = fit; }, [fit]);
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(null), 900);
    return () => clearTimeout(t);
  }, [hint]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let start = 0, pinching = false, done = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinching = true; done = false;
        start = dist(e.touches[0], e.touches[1]);
      } else pinching = false;
    };
    const onMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return;
      if (e.cancelable) e.preventDefault();
      if (done || !start) return;
      const r = dist(e.touches[0], e.touches[1]) / start;
      if (r >= 1.12 && fitRef.current !== "cover") {
        done = true; fitRef.current = "cover"; setFit("cover"); setHint("Zoomed to fill");
      } else if (r <= 0.88 && fitRef.current !== "contain") {
        done = true; fitRef.current = "contain"; setFit("contain"); setHint("Original");
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) { pinching = false; done = false; start = 0; }
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
  }, [ref, setFit, enabled]);

  return hint;
}


