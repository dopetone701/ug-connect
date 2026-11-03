// Padlock.tsx
import React from "react";

type PadlockProps = {
  size?: number;
  color?: string;
  className?: string;
};

export default function Padlock({ size = 100, color = "#333", className }: PadlockProps) {
  const s = size / 100; // design built at 100px
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size, // FIX: was size * 1.3 - that overflowed your 8.5px button
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 0,
        flexShrink: 0,
      }}
    >
      {/* Shackle */}
      <div
        style={{
          width: 60 * s,
          height: 40 * s,
          border: `${10 * s}px solid ${color}`,
          borderBottom: "none",
          borderRadius: `${30 * s}px ${30 * s}px 0 0`,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      />
      {/* Body - overlaps shackle slightly so total = size */}
      <div
        style={{
          width: 100 * s,
          height: 65 * s,
          marginTop: -5 * s,
          background: color,
          borderRadius: 10 * s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Keyhole */}
        <div
          style={{
            width: 18 * s,
            height: 28 * s,
            background: "white",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}