import React from "react";

type ArrowListIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export default function ArrowListIcon({
  size = 32,
  color = "#444444",
  strokeWidth = 16,
  className = "",
}: ArrowListIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="52" cy="46" r="65" />
        <path d="M 40 140 H 118 M 40 140 H 118" />
        <path d="M 118 140 L 100 122 M 118 140 L 100 158" />
        <path d="M 128 32 H 218 M 128 32 H 218" />
        <path d="M 128 90 H 218 M 128 90 H 218" />
        <path d="M 128 148 H 218 M 128 148 H 218" />
        <path d="M 128 198 H 218 M 128 198 H 218" />
      </g>
    </svg>
  );
}