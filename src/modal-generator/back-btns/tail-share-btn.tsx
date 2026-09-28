"use client";

import React from "react";

export default function ShareButton() {
  return (
    <button
      className="share-btn"
      type="button"
      aria-label="Share"
      style={{
        width: 128,
        height: 128,
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
        width={128}
        height={128}
        fill="none"
        stroke="white"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "block" }}
      >
        <path
          d="
            M 22 76
            C 24 52, 38 34, 62 34
            L 62 16
            C 62 12, 65 10, 68 12
            L 92 46
            C 94 48, 94 52, 92 54
            L 68 88
            C 65 90, 62 88, 62 84
            L 62 66
            C 42 66, 28 68, 22 76
            Z
          "
        />
      </svg>
    </button>
  );
}