"use client";

import React from "react";

type BellIconProps = {
  size?: number | string;
  color?: string;
  className?: string;
};

export default function BellIcon({
  size = 28,
  color = "currentColor",
  className,
}: BellIconProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Notifications"
      style={{
        display: "block",
        overflow: "visible",
        color,
        flexShrink: 0,
      }}
    >
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
        fill={color}
      />

      <path
        d="
          M 32 88
          A 18 18 0 0 0 68 88
          L 60 88
          A 10 10 0 0 1 40 88
          Z
        "
        fill={color}
      />
    </svg>
  );
}
