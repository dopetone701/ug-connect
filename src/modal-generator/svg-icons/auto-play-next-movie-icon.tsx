"use client";
import { useState } from "react";

type Props = {
  defaultPlaying?: boolean;
  onChange?: (isPlaying: boolean) => void;
  size?: number; // now 44 for player bar
  className?: string;
};

export default function PlayPauseToggle({
  defaultPlaying = true,
  onChange,
  size = 44, // FIXED: was 180
  className = "",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);

  const toggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onChange?.(next);
  };

  const scale = size / 44; // base 44 now

  return (
    <div className={className} style={{ display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        style={{
          width: `${44 * scale}px`,
          height: `${24 * scale}px`,
          background: isPlaying ? "white" : "rgba(255,255,255,0.3)",
          borderRadius: 999,
          border: "none",
          position: "relative",
          cursor: "pointer",
          padding: 2,
          display: "flex",
          alignItems: "center",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: `${20 * scale}px`,
            height: `${20 * scale}px`,
            borderRadius: "50%",
            background: isPlaying ? "black" : "white",
            transform: isPlaying ? `translateX(${20 * scale}px)` : "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {/* small play icon inside when ON */}
          {isPlaying && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${6 * scale}px solid white`,
                borderTop: `${4 * scale}px solid transparent`,
                borderBottom: `${4 * scale}px solid transparent`,
                marginLeft: 1,
              }}
            />
          )}
        </div>
      </button>
    </div>
  );
}
