
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
      {/* Outer Circle */}
      <circle
        cx="130"
        cy="130"
        r="84"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* Arrow Shaft */}
      <path
        d="M78 130 H130"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Arrow Head */}
      <path
        d="M110 109 L131 130 L110 151"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bar 1 */}
      <path
        d="M138 95 H173"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Bar 2 */}
      <path
        d="M151 118 H173"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Bar 3 */}
      <path
        d="M151 141 H173"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Bar 4 */}
      <path
        d="M138 164 H173"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
