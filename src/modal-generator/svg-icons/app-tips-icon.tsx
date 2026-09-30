"use client";
import React from "react";

export default function AppTipsIcon() {
  return (
    <svg
      viewBox="0 0 60 75"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      style={{ display: "block" }}
    >
      {/* Bulb outline */}
      <path
        d="M 8 24 C 8 8 18 2 30 2 C 42 2 52 8 52 24 C 52 32 48.5 37.5 46 41 C 43.5 44.5 42.5 46.5 42 49 L 42 52 L 18 52 L 18 49 C 17.5 46.5 16.5 44.5 14 41 C 11.5 37.5 8 32 8 24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner filament stem */}
      <line
        x1="30"
        y1="30"
        x2="30"
        y2="52"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Filament circle */}
      <circle
        cx="30"
        cy="23"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      {/* Base lines */}
      <line
        x1="18"
        y1="58"
        x2="42"
        y2="58"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="64"
        x2="38"
        y2="64"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

