"use client";

import React, { useState } from "react";

export default function Reverse10Icon() {
  const [rotating, setRotating] = useState(false);

  const handleClick = () => {
    if (rotating) return;

    setRotating(true);

    setTimeout(() => {
      setRotating(false);
    }, 600);
  };

  return (
    <svg
      className="replay-icon"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={80}
      height={80}
      aria-label="Reverse 10 seconds"
      role="button"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Outer reverse arrow */}
      <g
        className={rotating ? "replay-arrow rotating" : "replay-arrow"}
        style={{
          transformBox: "view-box",
          transformOrigin: "50px 50px",
          transition: "transform 0.6s linear",
          willChange: "transform",
          transform: rotating ? "rotate(-360deg)" : "rotate(0deg)",
        }}
      >
        {/* Circular reverse line */}
        <path
          d="M27 28
             C18 35 13 45 13 56
             C13 76 29 91 49 91
             C70 91 86 76 86 55
             C86 37 73 22 55 19"
          stroke="#fff"
          strokeWidth={8}
          strokeLinecap="round"
        />

        {/* Closed left-facing triangle */}
        <path
          d="M58 8
             L58 28
             L37 18
             Z"
          fill="#fff"
        />
      </g>

      {/* 10 stays completely stationary */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={29}
        fontWeight={700}
        pointerEvents="none"
      >
        10
      </text>
    </svg>
  );
}