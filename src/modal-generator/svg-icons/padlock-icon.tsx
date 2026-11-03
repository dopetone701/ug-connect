// Padlock.tsx
import React from "react";

type PadlockProps = {
  size?: number;
  color?: string;
  className?: string;
};

export default function Padlock({ size = 100, color = "#333", className }: PadlockProps) {
  const s = size / 100; // your original design is built at 100px wide
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size * 1.3,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      {/* Shackle */}
      <div
        style={{
          width: 60 * s,
          height: 50 * s,
          border: `${10 * s}px solid ${color}`,
          borderBottom: "none",
          borderRadius: `${30 * s}px ${30 * s}px 0 0`,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      />

      {/* Body */}
      <div
        style={{
          width: 100 * s,
          height: 80 * s,
          background: color,
          borderRadius: 10 * s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Keyhole */}
        <div
          style={{
            width: 20 * s,
            height: 30 * s,
            background: "white",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}