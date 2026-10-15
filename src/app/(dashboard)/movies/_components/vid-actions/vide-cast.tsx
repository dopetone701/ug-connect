"use client";
import { useEffect, useState } from "react";
import { useGlobalCast } from "@/stores/use-global-cast";
import PcCastPanel from "./pc-cast-panel";

export default function VideoCastBtn() {
  const { setOpen } = useGlobalCast();
  const [showPcPanel, setShowPcPanel] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 1024 || window.innerWidth > window.innerHeight);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // Keep overlay visible while pc panel is open - no timeout till closed + overlay skip btns
  useEffect(() => {
    if (!showPcPanel) return;
    const keepAlive = () => {
      window.dispatchEvent(new CustomEvent("keepControlsVisible"));
      const controls = document.querySelector(".connect-controls") as HTMLElement | null;
      if (controls) {
        controls.classList.add("show");
        (controls as any).style.opacity = "1";
        (controls as any).style.visibility = "visible";
        (controls as any).style.pointerEvents = "auto";
      }
      const centerTop = document.querySelector(".center-top") as HTMLElement | null;
      if (centerTop) {
        centerTop.classList.add("show");
        (centerTop as any).style.opacity = "1";
        (centerTop as any).style.visibility = "visible";
      }
      // keep center-controls-layer visible but its buttons blocked by backdrop
      const centerLayer = document.querySelector(".center-controls-layer") as HTMLElement | null;
      if (centerLayer) {
        (centerLayer as any).style.opacity = "1";
        (centerLayer as any).style.visibility = "visible";
      }
    };
    keepAlive();
    const interval = setInterval(keepAlive, 150);
    document.body.setAttribute("data-pc-cast-open", "true");
    return () => {
      clearInterval(interval);
      document.body.removeAttribute("data-pc-cast-open");
    };
  }, [showPcPanel]);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="cc-icon apple-full"
        aria-label="Cast"
        onClick={(e) => {
          e.stopPropagation();
          if (isWide) {
            setShowPcPanel(v => !v);
          } else {
            setOpen(true);
          }
        }}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          margin: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", overflow: "visible" }}>
          <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />
          <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />
          <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />
          <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z" />
        </svg>
      </button>

      {isWide && showPcPanel && (
        <>
          <div className="pc-cast-backdrop" onClick={() => setShowPcPanel(false)} />
          <div className="pc-cast-wrapper">
            <PcCastPanel onClose={() => setShowPcPanel(false)} />
          </div>
        </>
      )}
    </div>
  );
}

