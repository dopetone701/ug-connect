import * as React from "react";

export interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
  /** Size in px or any CSS unit. Default: 24 */
  size?: number | string;
  /** Fill color. Default: currentColor (inherits text color) */
  color?: string;
  /** Make it filled or outline. For full heart, keep true */
  filled?: boolean;
}

const HeartIcon = React.forwardRef<SVGSVGElement, HeartIconProps>(
  ({ size = 24, color = "currentColor", filled = true, className, style, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? color : "none"}
        stroke={filled ? color : "currentColor"}
        strokeWidth={filled ? 0 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        role="img"
        className={className}
        style={{ display: "inline-block", flexShrink: 0, ...style }}
        {...props}
      >
        {/* Full heart path */}
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
);

HeartIcon.displayName = "HeartIcon";

export default HeartIcon;
export { HeartIcon };

