 "use client";

import { useEffect, useState, useCallback } from "react";
import { PadlockIcon } from "@/modal-generator/svg-icons/padlock-icon";

// --- 1. Guest check - matches your guest-user-account.tsx keys ---
export function isGuestUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("ug_user");
    if (raw) {
      const u = JSON.parse(raw);
      // expired guest = treat as guest (force sign-in)
      if (u.isGuest) return true;
      if (u.expiresAt && Date.now() > u.expiresAt) return true;
      return false;
    }
    // fallback to your old flags
    if (localStorage.getItem("ug_guest") === "1") return true;
    const id = localStorage.getItem("ug_guest_id") || "";
    if (id.startsWith("gst_")) return true;
    return false;
  } catch {
    return false;
  }
}

export function useIsGuest() {
  const [isGuest, setIsGuest] = useState(false);

  const refresh = useCallback(() => setIsGuest(isGuestUser()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("ug-auth-changed", refresh);
    window.addEventListener("ug-guest-continue", refresh as any);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ug-auth-changed", refresh);
      window.removeEventListener("ug-guest-continue", refresh as any);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return isGuest;
}

// --- 2. Open your existing sign-in modal ---
// Replace this with however your app already opens it.
// If you already have a global event, use that. Otherwise this fallback works:
export function openSignInModal() {
  window.dispatchEvent(new CustomEvent("ug-open-signin"));
  // If your sign-in is in src/app/auth-system/sign-in.tsx and uses a store/context,
  // call that here instead, e.g. setShowSignIn(true)
}

// --- 3. Gate helper for any onPlay handler ---
export function gatePlayIfGuest(onPlay: () => void): boolean {
  if (isGuestUser()) {
    openSignInModal();
    return false; // blocked
  }
  onPlay();
  return true; // allowed
}

// --- 4. Drop-in Locked Play Button for movie cards ---
type LockedPlayButtonProps = {
  onPlay: () => void;
  className?: string;
  size?: number;
};

export function LockedPlayButton({ onPlay, className, size = 22 }: LockedPlayButtonProps) {
  const isGuest = useIsGuest();

  return (
    <button
      type="button"
      aria-label={isGuest ? "Sign in to play" : "Play"}
      className={className}
      onClick={() => gatePlayIfGuest(onPlay)}
      style={{ position: "relative", display: "grid", placeItems: "center" }}
    >
      {isGuest ? (
        // YOUR padlock icon - swap props to match its actual export
        // If it takes className only, use <PadlockIcon className="..." />
        <PadlockIcon width={size} height={size} />
      ) : (
        // your normal play icon - keep what you already use
        <span>▶</span>
      )}
    </button>
  );
}

// --- 5. Optional: small lock badge to overlay on card poster ---
export function GuestLockBadge({ size = 16 }: { size?: number }) {
  const isGuest = useIsGuest();
  if (!isGuest) return null;
  return (
    <span
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        borderRadius: 999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <PadlockIcon width={size} height={size} />
    </span>
  );
}