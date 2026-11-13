"use client";

import { useRef } from "react";
import type { MatrixMovie } from "./cover-matrix-controller";
import { useCoverMatrix } from "./cover-matrix-controller";

export function MobileImagePicker({
  onPick,
  disabled = false,
  children,
  className = "m-card-btn",
}: {
  onPick: (file: File) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <span
      className="m-picker-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        {children}
      </button>

      {/* THIS is what was leaking — force it hidden inline,
          don't rely on CSS */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        style={{ display: "none", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onPick(file);
          e.currentTarget.value = "";
        }}
      />
    </span>
  );
}

export function CoverMatrixReplaceBtn({
  movie,
  cover,
}: {
  movie: MatrixMovie;
  cover: string;
}) {
  const replaceCover = useCoverMatrix((s) => s.replaceCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const busy = busyId === movie.id;

  return (
    <MobileImagePicker
      disabled={busy}
      onPick={(file) => replaceCover(movie, cover, file)}
    >
      Replace
    </MobileImagePicker>
  );
}

export default CoverMatrixReplaceBtn;
