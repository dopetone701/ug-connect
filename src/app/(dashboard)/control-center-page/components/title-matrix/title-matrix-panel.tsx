"use client";
import { useEffect } from "react";
import "./t-panel.css";
import { useTitleMatrixStore } from "./title-matrix-store";
import TitleMatrixBody from "./title-matrix-body";
export function TitleMatrixChip() {
  const openPanel = useTitleMatrixStore(s => s.openPanel);
  return <button className="cc-tab" onClick={() => openPanel()}>🎬 Titles</button>;
}
export default function TitleMatrixPanel() {
  const { isOpen, closePanel } = useTitleMatrixStore();

  // HIDE BOTTOM BAR ONLY on Title Panel
  // Panel open -> hide bar. Panel closed -> show bar again.
  // No parent file needed, no change to Covers / All Movies.
  useEffect(() => {
    const bar = document.querySelector(".bottom-bar") as HTMLElement | null;
    // Try other common names if yours is different
    const bar2 = !bar ? (document.querySelector('nav[class*="bottom"]') as HTMLElement | null) : null;
    const target = bar || bar2;
    if (!target) return;
    if (isOpen) {
      target.dataset.wasDisplay = target.style.display;
      target.style.display = "none";
    } else {
      target.style.display = target.dataset.wasDisplay || "";
    }
    return () => { if (target) target.style.display = target.dataset.wasDisplay || ""; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="t-panel-overlay" onClick={closePanel}>
      <div className="t-panel" onClick={(e) => e.stopPropagation()}>
        <div className="t-panel-topbar"><div className="t-panel-title">Cinematic Titles</div><div className="t-panel-actions"><button className="t-panel-btn close" onClick={closePanel}>Close</button></div></div>
        <TitleMatrixBody />
      </div>
    </div>
  );
}