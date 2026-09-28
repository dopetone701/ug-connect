"use client";

import React from "react";

export default function SaveButton() {
  return (
    <button
      type="button"
      aria-label="Save"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "18px",
        padding: 0,
        margin: 0,
        border: "none",
        background: "transparent",
        color: "white",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          width: "100px",
          height: "100px",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <path
            d="M 22 18 H 78 V 76 L 50 60 L 22 76 Z"
            fill="none"
            stroke="white"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span
        style={{
          color: "white",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "36px",
          fontWeight: 700,
          letterSpacing: "0.3px",
        }}
      >
        Save
      </span>
    </button>
  );
}