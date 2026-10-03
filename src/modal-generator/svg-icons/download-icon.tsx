import React from 'react';

type DownloadIconProps = {
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
};

export default function DownloadIcon({ 
  size = 24, 
  color = '#231F20', 
  className,
  strokeWidth = 9
}: DownloadIconProps) {
  // Clean stroke-based version - perfect centering, matches your image exactly
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Download icon"
    >
      <g 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Vertical shaft */}
        <path d="M 50 10 L 50 62" />
        {/* Arrow head - perfectly centered V */}
        <path d="M 22 47 L 50 68 L 78 47" />
        {/* Bottom tray / bucket */}
        <path d="M 12 76 L 12 84 Q 12 88 16 88 L 84 88 Q 88 88 88 84 L 88 76" />
      </g>
    </svg>
  );
}

