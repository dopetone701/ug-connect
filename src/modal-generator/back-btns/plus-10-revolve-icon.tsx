"use client";

import React from "react";

export default function Replay10Icon() {
  return (
    <svg
      className="replay-icon"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={80}
      height={80}
      aria-label="Replay 10 seconds"
      role="img"
    >
      {/* Circular replay line */}
      <path
        d="M73 28
           C82 35 87 45 87 56
           C87 76 71 91 51 91
           C30 91 14 76 14 55
           C14 37 27 22 45 19"
        stroke="#fff"
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Perfect closed triangle */}
      <path
        d="M42 8
           L42 28
           L63 18
           Z"
        fill="#fff"
      />

      {/* 10 */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={29}
        fontWeight={700}
      >
        10
      </text>
    </svg>
  );
}