"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./arsenal-body.css";
import { useArsenalDrawer } from "./arsenal-drawer-store";
import ArsenalBody from "./arsenal-body";

// arsenal-drawer.tsx - EMPTY PANEL ONLY. Host + Shell in one file.
// No Body, no List, no Picker, no Register, no Share. Body feeds later.

export function ArsenalDrawer() {
  const { stack, leaving, closingAll, back, finishLeave } = useArsenalDrawer();
  const depth = stack.length;
  const isRoot = depth <= 1;

  useEffect(() => {
    if (!stack.length) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [stack.length]);

  if (!stack.length) return null;

  const titleFor = (id: string) =>
    id === "arsenal-list" ? "Arsenal" :
    id === "arsenal-picker" ? "Pick from Arsenal" :
    id === "reciever-register" ? "Share Arsenal" :
    id === "share-arsenal" ? "Send to Arsenal" : "Arsenal";

  return createPortal(
    <>
      <div className={`arsenal-overlay ${leaving ? "is-closing" : ""}`} onClick={back} />
      {stack.map((entry, i) => {
        const isTop = i === stack.length - 1;
        const isLeavingTop = isTop && leaving;
        return (
          <div
            key={`${entry.id}-${i}`}
            className={`arsenal-sheet ${i === 0 ? "is-base" : "is-next"} ${isTop && leaving ? (closingAll ? "is-closing" : "is-leaving") : ""} ${!isTop ? "is-under" : ""}`}
            role="dialog"
            aria-modal={isTop}
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              if (isLeavingTop) finishLeave();
            }}
          >
            {/* SHELL - header only */}
            <header className="arsenal-header">
              <button type="button" className="arsenal-back" onClick={back} aria-label={isRoot ? "Close" : "Back"}>
                {isRoot ? "\u2715" : "\u2039 Back"}
              </button>
              <h2 className="arsenal-title">{titleFor(entry.id)}</h2>
              <span className="arsenal-header-spacer" />
            </header>
            {/* BODY - EMPTY */}
            <div className="arsenal-body">
              {isTop ? <ArsenalBody /> : null}
            </div>
          </div>
        );
      })}
    </>,
    document.body
  );
}

