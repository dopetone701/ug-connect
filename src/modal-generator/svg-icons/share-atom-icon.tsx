"use client";
import React from "react";

export default function ShareIcon() {
  return (
    <button
      type="button"
      aria-label="Share"
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
        {/* Connection lines - exact edge to edge, zero overlap */}
        <line
          x1="40.7"
          y1="41.2"
          x2="59.3"
          y2="30.8"
          stroke="#2a2e8a"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <line
          x1="40.7"
          y1="58.8"
          x2="59.3"
          y2="69.2"
          stroke="#2a2e8a"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* 3 circles - drawn on top */}
        <circle
          cx="25"
          cy="50"
          r="18"
          fill="white"
          stroke="#2a2e8a"
          strokeWidth="5.5"
        />
        <circle
          cx="75"
          cy="22"
          r="18"
          fill="white"
          stroke="#2a2e8a"
          strokeWidth="5.5"
        />
        <circle
          cx="75"
          cy="78"
          r="18"
          fill="white"
          stroke="#2a2e8a"
          strokeWidth="5.5"
        />
      </svg>
    </button>
  );
}

