"use client";

import React from "react";

export default function HomeIcon() {
  return (
    <button
      type="button"
      aria-label="Home"
      style={{
        width: 160,
        height: 160,
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
        fill="none"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {/* House outline */}
        <path
          d="
            M 50 10
            C 54 10 80 28 80 28
            C 85 32 85 38 85 38
            L 85 75
            C 85 85 76 86 76 86
            L 24 86
            C 15 86 15 75 15 75
            L 15 38
            C 15 38 15 32 20 28
            C 20 28 46 10 50 10
            Z
          "
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Door */}
        <path
          d="
            M 36 86
            L 36 60
            C 36 50 42 47 48 47
            L 52 47
            C 58 47 64 50 64 60
            L 64 86
          "
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}