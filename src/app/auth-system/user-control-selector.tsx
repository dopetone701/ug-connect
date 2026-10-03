"use client";
import { useEffect, useRef, useState } from "react";
import "./user-control-selector.css";
import { SHEET_REGISTRY, BASE_SHEET_ORDER, type SheetId } from "./account-sheets";

type Props = { active: SheetId; onChange: (id: SheetId) => void };

const getIsGuestSync = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const token = localStorage.getItem("ug_token");
    const guestFlag = localStorage.getItem("ug_guest") === "1";
    const raw = localStorage.getItem("ug_user");
    if (!token || guestFlag) return true;
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.isGuest) return true;
    }
  } catch {}
  return false;
};

export default function UserControlSelector({ active, onChange }: Props) {
  const [isGuest] = useState(() => getIsGuestSync());
  const visibleOrder: SheetId[] = isGuest
    ? BASE_SHEET_ORDER.filter((id) => id !== "edit")
    : BASE_SHEET_ORDER;

  // if parent says active=edit but guest, immediately switch to subscriptions
  useEffect(() => {
    if (isGuest && active === "edit") {
      onChange("subscriptions");
    }
  }, [isGuest, active, onChange]);

  const effectiveActive = isGuest && active === "edit" ? "subscriptions" : active;

  const [displayIndex, setDisplayIndex] = useState(() => {
    const i = visibleOrder.indexOf(effectiveActive as SheetId);
    return i >= 0 ? i : 0;
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragging = useRef(false);
  const ignoreSwipe = useRef(false);

  useEffect(() => {
    const nextIndex = visibleOrder.indexOf(effectiveActive as SheetId);
    if (nextIndex >= 0) setDisplayIndex(nextIndex);
  }, [effectiveActive, visibleOrder]);

  const safeIndex = (() => {
    const i = visibleOrder.indexOf(effectiveActive as SheetId);
    return i >= 0 ? i : displayIndex;
  })();

  const activeId = visibleOrder[safeIndex];
  const activeLabel = SHEET_REGISTRY[activeId]?.label || activeId;

  const isInsideMovieScroller = (t: HTMLElement | null) =>
    !!t?.closest(".latest-track,.latest-card,.latest-track-wrap,.vault-track,.vault-row,.l-card-cover");

  const changeToIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= visibleOrder.length) return;
    const nextId = visibleOrder[nextIndex];
    if (isGuest && nextId === "edit") {
      window.dispatchEvent(new CustomEvent("ug-open-signin"));
      return;
    }
    setDisplayIndex(nextIndex);
    onChange(nextId);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (isInsideMovieScroller(target)) {
      ignoreSwipe.current = true;
      dragging.current = false;
      return;
    }
    ignoreSwipe.current = false;
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (ignoreSwipe.current || !dragging.current) {
      dragging.current = false;
      ignoreSwipe.current = false;
      return;
    }
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && safeIndex < visibleOrder.length - 1) changeToIndex(safeIndex + 1);
      else if (diff > 0 && safeIndex > 0) changeToIndex(safeIndex - 1);
    }
    dragging.current = false;
    ignoreSwipe.current = false;
  };

  if (!activeId) return null;
  if (isGuest && visibleOrder.length === 0) return null;

  return (
    <div className="selector-root" onTouchStart={onTouchStart} onTouchMove={() => {}} onTouchEnd={onTouchEnd}>
      <div className="selector-header">
        <h3 className="selector-title">{activeLabel}</h3>
        <span className="selector-count">{safeIndex + 1} / {visibleOrder.length}</span>
      </div>
      <div className="selector-viewport">
        <div ref={trackRef} className="selector-track" style={{ transform: `translateX(-${safeIndex * 100}%)` }}>
          {visibleOrder.map((id) => {
            const Comp = SHEET_REGISTRY[id].component;
            return (
              <div key={id} className="selector-slide">
                <Comp />
              </div>
            );
          })}
        </div>
      </div>
      <div className="selector-dots">
        {visibleOrder.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`dot ${index === safeIndex ? "active" : ""}`}
            onClick={() => (index !== safeIndex ? changeToIndex(index) : null)}
            aria-label={SHEET_REGISTRY[id].label}
          />
        ))}
      </div>
    </div>
  );
}

