"use client";

import React from "react";

export default function BellIcon() {
  return (
    <button
      type="button"
      aria-label="Notifications"
      style={{
        width: 200,
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
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        {/* Bell body */}
        <path
          d="
            M 50 5
            C 26 5 10 22 10 44
            L 10 64
            C 10 68 8 72 6 76
            C 3 82 8 88 16 88
            L 84 88
            C 92 88 97 82 94 76
            C 92 72 90 68 90 64
            L 90 44
            C 90 22 74 5 50 5
            Z
          "
          fill="white"
        />

        {/* Clapper ring */}
        <path
          d="
            M 32 88
            A 18 18 0 0 0 68 88
            L 60 88
            A 10 10 0 0 1 40 88
            Z
          "
          fill="white"
        />
      </svg>
    </button>
  );
}