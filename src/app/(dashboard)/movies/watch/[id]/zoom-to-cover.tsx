// zoom-to-cover.tsx — ONE owner for pinch-to-cover
// LANDSCAPE ONLY — pinch out = cover, pinch in = contain, double-tap = toggle
// Portrait = always contain. Turn to portrait = auto exit cover.
// No pan, no extra zoom levels, no scale.
import "./zoom-to-cover.css";
import { useCallback, useEffect, useRef, useState } from "react";

export function useZoomToCover(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [videoFit, setVideoFit] = useState<"contain" | "cover">("contain");
  const fitRef = useRef(videoFit);
  fitRef.current = videoFit;

  const isLandscape = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth > window.innerHeight;
  };

  const toggleZoom = useCallback(() => {
    // Portrait: never go to cover, always back to normal
    if (!isLandscape()) {
      setVideoFit("contain");
      return;
    }
    setVideoFit((v) => (v === "contain" ? "cover" : "contain"));
  }, []);

  // Keep CSS class in sync — CSS !important beats connect-player.css contain !important
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.classList.toggle("is-zoom-cover", videoFit === "cover");
  }, [videoFit, videoRef]);

  // AUTO EXIT: turn to portrait -> back to contain
  useEffect(() => {
    const onResize = () => {
      if (!isLandscape() && fitRef.current === "cover") {
        setVideoFit("contain");
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // Pinch only — 2 fingers on .center-cover, landscape only
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const target: HTMLElement | null = video.parentElement;
    if (!target) return;

    let pinching = false;
    let startDist = 0;
    const PINCH_THRESHOLD = 28; // px — must move this far to toggle, no accidental toggle

    const dist = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e: TouchEvent) => {
      // Portrait: pinch does nothing
      if (!isLandscape()) return;
      if (e.touches.length !== 2) return;
      // Don't start pinch on controls — play / seek / fullscreen / cast
      const el = e.target as HTMLElement | null;
      if (el && el.closest("button, .cc-icon, .starz-progress, .quality-settings, [data-control]")) return;
      pinching = true;
      startDist = dist(e.touches[0], e.touches[1]);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return;
      // If user rotated mid-pinch, bail and exit cover
      if (!isLandscape()) {
        pinching = false;
        if (fitRef.current === "cover") setVideoFit("contain");
        return;
      }
      const cur = dist(e.touches[0], e.touches[1]);
      const delta = cur - startDist;
      // Pinch OUT -> cover, Pinch IN -> contain, back to normal
      if (delta > PINCH_THRESHOLD && fitRef.current === "contain") {
        setVideoFit("cover");
        startDist = cur; // reset so you can pinch back in same gesture
      } else if (delta < -PINCH_THRESHOLD && fitRef.current === "cover") {
        setVideoFit("contain");
        startDist = cur;
      }
      // Don't preventDefault — single-finger scroll / drawer drag still works
      // We only read the 2-finger distance.
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinching = false;
    };

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: true });
    target.addEventListener("touchend", onTouchEnd);
    target.addEventListener("touchcancel", onTouchEnd);
    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
      target.removeEventListener("touchcancel", onTouchEnd);
    };
    // No dep array on purpose — <video> has key={`${movie.id}-${quality}-${activeEp?.id}`}
    // so React replaces the video element on episode/quality change.
    // Re-running every render re-attaches to the new video / new .center-cover.
  });

  return { videoFit, setVideoFit, toggleZoom };
}
