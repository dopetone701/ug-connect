"use client";
import "./dots-menu.css";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type Item = { label: string; value: string; danger?: boolean };

const ITEMS: Item[] = [
  { label: "Download", value: "download" },
  { label: "Add to my list", value: "list" },
  { label: "Share", value: "share" },
  { label: "Report a problem", value: "report", danger: true },
];

export default function DotsMenu({ itemData, items = ITEMS, onAction }: any) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const w = 176;
    const h = panelRef.current?.offsetHeight || 160;
    let left = r.right - w;
    let top = r.bottom + 8;

    // clamp to screen - NO overflow right
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    // flip up if no space below
    if (top + h > window.innerHeight - 8) {
      top = r.top - h - 8;
    }
    top = Math.max(8, top);

    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node) &&!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // use mousedown not click so it doesn't fight toggle
    setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <>
      <div ref={wrapRef} className="dots-menu-wrap">
        <div ref={btnRef} className={`dots-menu-btn ${open? "open" : ""}`} onClick={() => setOpen((v) =>!v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="19" r="3" />
          </svg>
        </div>
      </div>

      {mounted && open && createPortal(
        <div ref={panelRef} className="dots-menu-panel" style={{ top: pos.top, left: pos.left }}>
          {items.map((it: Item) => (
            <div
              key={it.value}
              className={`dots-menu-item ${it.danger? "danger" : ""}`}
              onClick={() => {
                setOpen(false);
                onAction?.(it.value, itemData);
              }}
            >
              {it.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
