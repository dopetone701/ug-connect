"use client";
import "./edit-sheet.css";
import { useEffect } from "react";

export default function GuestEditSheet() {
  // If user signs in while this sheet is open, close this sheet
  // EditSheet.tsx will then mount the real form
  useEffect(() => {
    const checkAndClose = () => {
      try {
        const token = localStorage.getItem("ug_token");
        const raw = localStorage.getItem("ug_user");
        if (!token || !raw) return;
        const u = JSON.parse(raw);
        if (!u.isGuest) {
          // Real user now - close guest sheet container
          window.dispatchEvent(new CustomEvent("ug-close-sheet" as any));
        }
      } catch {}
    };
    window.addEventListener("ug-auth-changed" as any, checkAndClose);
    window.addEventListener("storage" as any, checkAndClose);
    return () => {
      window.removeEventListener("ug-auth-changed" as any, checkAndClose);
      window.removeEventListener("storage" as any, checkAndClose);
    };
  }, []);

  const openSignIn = () => {
    window.dispatchEvent(
      new CustomEvent("ug-open-signin" as any, {
        detail: { force: true },
      })
    );
    window.dispatchEvent(new CustomEvent("ug-close-sheet" as any));
  };

  return (
    <div className="edit-sheet-root guest-edit-root">
      <div className="edit-header">
        <div className="edit-avatar-wrap">
          <div className="edit-avatar-inner">
            <span>G</span>
          </div>
        </div>
        <p className="edit-sub">Guest account</p>
      </div>

      <div className="guest-edit-body">
        <h3 className="guest-title">Sign in to customise your profile</h3>
        <p className="guest-desc">
          Create an account to upload your avatar, save your info and sync across devices.
        </p>
        <button className="edit-save-btn" onClick={openSignIn}>
          Sign In
        </button>
      </div>
    </div>
  );
}

