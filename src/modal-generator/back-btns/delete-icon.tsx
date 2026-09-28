"use client";

import React from "react";

export default function DeleteIcon() {
  return (
    <button
      type="button"
      aria-label="Delete"
      style={{
        width: 200,
        height: 200,
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
        {/* Trash lid */}
        <path
          d="
            M 30 18
            L 32 14
            C 32.5 13 33.5 12 35 12
            L 65 12
            C 66.5 12 67.5 13 68 14
            L 70 18
            Z
          "
          fill="black"
        />

        <rect
          x="20"
          y="18"
          width="60"
          height="6"
          rx="2"
          fill="black"
        />

        {/* Body */}
        <path
          d="
            M 28 28
            L 30 88
            C 30.3 91 32 93 35 93
            L 65 93
            C 68 93 69.7 91 70 88
            L 72 28
            Z
          "
          fill="black"
        />

        {/* Inner lines */}
        <rect
          x="36"
          y="36"
          width="5"
          height="42"
          rx="2.5"
          fill="white"
        />

        <rect
          x="47.5"
          y="36"
          width="5"
          height="42"
          rx="2.5"
          fill="white"
        />

        <rect
          x="59"
          y="36"
          width="5"
          height="42"
          rx="2.5"
          fill="white"
        />
      </svg>
    </button>
  );
}