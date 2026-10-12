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
  size = 44,
  className = "",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);

  const toggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onChange?.(next);
  };

  const scale = size / 44;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`standalone-icon ${className}`}
      aria-label="Toggle autoplay"
      style={{
        all: "unset",
        width: `${44 * scale}px`,
        height: `${36 * scale}px`,
        minWidth: `${44 * scale}px`,
        minHeight: `${36 * scale}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        isolation: "isolate",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          width: `${44 * scale}px`,
          height: `${24 * scale}px`,
          background: isPlaying ? "#fff" : "rgba(255,255,255,0.35)",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.18)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: 2,
          transition: "background 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            width: `${20 * scale}px`,
            height: `${20 * scale}px`,
            borderRadius: "50%",
            background: isPlaying ? "#000" : "#fff",
            transform: isPlaying ? `translateX(${20 * scale}px)` : "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            flexShrink: 0,
          }}
        >
          {isPlaying && (
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: `${6 * scale}px solid #fff`,
                borderTop: `${4 * scale}px solid transparent`,
                borderBottom: `${4 * scale}px solid transparent`,
                marginLeft: 1,
                display: "block",
              }}
            />
          )}
        </span>
      </span>
    </button>
  );
}

