"use client";

import React from "react";

type IconProps = {
  size?: number;
  className?: string;
};

export function YouIcon({
  size = 24,
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={size}
      height={size}
      className={className}
      style={{
        display: "block",
        overflow: "visible",
      }}
    >
      <circle
        cx="32"
        cy="22"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        d="M12 56 C13.5 43 21 36 32 36 C43 36 50.5 43 52 56"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const ProfileIcon = YouIcon;

export default function ProfileAvatarIcon() {
  return (
    <button
      type="button"
      aria-label="Profile"
      style={{
        width: 80,
        height: 80,
        padding: 0,
        margin: 0,
        border: "none",
        outline: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#ffffff",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      <YouIcon size={80} />
    </button>
  );
}
