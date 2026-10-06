import React from 'react';

type PlaylistIconProps = {
  size?: number | string;
  color?: string;
  playColor?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function PlaylistIcon({
  size = 200,
  color = 'black',
  playColor = 'white',
  className,
  style,
}: PlaylistIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Video playlist icon"
      className={className}
      style={style}
    >
      {/* Top small bar */}
      <rect x="45" y="16" width="110" height="20" fill={color} />
      {/* Middle wide bar */}
      <rect x="14" y="56" width="172" height="20" fill={color} />
      {/* Bottom video player with rounded corners */}
      <rect x="6" y="93" width="188" height="101" rx="18" ry="18" fill={color} />
      {/* Play triangle - perfectly centered in video card */}
      <path d="M 80 117 L 80 170 L 136 143.5 Z" fill={playColor} />
    </svg>
  );
}

