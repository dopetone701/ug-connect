"use client";
import React from "react";

export default function FilterSlidersIcon() {
  return (
    <button
      type="button"
      aria-label="Filter"
      style={{
        width: 240,
        height: 240,
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
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        <rect x="10" y="29" width="13" height="7" rx="3.5" fill="white" />
        <rect x="47" y="29" width="43" height="7" rx="3.5" fill="white" />
        <circle cx="35" cy="32.5" r="12.5" fill="#1a1a1a" stroke="white" strokeWidth="6" />
        <rect x="10" y="64" width="43" height="7" rx="3.5" fill="white" />
        <rect x="77" y="64" width="13" height="7" rx="3.5" fill="white" />
        <circle cx="65" cy="67.5" r="12.5" fill="#1a1a1a" stroke="white" strokeWidth="6" />
      </svg>
    </button>
  );
}

type Props = { size?: number; className?: string };

export function FilterIcon({ size = 24, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} style={{ display: "block", overflow: "visible" }}>
      <rect x="10" y="29" width="13" height="7" rx="3.5" fill="currentColor" />
      <rect x="47" y="29" width="43" height="7" rx="3.5" fill="currentColor" />
      <circle cx="35" cy="32.5" r="12.5" fill="currentColor" stroke="currentColor" strokeWidth="0" />
      <circle cx="35" cy="32.5" r="6" fill="black" />
      <rect x="10" y="64" width="43" height="7" rx="3.5" fill="currentColor" />
      <rect x="77" y="64" width="13" height="7" rx="3.5" fill="currentColor" />
      <circle cx="65" cy="67.5" r="12.5" fill="currentColor" stroke="currentColor" strokeWidth="0" />
      <circle cx="65" cy="67.5" r="6" fill="black" />
    </svg>
  );
}
