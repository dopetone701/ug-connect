"use client";
import { useSideSheet } from "@/stores/use-side-sheet";

export default function SheetShell({ title, children }: { title: string; children?: React.ReactNode }) {
  const { close } = useSideSheet();
  return (
    <div className="side-sheet-overlay" onClick={close}>
      <div className="side-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <div className="sheet-title">{title}</div>
          <button className="wa-v" onClick={close} aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
        <div className="sheet-body">{children || <div className="sheet-empty">Empty - inject children later</div>}</div>
      </div>
    </div>
  );
}

