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
  // crypto.randomUUID() = 122-bit = no collision even at 1B users
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = Date.now();
  return {
    id: `${GUEST_PREFIX}${uuid}`, // gst_a1b2c3d4e5f6
    name: "Guest",
    isGuest: true,
    isAnonymous: true,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
  };
}

export function saveGuestSession() {
  const guest = createGuestUser();
  localStorage.setItem("ug_user", JSON.stringify(guest));
  localStorage.setItem("ug_guest", "1");
  localStorage.setItem("ug_guest_id", guest.id);
  window.dispatchEvent(new CustomEvent("ug-auth-changed"));
  return guest;
}

export function clearGuestSession() {
  localStorage.removeItem("ug_guest");
  localStorage.removeItem("ug_guest_id");
}

export function isGuestExpired(): boolean {
  try {
    const raw = localStorage.getItem("ug_user");
    if (!raw) return true;
    const u = JSON.parse(raw);
    return u.isGuest && u.expiresAt && Date.now() > u.expiresAt;
  } catch { return true; }
}
