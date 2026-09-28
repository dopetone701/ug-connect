"use client";
import React from "react";

export default function ServicesGridIcon() {
  return (
    <button
      type="button"
      aria-label="Services"
      style={{
        width: 220,
        height: 220,
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
        <rect x="12" y="12" width="30" height="30" rx="4" fill="white" />
        <path d="M 71 14 C 73 14 75 16 75 18 L 75 28 L 85 28 C 87 28 89 30 89 32 L 89 36 C 89 38 87 40 85 40 L 75 40 L 75 50 C 75 52 73 54 71 54 L 67 54 C 65 54 63 52 63 50 L 63 40 L 53 40 C 51 40 49 38 49 36 L 49 32 C 49 30 51 28 53 28 L 63 28 L 63 18 C 63 16 65 14 67 14 Z" fill="white" />
        <rect x="15" y="60" width="26" height="26" rx="2" fill="white" transform="rotate(45 28 73)" />
        <rect x="58" y="58" width="30" height="30" rx="4" fill="white" />
      </svg>
    </button>
  );
}

type Props = { size?: number; className?: string };

export function ServicesIcon({ size = 24, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} style={{ display: "block" }}>
      <rect x="12" y="12" width="30" height="30" rx="4" fill="currentColor" />
      <path d="M 71 14 C 73 14 75 16 75 18 L 75 28 L 85 28 C 87 28 89 30 89 32 L 89 36 C 89 38 87 40 85 40 L 75 40 L 75 50 C 75 52 73 54 71 54 L 67 54 C 65 54 63 52 63 50 L 63 40 L 53 40 C 51 40 49 38 49 36 L 49 32 C 49 30 51 28 53 28 L 63 28 L 63 18 C 63 16 65 14 67 14 Z" fill="currentColor" />
      <rect x="15" y="60" width="26" height="26" rx="2" fill="currentColor" transform="rotate(45 28 73)" />
      <rect x="58" y="58" width="30" height="30" rx="4" fill="currentColor" />
    </svg>
  );
}
