"use client";

import React from "react";

export default function ServicesIcon() {
  return (
    <button
      type="button"
      aria-label="Services"
      style={{
        width: 280,
        height: 340,
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
        viewBox="0 0 100 110"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        {/* Center column connectors */}
        <rect x="47.5" y="21" width="5" height="21" fill="black" />
        <rect x="47.5" y="62" width="5" height="25" fill="black" />

        {/* Side connectors */}
        <rect x="22.5" y="41" width="5" height="26" fill="black" />
        <rect x="72.5" y="41" width="5" height="26" fill="black" />

        {/* Center Column */}
        <circle
          cx="50"
          cy="11"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        <circle
          cx="50"
          cy="52"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        <circle
          cx="50"
          cy="97"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        {/* Left Column */}
        <circle
          cx="25"
          cy="31"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        <circle
          cx="25"
          cy="77"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        {/* Right Column */}
        <circle
          cx="75"
          cy="31"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        <circle
          cx="75"
          cy="77"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        {/* Outer Middles */}
        <circle
          cx="8"
          cy="52"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />

        <circle
          cx="92"
          cy="52"
          r="9"
          fill="white"
          stroke="black"
          strokeWidth="5"
        />
      </svg>
    </button>
  );
}