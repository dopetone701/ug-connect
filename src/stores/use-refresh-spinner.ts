// src/app/hooks/use-refresh-spinner.ts / stores/use-refresh-spinner.ts
"use client";
import { useRef, useState, useEffect, useCallback } from "react";

type State = "idle" | "pulling" | "ready" | "refreshing";

export function useRefreshSpinner({ 
  onRefresh, 
  threshold = 78,
  resistance = 0.42,
  scrollEl
}: {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  scrollEl: HTMLElement | null;
}) {
  const [pull, setPull] = useState(0);
  const [state, setState] = useState<State>("idle");
  const startY = useRef(0);
  const isDragging = useRef(false);

  const canPull = useCallback(() => {
    if (!scrollEl) return false;
    return scrollEl.scrollTop <= 0;
  }, [scrollEl]);

  useEffect(() => {
    if (!scrollEl) return;
    
    const onStart = (e: TouchEvent) => {
      if (!canPull() || state === "refreshing") return;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!isDragging.current || !canPull()) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff <= 0) return;
      
      // Prevent native rubberband behind
      if (diff > 10) e.preventDefault();
      
      // Apply resistance - makes it INTENTIONAL
      const damped = Math.pow(diff, 0.85) * resistance;
      const clamped = Math.min(damped, 120);
      setPull(clamped);
      
      setState(clamped >= threshold ? "ready" : "pulling");
    };

    const onEnd = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      if (state === "ready") {
        setState("refreshing");
        try {
          // haptic for intentional feel
          if (navigator.vibrate) navigator.vibrate(20);
          await onRefresh();
        } finally {
          setPull(0);
          setState("idle");
        }
      } else {
        // snap back
        setPull(0);
        setState("idle");
      }
    };

    scrollEl.addEventListener("touchstart", onStart, { passive: true });
    scrollEl.addEventListener("touchmove", onMove, { passive: false });
    scrollEl.addEventListener("touchend", onEnd);

    return () => {
      scrollEl.removeEventListener("touchstart", onStart);
      scrollEl.removeEventListener("touchmove", onMove);
      scrollEl.removeEventListener("touchend", onEnd);
    };
  }, [scrollEl, canPull, state, threshold, resistance, onRefresh]);

  return { pull, state, progress: Math.min(pull / threshold, 1) };
}
