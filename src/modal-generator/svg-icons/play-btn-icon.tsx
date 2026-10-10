"use client";

import React from "react";

type PlayBtnIconProps = {
  playing?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  label?: string;
};

export default function PlayBtnIcon({
  playing = false,
  size = 24,
  className,
  onClick,
  label,
}: PlayBtnIconProps) {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="white"
      aria-hidden="true"
      style={{
        display: "block",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))",
        flexShrink: 0,
      }}
    >
      {playing ? (
        <>
          <rect x="7" y="5" width="3.5" height="14" rx="1" />
          <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
      )}
    </svg>
  );

  if (!onClick) {
    return (
      <span
        className={className}
        role="img"
        aria-label={label || (playing ? "Pause" : "Play")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label || (playing ? "Pause" : "Play")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}
