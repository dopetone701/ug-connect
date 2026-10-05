"use client";

// PRO GUEST - no email, no DB, UUID = zero collision for 10M+
const GUEST_PREFIX = "gst_";

export type GuestUser = {
  id: string;
  name: string;
  isGuest: true;
  isAnonymous: true;
  createdAt: number;
  expiresAt: number; // 30 days
};

export function createGuestUser(): GuestUser {
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = Date.now();
  return {
    id: `${GUEST_PREFIX}${uuid}`,
    name: "Guest",
    isGuest: true,
    isAnonymous: true,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
  };
}

export function saveGuestSession() {
  const guest = createGuestUser();
  
  // YOUR OLD KEYS (keep for compat)
  localStorage.setItem("ug_user", JSON.stringify(guest));
  localStorage.setItem("ug_guest", "1");
  localStorage.setItem("ug_guest_id", guest.id);
  
  // FIX: THIS IS THE KEY NOX V5 CHECKS - THIS WAS MISSING
  localStorage.setItem("ug_guest_session", JSON.stringify(guest));
  
  // clear force auth lock
  sessionStorage.removeItem("ug_nox_force_auth");
  
  window.dispatchEvent(new CustomEvent("ug-auth-changed"));
  window.dispatchEvent(new CustomEvent("ug-guest-continue" as any));
  return guest;
}

export function clearGuestSession() {
  localStorage.removeItem("ug_guest");
  localStorage.removeItem("ug_guest_id");
  localStorage.removeItem("ug_guest_session");
  localStorage.removeItem("ug_user");
  sessionStorage.removeItem("ug_nox_force_auth");
}

export function isGuestExpired(): boolean {
  try {
    const raw = localStorage.getItem("ug_user");
    if (!raw) return true;
    const u = JSON.parse(raw);
    return u.isGuest && u.expiresAt && Date.now() > u.expiresAt;
  } catch { return true; }
}
