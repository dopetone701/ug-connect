"use client";

export default function ChatIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chat"
    >
      {/* Chat bubble */}
      <path
        d="M50 7H14C8.5 7 5 10.5 5 16V39C5 44.5 8.5 48 14 48H22V57L36 48H50C55.5 48 59 44.5 59 39V16C59 10.5 55.5 7 50 7Z"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* First line */}
      <path
        d="M16 23H48"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Second line */}
      <path
        d="M16 34H40"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}