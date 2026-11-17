
export default function ViewMoreIcon({
  size = 260,
  color = "#444444",
  strokeWidth = 11,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle */}
      <circle
        cx="90"
        cy="130"
        r="70"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* First Chevron */}
      <path
        d="M100 100 L120 130 L100 160"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Second Chevron */}
      <path
        d="M70 100 L90 130 L70 160"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top Bar */}
      <path
        d="M170 60 H230"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Middle Bar */}
      <path
        d="M170 130 H230"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Bottom Bar */}
      <path
        d="M170 200 H230"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
