"use client";
import { useLayoutEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// NOX SPY V5 - GUEST = SIGNED IN, NO BYPASS ALLOWED
const PUBLIC_EXACT = ["/", "/terms", "/privacy", "/cookies", "/about"];

function isPublic(path: string) {
  if (!path) return true;
  if (PUBLIC_EXACT.includes(path)) return true;
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/icon") ||
    path === "/manifest.json"
  ) return true;
  return false;
}

function getSyncStatus() {
  if (typeof window === "undefined") return { isAuthed: false, isGuest: false, isUnknown: true };
  try {
    const token = localStorage.getItem("ug_token");
    const user = localStorage.getItem("ug_user");
    const guest = localStorage.getItem("ug_guest_session");
    const isAuthed = !!token && !!user;
    const isGuest = !!guest;
    const isUnknown = !isAuthed && !isGuest;
    return { isAuthed, isGuest, isUnknown };
  } catch {
    return { isAuthed: false, isGuest: false, isUnknown: true };
  }
}

export function useNoxSpy() {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const checkedPath = useRef("");

  useLayoutEffect(() => {
    if (!pathname) {
      setIsChecking(false);
      return;
    }

    if (checkedPath.current === pathname) {
      setIsChecking(false);
      return;
    }
    checkedPath.current = pathname;

    // On landing, if we have a pending force-auth and STILL no session, keep modal open
    if (pathname === "/" && typeof window !== "undefined") {
      const pending = sessionStorage.getItem("ug_nox_force_auth");
      const { isAuthed, isGuest } = getSyncStatus();
      if (pending === "1" && !isAuthed && !isGuest) {
        window.dispatchEvent(new CustomEvent("ug-open-signin" as any));
        setIsChecking(false);
        return;
      }
      // if guest or authed exists, clear stale flag
      if (isAuthed || isGuest) {
        sessionStorage.removeItem("ug_nox_force_auth");
      }
    }

    // Public routes always allowed
    if (isPublic(pathname)) {
      setIsChecking(false);
      return;
    }

    const { isAuthed, isGuest, isUnknown } = getSyncStatus();

    // ROLE: Guest IS a valid signin procedure - allow authed AND guest
    if (isAuthed || isGuest) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("ug_nox_force_auth");
      }
      setIsChecking(false);
      return;
    }

    // NO BYPASS: Only unknown (no token, no guest session) is blocked
    if (isUnknown) {
      console.warn(`[NOX V5] 🚫 BLOCKED UNKNOWN BYPASS: ${pathname} -> / (force signin)`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ug_nox_force_auth", "1");
        window.dispatchEvent(new CustomEvent("ug-open-signin" as any));
      }
      router.replace("/");
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  return { isChecking };
}
