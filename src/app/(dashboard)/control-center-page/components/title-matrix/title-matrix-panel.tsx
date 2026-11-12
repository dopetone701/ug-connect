"use client";
import "./t-panel.css";
import { useTitleMatrixStore } from "./title-matrix-store";
import TitleMatrixBody from "./title-matrix-body";
export function TitleMatrixChip() {
  const openPanel = useTitleMatrixStore(s => s.openPanel);
  return <button className="cc-tab" onClick={() => openPanel()}>🎬 Titles</button>;
}
export default function TitleMatrixPanel() {
  const { isOpen, closePanel } = useTitleMatrixStore();
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

