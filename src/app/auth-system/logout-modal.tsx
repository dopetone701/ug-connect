"use client";
import { useState } from "react";
import "./logout-modal.css";
import "./signin-modals.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: { name: string; email: string } | null;
};

export default function LogoutModal({ isOpen, onClose, onConfirm, user }: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ug-modal-overlay" onClick={onClose}>
      <div className="ug-modal-wrap" onClick={onClose}>
        <div className="ug-modal logout-modal-inner" onClick={(e) => e.stopPropagation()}>
          <button className="ug-modal-close" onClick={onClose}>✕</button>

          <h2 className="ug-modal-title">Leave UG Connect?</h2>
          
          <p className="ug-modal-sub">
            {user ? (
              <>
                You are signed in as <strong>{user.name}</strong>
                <br />
                {user.email}
              </>
            ) : (
              "Are you sure you want to logout?"
            )}
          </p>

          <div className="logout-actions">
            <button
              type="button"
              className="ug-btn-primary"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Yes, Logout"}
            </button>

            <button type="button" className="ug-btn-guest" onClick={onClose}>
              Stay Connected →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
