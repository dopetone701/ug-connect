"use client";

import React from "react";

export default function ScissorsIcon() {
  return (
    <button
      type="button"
      aria-label="Scissors"
      style={{
        width: 350,
        height: 350,
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
        {/* Left handle */}
        <circle
          cx="17"
          cy="29"
          r="11"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />

        {/* Right handle */}
        <circle
          cx="17"
          cy="71"
          r="11"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />

        {/* Upper handle arm */}
        <path
          d="M25 36 L51 49"
          fill="none"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Lower handle arm */}
        <path
          d="M25 64 L51 51"
          fill="none"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Upper blade — straight cutting edge, curved back */}
        <path
          d="
            M49 49
            L98 15
            C88 32 74 43 57 51
            Z
          "
          fill="black"
        />

        {/* Lower blade — straight cutting edge, curved back */}
        <path
          d="
            M49 51
            L98 85
            C88 68 74 57 57 49
            Z
          "
          fill="black"
        />

        {/* Pivot */}
        <circle
          cx="51"
          cy="50"
          r="4"
          fill="white"
          stroke="black"
          strokeWidth="1.8"
        />

        <circle
          cx="51"
          cy="50"
          r="1.5"
          fill="black"
        />
      </svg>
    </button>
  );
}