
import React from "react";

type ReplayPlayIconProps = {
  size?: number | string;
  color?: string;
  className?: string;
};

export default function ReplayPlayIcon({
  size = 80,
  color = "#fff",
  className,
}: ReplayPlayIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Replay play"
      fill="none"
      style={{
        display: "block",
        overflow: "visible",
        flexShrink: 0,
      }}
    >
      {/* Original circular arrow lifted slightly */}
      <g transform="translate(0 -3)">
        <path
          d="M27 28
             C18 35 13 45 13 56
             C13 76 29 91 49 91
             C70 91 86 76 86 55
             C86 37 73 22 55 19"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Original arrowhead preserved */}
        <path
          d="M58 8 L58 28 L37 18 Z"
          fill={color}
        />
      </g>

      {/* Centered solid play triangle */}
      <path
        d="M43 36 L43 64 L66 50 Z"
        fill={color}
      />
    </svg>
  );
}

