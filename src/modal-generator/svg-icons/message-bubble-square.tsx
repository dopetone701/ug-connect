"use client";

import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export default function ChatIcon({ size = 22, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Chat bubble */}
      <path d="M50 7H14C8.5 7 5 10.5 5 16V39C5 44.5 8.5 48 14 48H22V57L36 48H50C55.5 48 59 44.5 59 39V16C59 10.5 55.5 7 50 7Z" />
      {/* First line */}
      <path d="M16 23H48" />
      {/* Second line */}
      <path d="M16 34H40" />
    </svg>
  );
}

