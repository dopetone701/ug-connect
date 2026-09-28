"use client";

import React from "react";

export default function MoreIcon() {
  return (
    <button
      type="button"
      aria-label="More"
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
        style={{ display: "block" }}
      >
        {/* Outer circle background */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="#1a1f2e"
          stroke="#2d3548"
          strokeWidth="1.2"
        />

        {/* 3 dots */}
        <circle cx="28" cy="50" r="6" fill="#e8ecf5" />
        <circle cx="50" cy="50" r="6" fill="#e8ecf5" />
        <circle cx="72" cy="50" r="6" fill="#e8ecf5" />
      </svg>
    </button>
  );
}