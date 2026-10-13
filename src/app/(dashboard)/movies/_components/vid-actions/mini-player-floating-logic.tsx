"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent, RefObject } from "react";

type Position = { x: number; y: number; width: number; height: number };
type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const EDGE = 12;
const Y_GAP = 0; // 0 = flush to bars, 6 = tiny gap
const MAX_WIDTH = 380;
const MIN_WIDTH_DESKTOP = 360;
const MIN_WIDTH_MOBILE = 170;
const DRAG_THRESHOLD = 4;
const ASPECT = 16 / 9;
const DEAD_ZONE = 0.32;

function getSize() {
  const vw = window.innerWidth;
  const isMobile = vw <= 768;
  const w = isMobile ? Math.min(MIN_WIDTH_MOBILE, vw * 0.46) : Math.min(MAX_WIDTH, isMobile ? 280 : MIN_WIDTH_DESKTOP);
  return { width: w, height: w / ASPECT };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

function getSafeBounds() {
  const topEl = document.querySelector(".top-bar") as HTMLElement | null;
  const bottomEl = document.querySelector(".bottom-bar-glass, .bottom-bar, nav.bottom-bar-glass") as HTMLElement | null;

  // CRITICAL: use bottom edge of top bar, not height - mobile is auto height ~94px
  const top = topEl ? topEl.getBoundingClientRect().bottom : 64;
  // CRITICAL: use top edge of bottom bar, not height
  const bottom = bottomEl ? window.innerHeight - bottomEl.getBoundingClientRect().top : 80;

  return {
    top: top + Y_GAP,
    bottom: bottom + Y_GAP,
  };
}

function clampToSafe(pos: Position): Position {
  const { top, bottom } = getSafeBounds();
  return {
    ...pos,
    x: clamp(pos.x, EDGE, window.innerWidth - pos.width - EDGE),
    y: clamp(pos.y, top, window.innerHeight - pos.height - bottom),
  };
}

function getCorner(corner: Corner, pos: Position): Position {
  const { top, bottom } = getSafeBounds();
  const maxX = window.innerWidth - pos.width - EDGE;
  const minY = top;
  const maxY = window.innerHeight - pos.height - bottom;
  return {
    ...pos,
    x: corner.includes("left") ? EDGE : maxX,
    y: corner.includes("top") ? minY : maxY,
  };
}

function getMagneticCorner(pos: Position, velocity: { x: number; y: number }): Position {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { top, bottom } = getSafeBounds();
  const safeHeight = vh - top - bottom;
  const safeCenterY = top + safeHeight / 2;

  const predX = cx + velocity.x * 180;
  const predY = cy + velocity.y * 180;

  const centerXRatio = predX / vw;
  const centerYRatio = (predY - top) / Math.max(safeHeight, 1);

  const inDeadX = centerXRatio > (0.5 - DEAD_ZONE / 2) && centerXRatio < (0.5 + DEAD_ZONE / 2);
  const inDeadY = centerYRatio > (0.5 - DEAD_ZONE / 2) && centerYRatio < (0.5 + DEAD_ZONE / 2);

  let h: "left" | "right";
  let v: "top" | "bottom";

  if (inDeadX && inDeadY) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      h = velocity.x > 0 ? "right" : "left";
      v = predY < safeCenterY ? "top" : "bottom";
    } else {
      v = velocity.y > 0 ? "bottom" : "top";
      h = predX < vw / 2 ? "left" : "right";
    }
    if (Math.abs(velocity.x) < 0.01 && Math.abs(velocity.y) < 0.01) {
      h = cx < vw / 2 ? "left" : "right";
      v = cy < safeCenterY ? "top" : "bottom";
    }
  } else {
    h = predX < vw / 2 ? "left" : "right";
    v = predY < safeCenterY ? "top" : "bottom";
  }

  return getCorner(`${v}-${h}` as Corner, pos);
}

export function useMiniPlayerFloating(elementRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const posRef = useRef<Position | null>(null);
  const draggingRef = useRef(false);
  const suppressRef = useRef(false);
  const velRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number; t: number }[]>([]);

  const update = useCallback((next: Position) => {
    posRef.current = next;
    setPosition(next);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
      posRef.current = null;
      setIsDragging(false);
      draggingRef.current = false;
      return;
    }
    const place = () => {
      const size = getSize();
      update(getCorner("bottom-right", { ...size, x: 0, y: 0 }));
    };
    place();
    const onResize = () => {
      if (draggingRef.current) return;
      const cur = posRef.current;
      if (!cur) return place();
      const size = getSize();
      const adjusted = clampToSafe({ ...size, x: cur.x, y: cur.y });
      update(getMagneticCorner(adjusted, { x: 0, y: 0 }));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [enabled, update]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || !e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [data-no-drag]")) return;

      let start = posRef.current;
      if (!start) {
        const r = e.currentTarget.getBoundingClientRect();
        start = { x: r.left, y: r.top, width: r.width, height: r.height };
        update(start);
      }

      const el = e.currentTarget;
      const pid = e.pointerId;
      const sx = e.clientX, sy = e.clientY;
      const origin = { ...start };
      let moved = false;
      lastPosRef.current = [{ x: sx, y: sy, t: performance.now() }];

      try { el.setPointerCapture(pid); } catch {}

      const onMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pid) return;
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        if (!moved) {
          moved = true;
          draggingRef.current = true;
          setIsDragging(true);
        }

        const now = performance.now();
        lastPosRef.current.push({ x: ev.clientX, y: ev.clientY, t: now });
        if (lastPosRef.current.length > 5) lastPosRef.current.shift();

        const first = lastPosRef.current[0];
        const last = lastPosRef.current[lastPosRef.current.length - 1];
        const dt = Math.max((last.t - first.t) / 1000, 0.016);
        velRef.current = {
          x: (last.x - first.x) / dt / 1000,
          y: (last.y - first.y) / dt / 1000,
        };

        ev.preventDefault();
        const { top, bottom } = getSafeBounds();
        update({
          ...origin,
          x: clamp(origin.x + dx, EDGE, window.innerWidth - origin.width - EDGE),
          y: clamp(origin.y + dy, top, window.innerHeight - origin.height - bottom),
        });
      };

      const onUp = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pid) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        try { if (el.hasPointerCapture(pid)) el.releasePointerCapture(pid); } catch {}

        if (moved) {
          const cur = posRef.current;
          if (cur) update(getMagneticCorner(cur, velRef.current));
          suppressRef.current = true;
          setTimeout(() => (suppressRef.current = false), 400);
        }
        draggingRef.current = false;
        setIsDragging(false);
        lastPosRef.current = [];
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
    },
    [enabled, update]
  );

  const onClickCapture = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!suppressRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressRef.current = false;
  }, []);

  const floatingStyle: CSSProperties = enabled && position
    ? ({
        ["--mini-x" as any]: `${position.x}px`,
        ["--mini-y" as any]: `${position.y}px`,
        left: position.x,
        top: position.y,
        position: "fixed",
        width: position.width,
        height: position.height,
        zIndex: 99999,
        margin: 0,
        borderRadius: 12,
        overflow: "hidden",
        background: "#000",
        boxShadow: isDragging ? "0 20px 60px rgba(0,0,0,0.7)" : "0 10px 30px rgba(0,0,0,0.5)",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        transition: isDragging ? "none" : "left 0.55s cubic-bezier(0.22, 1, 0.36, 1), top 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s ease",
        transform: isDragging ? "scale(0.96)" : "scale(1)",
        willChange: "left, top, transform",
      } as any)
    : {};

  return { floatingStyle, onPointerDown, onClickCapture, isDragging };
}

