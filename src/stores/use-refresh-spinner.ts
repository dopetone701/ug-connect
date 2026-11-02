"use client";
import { useEffect, useState, useRef } from "react";

export function useRefreshSpinner({ scrollEl, contentEl, onRefresh }: any) {
  const DEAD_ZONE = 28;
  const TRIGGER = 105;
  const MAX_PULL = 80;

  const [pull, setPull] = useState(0);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle"|"pulling"|"ready"|"refreshing">("idle");

  const startY = useRef(0);
  const dragging = useRef(false);
  const crossed = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!scrollEl || !contentEl) return;

    const isAtTop = () => scrollEl.scrollTop <= 1;

    const onStart = (e: TouchEvent) => {
      if (state === "refreshing") return;
      if (!isAtTop()) return;
      startY.current = e.touches[0].clientY;
      dragging.current = false;
      crossed.current = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!isAtTop()) {
        dragging.current = false;
        return;
      }

      const raw = e.touches[0].clientY - startY.current;
      if (raw <= 0) {
        if (pull > 0) {
          cancelAnimationFrame(raf.current);
          contentEl.style.transform = `translateY(0px)`;
          setPull(0);
          setProgress(0);
          setState("idle");
        }
        return;
      }

      if (raw < DEAD_ZONE) return; // intentional dead zone

      if (!dragging.current) dragging.current = true;

      if (raw > DEAD_ZONE + 5) e.preventDefault(); // block only after intentional

      const intentional = raw - DEAD_ZONE;
      const damped = Math.pow(intentional, 0.84) * 0.42;
      const clamped = Math.min(damped, MAX_PULL);
      const prog = Math.min(Math.max(0, raw - 40) / (TRIGGER - 40), 1);

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        contentEl.style.transform = `translateY(${clamped}px)`;
      });

      setPull(clamped);
      setProgress(prog);

      if (clamped >= 50) {
        if (!crossed.current) navigator.vibrate?.(12);
        crossed.current = true;
        setState("ready");
      } else {
        setState("pulling");
      }
    };

    const onEnd = async () => {
      if (!dragging.current) return;
      dragging.current = false;

      if (crossed.current && pull >= 48) {
        setState("refreshing");
        setPull(55);
        setProgress(1);
        contentEl.style.transform = `translateY(55px)`;
        await new Promise(r => setTimeout(r, 700));
        await onRefresh();
        contentEl.style.transition = "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
        contentEl.style.transform = `translateY(0px)`;
        setTimeout(() => {
          contentEl.style.transition = "";
          setPull(0);
          setProgress(0);
          setState("idle");
        }, 350);
      } else {
        contentEl.style.transition = "transform 0.26s ease";
        contentEl.style.transform = `translateY(0px)`;
        setTimeout(() => {
          contentEl.style.transition = "";
          setPull(0);
          setProgress(0);
          setState("idle");
        }, 260);
      }
      crossed.current = false;
    };

    scrollEl.addEventListener("touchstart", onStart, { passive: true });
    scrollEl.addEventListener("touchmove", onMove, { passive: false });
    scrollEl.addEventListener("touchend", onEnd);

    return () => {
      cancelAnimationFrame(raf.current);
      scrollEl.removeEventListener("touchstart", onStart as any);
      scrollEl.removeEventListener("touchmove", onMove as any);
      scrollEl.removeEventListener("touchend", onEnd as any);
    };
  }, [scrollEl, contentEl, state, pull, onRefresh]);

  return { pull, progress, state };
}
