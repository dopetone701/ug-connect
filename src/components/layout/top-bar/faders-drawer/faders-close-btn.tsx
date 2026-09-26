"use client";
import { useEffect, useRef } from "react";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";

export default function FadersCloseBtn() {
  const { isOpen, close } = useFadersDrawer() as any;
  const startY = useRef<number | null>(null);

  // 1. CONTROL EXISTING > BUTTON IN TOP-BAR
  useEffect(() => {
    const apply = () => {
      const backBtn = document.querySelector(".wa-v") as HTMLElement | null;
      const svg = backBtn?.querySelector("svg") as HTMLElement | null;
      if (!svg) return;

      svg.style.transition = "transform 0.3s cubic-bezier(0.16,1,0.3,1)";
      svg.style.transform = isOpen? "rotate(90deg)" : "rotate(0deg)";
    };

    apply();
    // re-apply when top-bar re-renders (waOpen toggles)
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isOpen]);

  // 2. INTERCEPT CLICK ON EXISTING > - if faders open, close faders not wa panel
  useEffect(() => {
    const backBtn = document.querySelector(".wa-v");
    if (!backBtn) return;

    const onClick = (e: Event) => {
      if (isOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    };

    backBtn.addEventListener("click", onClick, true);
    return () => backBtn.removeEventListener("click", onClick, true);
  }, [isOpen, close]);

  // 3. SWIPE DOWN LISTENER - attached to faders drawer handle/sheet
  useEffect(() => {
    const sheet = document.querySelector(".faders-sheet") as HTMLElement;
    const handle = document.querySelector(".faders-handle") as HTMLElement;
    const target = handle || sheet;
    if (!target ||!sheet) return;

    const backdrop = document.querySelector(".faders-backdrop") as HTMLElement;

    const onStart = (e: TouchEvent) => {
      if (!isOpen) return;
      startY.current = e.touches[0].clientY;
      sheet.style.transition = "none";
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
        if (backdrop) backdrop.style.opacity = `${1 - diff / 400}`;
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (startY.current === null) return;
      const diff = e.changedTouches[0].clientY - startY.current;
      sheet.style.transition = "transform 0.32s cubic-bezier(0.16,1,0.3,1)";
      if (backdrop) {
        (backdrop as HTMLElement).style.transition = "opacity 0.25s ease";
      }

      if (diff > 90) {
        sheet.style.transform = "translateY(100%)";
        if (backdrop) (backdrop as HTMLElement).style.opacity = "0";
        setTimeout(() => close(), 120);
      } else {
        sheet.style.transform = "translateY(0)";
        if (backdrop) (backdrop as HTMLElement).style.opacity = "1";
      }
      startY.current = null;
    };

    target.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      target.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isOpen, close]);

  return null; // <--- NO UI, NO SVG, only logic manipulating top-bar
}
