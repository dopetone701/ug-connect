"use client";

export default function SearchIcon() {
  return (
    <svg
      className="search-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Search"
      role="img"
    >
      {/* Circle */}
      <circle
        cx="48"
        cy="48"
        r="30"
      />

      {/* Handle */}
      <line
        x1="70.5"
        y1="70.5"
        x2="86"
        y2="86"
      />
    </svg>
  );
}