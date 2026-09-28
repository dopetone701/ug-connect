"use client";

import React from "react";

export default function SettingsGearIcon() {
  return (
    <button
      type="button"
      aria-label="Settings"
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
        viewBox="0 0 110 110"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        {/* Outer Gear */}
        <path
          d="
            M 50 5
            L 60 5
            C 62.5 5 64.5 7 64.5 9.5
            L 64.5 13.5
            C 64.5 16 67 18.5 70.5 19
            C 72 19.2 73.5 18.6 75 17.3
            L 77.5 15.1
            C 79.3 13.4 82 13.4 83.8 15.1
            L 90.8 22.1
            C 92.5 23.9 92.5 26.6 90.8 28.4
            L 88.6 30.9
            C 87.3 32.4 86.7 34 87 35.5
            C 87.5 39 90 41.5 93.5 41.5
            L 97.5 41.5
            C 100 41.5 102 43.5 102 46
            L 102 56
            C 102 58.5 100 60.5 97.5 60.5
            L 93.5 60.5
            C 90 60.5 87.5 63 87 66.5
            C 86.7 68 87.3 69.6 88.6 71.1
            L 90.8 73.6
            C 92.5 75.4 92.5 78.1 90.8 79.9
            L 83.8 86.9
            C 82 88.6 79.3 88.6 77.5 86.9
            L 75 84.7
            C 73.5 83.4 72 82.8 70.5 83
            C 67 83.5 64.5 86 64.5 88.5
            L 64.5 92.5
            C 64.5 95 62.5 97 60 97
            L 50 97
            C 47.5 97 45.5 95 45.5 92.5
            L 45.5 88.5
            C 45.5 86 43 83.5 39.5 83
            C 38 82.8 36.5 83.4 35 84.7
            L 32.5 86.9
            C 30.7 88.6 28 88.6 26.2 86.9
            L 19.2 79.9
            C 17.5 78.1 17.5 75.4 19.2 73.6
            L 21.4 71.1
            C 22.7 69.6 23.3 68 23 66.5
            C 22.5 63 20 60.5 16.5 60.5
            L 12.5 60.5
            C 10 60.5 8 58.5 8 56
            L 8 46
            C 8 43.5 10 41.5 12.5 41.5
            L 16.5 41.5
            C 20 41.5 22.5 39 23 35.5
            C 23.3 34 22.7 32.4 21.4 30.9
            L 19.2 28.4
            C 17.5 26.6 17.5 23.9 19.2 22.1
            L 26.2 15.1
            C 28 13.4 30.7 13.4 32.5 15.1
            L 35 17.3
            C 36.5 18.6 38 19.2 39.5 19
            C 43 18.5 45.5 16 45.5 13.5
            L 45.5 9.5
            C 45.5 7 47.5 5 50 5
            Z
          "
          fill="none"
          stroke="black"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Central Circle */}
        <circle
          cx="55"
          cy="51"
          r="22"
          fill="none"
          stroke="black"
          strokeWidth="6"
        />
      </svg>
    </button>
  );
}