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

import { usePcFadersDrawer } from "@/stores/use-pc-faders-drawer";
import PcFaders from "../top-bar/faders-drawer/pc-faders";

import PcSheetHost from "../side-bar/pc-sheets/pc-sheet-host";
import { useSideSheet } from "@/stores/use-side-sheet";

import SigninModals from "@/app/auth-system/signin-modals";
import { useNoxSpy } from "@/app/auth-system/nox-spy";
import { useVideoSettingsDrawer } from "@/stores/use-video-settings-drawer";

import SubscriptionFlowHost from "@/components/subscription/flow/flow-host";

function hasValidSession() {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("ug_token");
  const user = localStorage.getItem("ug_user");
  const guest = localStorage.getItem("ug_guest_session");
  return (!!token && !!user) || !!guest;
}

function isPhoneDevice() {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  const ua = navigator.userAgent;
  const phoneUA = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
  const touchDevice = navigator.maxTouchPoints > 0;
  if (phoneUA) return true;
  if (touchDevice && width <= 1024) return true;
  return false;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settingsOpen = useVideoSettingsDrawer((s) => s.isOpen);
  const closeVideoSettings = useVideoSettingsDrawer((s) => s.close);
  const qualityOptions = useVideoSettingsDrawer((s) => s.qualityOptions);
  const selectedQuality = useVideoSettingsDrawer((s) => s.selectedQuality);
  const selectQuality = useVideoSettingsDrawer((s) => s.selectQuality);

  const { open, minimized } = useWatchDrawer() as any;
  const { isOpen: isReelsOpen, movies, startIndex, currentMovie, closeReels } = useReelsDrawer() as any;

  const [isMobile, setIsMobile] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [checked, setChecked] = useState(false);

  const { isOpen: isCastOpen, setOpen: setCastOpen } = useGlobalCast();
  const { isOpen: isPcOpen } = usePcFadersDrawer() as any;
  const { active } = useSideSheet();

  const isServicesPage = pathname === "/" || pathname === "/dashboard";
  const isReelsPage = pathname?.startsWith("/reels") || pathname?.startsWith("/reel");

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { isChecking } = useNoxSpy();

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
      const pending = sessionStorage.getItem("ug_nox_force_auth");
      if (pending === "1" && !hasValidSession()) {
        setAuthMode("signin");
        setAuthOpen(true);
      }
      if (hasValidSession()) {
        sessionStorage.removeItem("ug_nox_force_auth");
      }
    }
    window.addEventListener("ug-open-signin", openSigninIfNeeded as EventListener);
    window.addEventListener("ug-auth-changed", handleAuthChanged as EventListener);
    window.addEventListener("ug-guest-continue", handleAuthChanged as EventListener);
    return () => {
      window.removeEventListener("ug-open-signin", openSigninIfNeeded as EventListener);
      window.removeEventListener("ug-auth-changed", handleAuthChanged as EventListener);
      window.removeEventListener("ug-guest-continue", handleAuthChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    initTheme();
    const phone = isPhoneDevice();
    const isLanding = window.location.pathname === "/";
    const seen = sessionStorage.getItem("ug-intro-seen");
    if (isLanding && !seen && phone) setShowIntro(true);
    setChecked(true);
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    document.body.style.background = "#0f1f16";
  }, []);

  useEffect(() => {
    const updateDeviceMode = () => {
      const phone = isPhoneDevice();
      setIsMobile(phone);
      setIsDesktop(!phone);
    };
    updateDeviceMode();
    window.addEventListener("resize", updateDeviceMode);
    window.addEventListener("orientationchange", updateDeviceMode);
    return () => {
      window.removeEventListener("resize", updateDeviceMode);
      window.removeEventListener("orientationchange", updateDeviceMode);
    };
  }, []);

  if (!checked || isChecking) return null;

  const isSplit = isDesktop && open && !minimized;
  const showTopBar = !isReelsPage && !isReelsOpen;
  const showPcInline = isDesktop && !!active;
  const showSideBarInShell = isDesktop && !isServicesPage;

  const showPcFadersInline = isDesktop && isPcOpen;

  return (
    <>
      {showIntro && <IntroVideo onFinished={() => setShowIntro(false)} />}

      <div
        className={["google-shell", isSplit ? "is-split" : "", isServicesPage ? "is-services" : "", isMobile ? "is-phone" : "is-desktop"].filter(Boolean).join(" ")}
        style={{ opacity: showIntro ? 0 : 1, pointerEvents: showIntro ? "none" : "auto", overscrollBehavior: "none" }}
      >
        <div className="giant-panel" style={{ overscrollBehavior: "contain" }}>
          {showTopBar ? <TopBar /> : null}

          <div className="giant-body">
            {showSideBarInShell ? <SideBar /> : null}

            <main className="content-panel">
              <div className="content-scroll" style={{ overscrollBehavior: "contain" }}>
                {showPcFadersInline ? (
                  <PcFaders />
                ) : (
                  <>
                    <div style={{ display: showPcInline ? "none" : "block", minHeight: "100%" }}>
                      {children}
                    </div>

                    <div style={{ display: showPcInline ? "block" : "none", minHeight: "100%" }}>
                      <PcSheetHost />
                    </div>
                  </>
                )}

                <WatchDrawer />
              </div>
            </main>
          </div>
        </div>

        <BottomBar />

        {isReelsOpen ? (
          <div className="reels-backdrop" onClick={closeReels}>
            <div className="reels-sheet" onClick={(e) => e.stopPropagation()}>
              <MobilePreview movies={movies} startIndex={startIndex} currentMovie={currentMovie} onClose={closeReels} />
            </div>
          </div>
        ) : null}

        {isCastOpen ? (
          <CastSwipeClose isOpen={isCastOpen} onClose={() => setCastOpen(false)}>
            <Cast />
          </CastSwipeClose>
        ) : null}

        {/* SURGICAL INJECT: Subscription Flow - overlays everything */}
        <SubscriptionFlowHost />
      </div>

      <SigninModals
        isOpen={authOpen}
        mode={authMode}
        onClose={() => {
          if (typeof window !== "undefined") sessionStorage.removeItem("ug_nox_force_auth");
          setAuthOpen(false);
        }}
        onSwitchMode={setAuthMode}
        onSuccess={() => {
          if (typeof window !== "undefined") sessionStorage.removeItem("ug_nox_force_auth");
          setAuthOpen(false);
          window.dispatchEvent(new CustomEvent("ug-auth-changed"));
        }}
      />
    </>
  );
}

