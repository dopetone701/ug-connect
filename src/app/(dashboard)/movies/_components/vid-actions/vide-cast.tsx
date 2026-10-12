"use client";
import { useGlobalCast } from "@/stores/use-global-cast";

export default function VideoCastBtn() {
  const { setOpen } = useGlobalCast();

  return (
    <button
      type="button"
      className="cc-icon apple-full"
      aria-label="Cast"
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
      style={{
        width: 240,
        height: 240,
        padding: 0,
        margin: 0,
        border: "none",
        outline: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />
        <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />
        <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />
        <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z" />
      </svg>
    </button>
  );
}

