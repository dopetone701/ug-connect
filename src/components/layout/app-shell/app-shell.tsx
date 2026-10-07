"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import TopBar from "../top-bar/top-bar";
import SideBar from "../side-bar/side-bar";
import BottomBar from "../bottom-bar/bottom-bar";

import { initTheme } from "@/lib/theme/theme-controller";

import WatchDrawer from "@/app/(dashboard)/movies/_components/watch-drawer";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";

import MobilePreview from "@/app/(dashboard)/movies/watch/[id]/mobile-preview";
import IntroVideo from "../../intro/intro-video";

import "./app-shell.css";

import { useGlobalCast } from "@/stores/use-global-cast";
import Cast from "../top-bar/cast";
import CastSwipeClose from "../top-bar/cast-swipe-close";

import { useSideSheet } from "@/stores/use-side-sheet";

import SigninModals from "@/app/auth-system/signin-modals";
import { useNoxSpy } from "@/app/auth-system/nox-spy";

/* =========================================================
   SESSION
   ========================================================= */

function hasValidSession() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("ug_token");
  const user = localStorage.getItem("ug_user");
  const guest = localStorage.getItem("ug_guest_session");

  return (!!token && !!user) || !!guest;
}

/* =========================================================
   DEVICE DETECTION
   IMPORTANT:
   This intentionally does NOT rely on width alone.
   A phone in landscape must remain MOBILE.
   ========================================================= */

function isPhoneDevice() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return false;
  }

  const ua = navigator.userAgent || "";

  /* Standard mobile/tablet browsers */
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      ua
    );

  /* Touch-capable device */
  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  /* iPadOS Safari pretending to be desktop */
  const isIPadDesktopMode =
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;

  /* Modern Chromium device hint */
  const isNewMobileFlag =
    (navigator as Navigator & {
      userAgentData?: {
        mobile?: boolean;
      };
    }).userAgentData?.mobile === true;

  /* Coarse pointer normally means finger/touch interaction */
  const isCoarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    isMobileUA ||
    isIPadDesktopMode ||
    isNewMobileFlag ||
    isCoarsePointer ||
    isTouch
  );
}

/* =========================================================
   DEVICE MODE
   ========================================================= */

type DeviceMode = "mobile" | "desktop";

function getDeviceMode(): DeviceMode {
  if (typeof window === "undefined") {
    return "desktop";
  }

  /*
   * IMPORTANT:
   * Device detection gets priority over viewport width.
   *
   * Therefore:
   *
   * iPhone portrait   -> mobile
   * iPhone landscape  -> mobile
   * Android portrait  -> mobile
   * Android landscape -> mobile
   * iPad               -> mobile
   * iPad desktop mode  -> mobile
   *
   * Only a genuine non-touch desktop/tablet-sized environment
   * falls through to the width check.
   */
  if (isPhoneDevice()) {
    return "mobile";
  }

  return window.innerWidth <= 1024 ? "mobile" : "desktop";
}

/* =========================================================
   APP SHELL
   ========================================================= */

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /* =======================================================
     GLOBAL DRAWERS
     ======================================================= */

  const { open, minimized } = useWatchDrawer() as any;

  const {
    isOpen: isReelsOpen,
    movies,
    startIndex,
    currentMovie,
    closeReels,
  } = useReelsDrawer() as any;

  const {
    isOpen: isCastOpen,
    setOpen: setCastOpen,
  } = useGlobalCast();

  const { active } = useSideSheet();

  /* =======================================================
     DEVICE MODE
     ======================================================= */

  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    return getDeviceMode();
  });

  const isMobile = deviceMode === "mobile";
  const isDesktop = deviceMode === "desktop";

  /* =======================================================
     INTRO
     ======================================================= */

  const [showIntro, setShowIntro] = useState(false);
  const [checked, setChecked] = useState(false);

  /* =======================================================
     AUTH
     ======================================================= */

  const [authOpen, setAuthOpen] = useState(false);

  const [authMode, setAuthMode] = useState<
    "signin" | "signup"
  >("signin");

  const { isChecking } = useNoxSpy();

  /* =======================================================
     PAGE FLAGS
     ======================================================= */

  const isServicesPage =
    pathname === "/" ||
    pathname === "/dashboard";

  const isReelsPage =
    pathname?.startsWith("/reels") ||
    pathname?.startsWith("/reel");

  /* =======================================================
     AUTH EVENTS
     ======================================================= */

  useEffect(() => {
    const openSigninIfNeeded = () => {
      if (hasValidSession()) {
        sessionStorage.removeItem("ug_nox_force_auth");
        setAuthOpen(false);
        return;
      }

      setAuthMode("signin");
      setAuthOpen(true);
    };

    const handleAuthChanged = () => {
      if (hasValidSession()) {
        sessionStorage.removeItem("ug_nox_force_auth");
        setAuthOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      const pending =
        sessionStorage.getItem("ug_nox_force_auth");

      if (
        pending === "1" &&
        !hasValidSession()
      ) {
        setAuthMode("signin");
        setAuthOpen(true);
      }

      if (hasValidSession()) {
        sessionStorage.removeItem("ug_nox_force_auth");
      }
    }

    window.addEventListener(
      "ug-open-signin",
      openSigninIfNeeded as EventListener
    );

    window.addEventListener(
      "ug-auth-changed",
      handleAuthChanged as EventListener
    );

    window.addEventListener(
      "ug-guest-continue",
      handleAuthChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        "ug-open-signin",
        openSigninIfNeeded as EventListener
      );

      window.removeEventListener(
        "ug-auth-changed",
        handleAuthChanged as EventListener
      );

      window.removeEventListener(
        "ug-guest-continue",
        handleAuthChanged as EventListener
      );
    };
  }, []);

  /* =======================================================
     THEME + DEVICE CHECK
     ======================================================= */

  useEffect(() => {
    initTheme();

    const checkDevice = () => {
      const mode = getDeviceMode();

      /*
       * Single source of truth.
       *
       * We NEVER independently set mobile and desktop.
       */
      setDeviceMode(mode);

      /* -----------------------------------------------
         INTRO
         ----------------------------------------------- */

      const isLanding =
        window.location.pathname === "/";

      const seen =
        sessionStorage.getItem("ug-intro-seen");

      /*
       * Intro only on mobile-sized landing experience.
       */
      if (
        isLanding &&
        !seen &&
        mode === "mobile"
      ) {
        setShowIntro(true);
      }

      setChecked(true);
    };

    checkDevice();

    /*
     * Resize:
     * catches actual desktop resizing.
     */
    window.addEventListener(
      "resize",
      checkDevice,
      { passive: true }
    );

    /*
     * Orientation:
     * catches phone portrait <-> landscape.
     */
    window.addEventListener(
      "orientationchange",
      checkDevice,
      { passive: true }
    );

    /*
     * Some mobile browsers update visual viewport
     * without firing a normal resize reliably.
     */
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        checkDevice
      );
    }

    return () => {
      window.removeEventListener(
        "resize",
        checkDevice
      );

      window.removeEventListener(
        "orientationchange",
        checkDevice
      );

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          checkDevice
        );
      }
    };
  }, []);

  /* =======================================================
     WAIT UNTIL DEVICE + AUTH CHECKS ARE READY
     ======================================================= */

  if (!checked || isChecking) {
    return null;
  }

  /* =======================================================
     TOP BAR
     ======================================================= */

  const showTopBar =
    !isReelsPage &&
    !isReelsOpen;

  /* =======================================================
     SHELL
     ======================================================= */

  return (
    <>
      {/* ===================================================
          INTRO
          =================================================== */}

      {showIntro && (
        <IntroVideo
          onFinished={() => setShowIntro(false)}
        />
      )}

      {/* ===================================================
          MAIN APP
          =================================================== */}

      <div
        className={[
          "google-shell",
          isMobile
            ? "is-mobile"
            : "is-desktop",
          isServicesPage
            ? "is-services"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-device-mode={deviceMode}
        data-mobile={isMobile ? "true" : "false"}
        data-desktop={isDesktop ? "true" : "false"}
        style={{
          opacity: showIntro ? 0 : 1,
          pointerEvents: showIntro
            ? "none"
            : "auto",
        }}
      >
        {/* =================================================
            GIANT PANEL
            ================================================= */}

        <div className="giant-panel">

          {/* =================================================
              TOP BAR
              ================================================= */}

          {showTopBar ? (
            <TopBar />
          ) : null}

          {/* =================================================
              MAIN BODY
              ================================================= */}

          <div className="giant-body">

            {/* =================================================
                DESKTOP SIDEBAR
                HARD RENDER GUARD
                ================================================= */}

            {isDesktop ? (
              <SideBar />
            ) : null}

            {/* =================================================
                CONTENT
                ================================================= */}

            <main className="content-panel">

              <div className="content-scroll">

                <div
                  className="content-inner"
                  style={{
                    display: "block",
                    minHeight: "100%",
                  }}
                >
                  {children}
                </div>

                {/* =================================================
                    WATCH DRAWER
                    ================================================= */}

                <WatchDrawer />

              </div>
            </main>
          </div>
        </div>

        {/* ===================================================
            MOBILE BOTTOM BAR
            HARD RENDER GUARD
            =================================================== */}

        {isMobile ? (
          <BottomBar />
        ) : null}

        {/* ===================================================
            REELS
            =================================================== */}

        {isReelsOpen ? (
          <div
            className="reels-backdrop"
            onClick={closeReels}
          >
            <div
              className="reels-sheet"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <MobilePreview
                movies={movies}
                startIndex={startIndex}
                currentMovie={currentMovie}
                onClose={closeReels}
              />
            </div>
          </div>
        ) : null}

        {/* ===================================================
            GLOBAL CAST
            =================================================== */}

        {isCastOpen ? (
          <CastSwipeClose
            isOpen={isCastOpen}
            onClose={() =>
              setCastOpen(false)
            }
          >
            <Cast />
          </CastSwipeClose>
        ) : null}
      </div>

      {/* =====================================================
          AUTH MODALS
          ===================================================== */}

      <SigninModals
        isOpen={authOpen}
        mode={authMode}
        onClose={() => {
          if (
            typeof window !== "undefined"
          ) {
            sessionStorage.removeItem(
              "ug_nox_force_auth"
            );
          }

          setAuthOpen(false);
        }}
        onSwitchMode={setAuthMode}
        onSuccess={() => {
          if (
            typeof window !== "undefined"
          ) {
            sessionStorage.removeItem(
              "ug_nox_force_auth"
            );
          }

          setAuthOpen(false);

          window.dispatchEvent(
            new CustomEvent(
              "ug-auth-changed"
            )
          );
        }}
      />
    </>
  );
}
