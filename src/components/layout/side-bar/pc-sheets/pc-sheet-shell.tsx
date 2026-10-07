"use client";
import { useSideSheet } from "@/stores/use-side-sheet";
import "./pc-sheet.css";

export default function PcSheetShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { close } = useSideSheet();
  return (
    <div className="pc-sheet-overlay" onClick={close}>
      <div className="pc-sheet-backdrop" />
      <div className="pc-sheet-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="pc-sheet">
          <div className="pc-top">
            <div className="pc-title">{title}</div>
            <button className="pc-close" onClick={close}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="pc-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

