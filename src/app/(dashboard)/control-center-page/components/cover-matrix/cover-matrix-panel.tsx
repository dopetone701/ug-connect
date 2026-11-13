"use client";
import { useEffect } from "react";
import { useCoverMatrixPanel } from "./cover-matrix-store";
import { useCoverMatrix, startCoverMatrixJob } from "./cover-matrix-controller";
import CoverMatrixBody from "./cover-matrix-body";
import "./m-panel.css";

export function CoverMatrixChip() {
  const openPanel = useCoverMatrixPanel((s) => s.openPanel);
  const movies = useCoverMatrix((s) => s.movies);
  return (
    <button className="cc-tab" onClick={() => openPanel(null)}>
      🖼️ Cover Matrix{movies.length ? ` • ${movies.length}` : ""}
    </button>
  );
}

export default function CoverMatrixPanel() {
  const isOpen = useCoverMatrixPanel((s) => s.isOpen);
  const closePanel = useCoverMatrixPanel((s) => s.closePanel);
  const loadMovies = useCoverMatrix((s) => s.loadMovies);
  const shuffleAll = useCoverMatrix((s) => s.shuffleAll);
  const busyId = useCoverMatrix((s) => s.busyId);

  useEffect(() => { if (isOpen) loadMovies(); }, [isOpen, loadMovies]);


  useEffect(() => {
  if (!isOpen) return;
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.classList.add("m-panel-open");
  return () => {
    document.body.style.overflow = prev;
    document.body.classList.remove("m-panel-open");
  };
}, [isOpen]);

  useEffect(() => { startCoverMatrixJob(); }, []);
  if (!isOpen) return null;

  return (
    <div className="m-panel-overlay" onClick={closePanel}>
      <div className="m-panel" onClick={(e) => e.stopPropagation()}>
        <div className="m-panel-topbar">
          <span className="m-panel-title">Cover Matrix</span>
          <div className="m-panel-actions">
            <button className="m-panel-btn" disabled={!!busyId} onClick={() => { if (confirm("Shuffle ALL movie covers now?")) shuffleAll(); }}>🔀 Shuffle All</button>
            <button className="m-panel-btn close" onClick={closePanel}>✕</button>
          </div>
        </div>
        <CoverMatrixBody />
      </div>
    </div>
  );
}

