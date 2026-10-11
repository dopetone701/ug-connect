"use client";

import { useState } from "react";

type Props = {
  defaultPlaying?: boolean;
  onChange?: (isPlaying: boolean) => void;
  size?: number;
  className?: string;
};

export default function PlayPauseToggle({
  defaultPlaying = true,
  onChange,
  size = 180,
  className = "",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);

  const toggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onChange?.(next);
  };

  const scale = size / 180;

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <button
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={!isPlaying}
        onClick={toggle}
        style={{
          padding: `${20 * scale}px`,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          style={{
            width: `${180 * scale}px`,
            height: `${96 * scale}px`,
            background: "#A9A9A9",
            borderRadius: 999,
            position: "relative",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.15s ease",
          }}
        >
          <div
            style={{
              width: `${84 * scale}px`,
              height: `${84 * scale}px`,
              borderRadius: "50%",
              position: "absolute",
              top: `${6 * scale}px`,
              left: `${6 * scale}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.2)",
              background: isPlaying ? "#FFFFFF" : "#5E5E5E",
              transform: isPlaying ? `translateX(${84 * scale}px)` : "translateX(0)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {isPlaying ? (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${32 * scale}px solid #0A0A0A`,
                  borderTop: `${20 * scale}px solid transparent`,
                  borderBottom: `${20 * scale}px solid transparent`,
                  marginLeft: `${6 * scale}px`,
                  borderRadius: 2,
                }}
              />
            ) : (
              <div style={{ display: "flex", gap: `${10 * scale}px` }}>
                <span style={{ width: `${14 * scale}px`, height: `${36 * scale}px`, background: "white", borderRadius: 4, display: "block" }} />
                <span style={{ width: `${14 * scale}px`, height: `${36 * scale}px`, background: "white", borderRadius: 4, display: "block" }} />
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
