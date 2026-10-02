"use client";
import { useState, useRef } from "react";
import "./user-control-selector.css";
import { SHEET_REGISTRY, SHEET_ORDER, type SheetId } from "./account-sheets";

type Props = {
  active: SheetId;
  onChange: (id: SheetId) => void;
};

export default function UserControlSelector({ active, onChange }: Props) {
  const idx = SHEET_ORDER.indexOf(active);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && idx < SHEET_ORDER.length - 1) {
        onChange(SHEET_ORDER[idx + 1]); // swipe left -> next
      } else if (diff > 0 && idx > 0) {
        onChange(SHEET_ORDER[idx - 1]); // swipe right -> prev
      }
    }
    dragging.current = false;
  };

  return (
    <div className="selector-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="selector-viewport">
        <div
          ref={trackRef}
          className="selector-track"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {SHEET_ORDER.map((id) => {
            const Comp = SHEET_REGISTRY[id].component;
            return (
              <div key={id} className="selector-slide">
                <Comp />
              </div>
            );
          })}
        </div>
      </div>

      {/* dots indicator */}
      <div className="selector-dots">
        {SHEET_ORDER.map((id) => (
          <span key={id} className={`dot ${active === id? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
