"use client";

export default function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 110 95"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Front person */}
      <circle cx="38" cy="44" r="9" />

      <path d="M18 79v-3a12 12 0 0 1 12-12h16a12 12 0 0 1 12 12v3z" />

      {/* Back person */}
      <circle cx="69" cy="30" r="8" />

      <path d="M64 53h9a13 13 0 0 1 13 13v1" />
    </svg>
  );
}