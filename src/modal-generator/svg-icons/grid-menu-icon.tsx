"use client";

import React from "react";

type GridIconProps = {
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
};

export default function GridIcon({
  size = 24,
  color = "currentColor",
  className,
  strokeWidth = 2,
}: GridIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Grid view"
      role="img"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
