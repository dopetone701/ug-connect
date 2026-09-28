"use client";
import React from "react";

export default function PlayCircleIcon() {
  return (
    <button
      type="button"
      aria-label="Play"
      style={{
        width: 280,
        height: 280,
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
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <circle cx="50" cy="50" r="34" fill="none" stroke="#231F20" strokeWidth="7" strokeLinecap="round" />
        <path d="M 42 30 L 71 50 L 42 70 Z" fill="#231F20" stroke="#231F20" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </button>
  );
}

type PreviewProps = {
  size?: number;
  className?: string;
};

export function PreviewIcon({ size = 24, className }: PreviewProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} style={{ display: "block", overflow: "visible" }}>
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M 42 30 L 71 50 L 42 70 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
