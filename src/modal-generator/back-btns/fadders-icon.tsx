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
        {/* Top slider - LEFT part */}
        <rect
          x="10"
          y="29"
          width="13"
          height="7"
          rx="3.5"
          fill="white"
        />

        {/* Top slider - RIGHT part */}
        <rect
          x="47"
          y="29"
          width="43"
          height="7"
          rx="3.5"
          fill="white"
        />

        {/* Top knob */}
        <circle
          cx="35"
          cy="32.5"
          r="12.5"
          fill="#1a1a1a"
          stroke="white"
          strokeWidth="6"
        />

        {/* Bottom slider - LEFT part */}
        <rect
          x="10"
          y="64"
          width="43"
          height="7"
          rx="3.5"
          fill="white"
        />

        {/* Bottom slider - RIGHT part */}
        <rect
          x="77"
          y="64"
          width="13"
          height="7"
          rx="3.5"
          fill="white"
        />

        {/* Bottom knob */}
        <circle
          cx="65"
          cy="67.5"
          r="12.5"
          fill="#1a1a1a"
          stroke="white"
          strokeWidth="6"
        />
      </svg>
    </button>
  );
}