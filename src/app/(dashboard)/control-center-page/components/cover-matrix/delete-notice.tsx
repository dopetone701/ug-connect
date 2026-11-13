"use client";
import "./del-notice.css";

type Props = {
  open: boolean;
  cover: string;
  movieTitle: string;
  isActive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteNotice({ open, cover, movieTitle, isActive, busy, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div
      className="del-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div className="del-card" onClick={(e) => e.stopPropagation()}>
        <div className="del-media">
          <img src={cover} alt="" />
          <div className="del-media-fade" />
          <button
            type="button"
            className="del-x"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            ✕
          </button>
        </div>
        <div className="del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete this cover?</div>
          <div className="del-sub">
            <b>{movieTitle}</b>{isActive ? " • this is the ACTIVE cover" : ""}<br />
            This will delete the file from storage and remove it from the rotation. This can’t be undone.
          </div>
          <div className="del-actions">
            <button
              type="button"
              className="del-btn cancel"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="del-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete Cover"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
