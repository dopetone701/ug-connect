"use client";
import React from "react";

interface Props {
  size?: number;
  dotSize?: number;
  onClick?: () => void;
  className?: string;
}

export default function MoreIcon({ size = 32, dotSize = 8, onClick, className }: Props) {
  return (
    <button
      type="button"
      aria-label="More"
      onClick={onClick}
      className={className}
      style={{
        width: size,
        height: size,
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
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="44" fill="hsl(var(--surface))" stroke="hsl(var(--border))" strokeWidth="1.2" />
        <circle cx="28" cy="50" r={dotSize} fill="hsl(var(--text))" />
        <circle cx="50" cy="50" r={dotSize} fill="hsl(var(--text))" />
        <circle cx="72" cy="50" r={dotSize} fill="hsl(var(--text))" />
      </svg>
    </button>
  );
}

export function DotsMenuIcon({ onClick, size = 32, dotSize = 8 }: { onClick: () => void; size?: number; dotSize?: number }) {
  return <MoreIcon size={size} dotSize={dotSize} onClick={onClick} />;
}

