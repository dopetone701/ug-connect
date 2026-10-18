import React from "react";

type StarHamburgerIconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

export const StarHamburgerIcon: React.FC<StarHamburgerIconProps> = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 5.5,
  className,
  title,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={!title}
      className={className}
      style={{ overflow: "visible", display: "block" }}
    >
      {title ? <title>{title}</title> : null}
      {/* Equal horns - center 45,50 radius 40 - left/top/bottom identical */}
      <path
        d="M 94 38 L 57 38 L 45 10 L 30 38 L 5 50 L 30 62 L 45 90 L 57 62 L 94 62"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle hamburger line - detached */}
      <path
        d="M 60 50 L 94 50"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StarHamburgerIcon;