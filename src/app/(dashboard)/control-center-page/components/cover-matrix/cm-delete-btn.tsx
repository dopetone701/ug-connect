"use client";

import { useState } from "react";
import DeleteNotice from "./delete-notice";
import type { MatrixMovie } from "./cover-matrix-controller";
import { useCoverMatrix } from "./cover-matrix-controller";

export function CoverMatrixDeleteBtn({
  movie,
  cover,
  isActive,
}: {
  movie: MatrixMovie;
  cover: string;
  isActive: boolean;
}) {
  const deleteCover = useCoverMatrix((s) => s.deleteCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const [showDelete, setShowDelete] = useState(false);
  const busy = busyId === movie.id;

  return (
    <span
      className="m-delete-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="m-card-btn danger"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDelete(true);
        }}
      >
        Delete
      </button>

      <DeleteNotice
        open={showDelete}
        cover={cover}
        movieTitle={movie.title}
        isActive={isActive}
        busy={busy}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          deleteCover(movie, cover);
        }}
      />
    </span>
  );
}

export default CoverMatrixDeleteBtn;
