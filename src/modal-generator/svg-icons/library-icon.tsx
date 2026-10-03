"use client";
type LibraryIconProps = {
  size?: number;
  className?: string;
};

export default function LibraryIcon({
  size = 28,
  className,
}: LibraryIconProps) {
  return (
    <svg
      width={size}
      height={(size / 72) * 64}
      viewBox="0 0 72 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Library"
      className={className}
      role="img"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 12V52" />
        <path d="M25 12V52" />
        <path d="M40 12V52" />
        <path d="M55 12L69 52" />
      </g>
    </svg>
  );
}
