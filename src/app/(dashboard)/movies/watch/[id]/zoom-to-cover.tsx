// zoom-to-cover.tsx — ONE owner for pinch-to-cover
// Pinch out = cover, Pinch in = contain, Double-tap = toggle
// No pan, no extra zoom levels, no scale.
import "./zoom-to-cover.css";
import { useCallback, useEffect, useRef, useState } from "react";

export function useZoomToCover(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [videoFit, setVideoFit] = useState<"contain" | "cover">("contain");
  const fitRef = useRef(videoFit);
  fitRef.current = videoFit;

  const toggleZoom = useCallback(() => {
    setVideoFit((v) => (v === "contain" ? "cover" : "contain"));
  }, []);

  // Keep CSS class in sync — CSS !important beats connect-player.css contain !important
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.classList.toggle("is-zoom-cover", videoFit === "cover");
  }, [videoFit, videoRef]);

  // Pinch only — 2 fingers on video, nothing else
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let pinching = false;
    let startDist = 0;
    const PINCH_THRESHOLD = 28; // px — must move this far to toggle, no accidental toggle

    const dist = (t1: React.Touch | Touch, t2: React.Touch | Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinching = true;
        startDist = dist(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return;
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

    video.addEventListener("touchstart", onTouchStart, { passive: true });
    video.addEventListener("touchmove", onTouchMove, { passive: true });
    video.addEventListener("touchend", onTouchEnd);
    video.addEventListener("touchcancel", onTouchEnd);
    return () => {
      video.removeEventListener("touchstart", onTouchStart);
      video.removeEventListener("touchmove", onTouchMove);
      video.removeEventListener("touchend", onTouchEnd);
      video.removeEventListener("touchcancel", onTouchEnd);
    };
   });


  return { videoFit, setVideoFit, toggleZoom };
}
