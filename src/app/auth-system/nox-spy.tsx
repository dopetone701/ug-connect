"use client";
import { useLayoutEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// NOX SPY V4 - KEEP MODAL OPEN ACROSS BG CHANGE - PRO
const PUBLIC_EXACT = ["/", "/terms", "/privacy", "/cookies", "/about"];

function isPublic(path: string) {
  if (!path) return true;
  if (PUBLIC_EXACT.includes(path)) return true;
  if (path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/favicon") || path.startsWith("/icon") || path === "/manifest.json") return true;
  return false;
}

function getSyncStatus() {
  if (typeof window === "undefined") return { isAuthed: false, isGuest: false, isUnknown: false };
  try {
    const token = localStorage.getItem("ug_token");
    const user = localStorage.getItem("ug_user");
    const guest = localStorage.getItem("ug_guest_session");
    const isAuthed = !!token && !!user;
    const isGuest = !!guest;
    return { isAuthed, isGuest, isUnknown: !isAuthed && !isGuest };
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

    // If we are on landing and we have pending force auth from previous block, keep modal open
    if (pathname === "/" && typeof window !== "undefined") {
      const pending = sessionStorage.getItem("ug_nox_force_auth");
      if (pending === "1") {
        // Keep flag until modal closed
        window.dispatchEvent(new CustomEvent("ug-open-signin" as any));
        setIsChecking(false);
        return;
      }
    }

    if (isPublic(pathname)) {
      setIsChecking(false);
      return;
    }

    const { isAuthed, isGuest, isUnknown } = getSyncStatus();

    if (isUnknown) {
      console.warn(`[NOX V4] 🚫 BLOCKED: ${pathname} -> keeping modal on landing`);
      // SET FLAG BEFORE REDIRECT - so landing knows to keep modal open
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ug_nox_force_auth", "1");
        window.dispatchEvent(new CustomEvent("ug-open-signin" as any));
      }
      router.replace("/");
      setIsChecking(false);
      return;
    }

    const authOnly = pathname.startsWith("/dashboard") || pathname.startsWith("/favorites") || pathname.startsWith("/settings") || pathname.startsWith("/profile");
    if (isGuest && !isAuthed && authOnly) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ug_nox_force_auth", "1");
        window.dispatchEvent(new CustomEvent("ug-open-signin" as any));
      }
      router.replace("/movies");
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  return { isChecking };
}

