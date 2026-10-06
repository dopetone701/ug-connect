"use client";

import "./edit-icon.css";

export default function EditIcon() {
  return (
    <svg
      className="edit-icon"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-label="Edit"
      role="img"
    >
      {/* Open document */}
      <path
        d="
          M11 4
          H4
          C2.895 4 2 4.895 2 6
          V20
          C2 21.105 2.895 22 4 22
          H18
          C19.105 22 20 21.105 20 20
          V13
        "
      />

      {/* Pencil body */}
      <path
        d="
          M18.45 2.55
          C19.17 1.83 20.33 1.83 21.05 2.55
          L21.45 2.95
          C22.17 3.67 22.17 4.83 21.45 5.55
          L12 15
          L8 16
          L9 12
          Z
        "
      />

      {/* Sharp pencil tip */}
      <path
        d="
          M8 16
          L9 12
        "
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />

      {/* Eraser separator */}
      <path
        d="
          M18.45 2.55
          L21.45 5.55
        "
      />
    </svg>
  );
}