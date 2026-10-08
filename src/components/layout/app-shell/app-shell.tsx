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

function hasValidSession() {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("ug_token");
  const user = localStorage.getItem("ug_user");
  const guest = localStorage.getItem("ug_guest_session");
  return (!!token && !!user) || !!guest;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { open, minimized } = useWatchDrawer() as any;
  const { isOpen: isReelsOpen, movies, startIndex, currentMovie, closeReels } = useReelsDrawer() as any;
  const [isMobile, setIsMobile] = useState(false);
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
      if (hasValidSession()) sessionStorage.removeItem("ug_nox_force_auth");
    }
    window.addEventListener("ug-open-signin" as any, openSigninIfNeeded);
    window.addEventListener("ug-auth-changed" as any, handleAuthChanged);
    window.addEventListener("ug-guest-continue" as any, handleAuthChanged);
    return () => {
      window.removeEventListener("ug-open-signin" as any, openSigninIfNeeded);
      window.removeEventListener("ug-auth-changed" as any, handleAuthChanged);
      window.removeEventListener("ug-guest-continue" as any, handleAuthChanged);
    };
  }, []);

  useEffect(() => {
    initTheme();
    const isMobileCheck = window.innerWidth <= 768;
    const isLanding = window.location.pathname === "/";
    const seen = sessionStorage.getItem("ug-intro-seen");
    if (isLanding && !seen && isMobileCheck) setShowIntro(true);
    setChecked(true);
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    document.body.style.background = "#0f1f16";
  }, []);

  useEffect(() => {
    const c = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsDesktop(window.innerWidth >= 1024);
    };
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const isSplit = !isMobile && open && !minimized;
  if (!checked || isChecking) return null;
  const showTopBar = !isReelsPage && !isReelsOpen;
  const showPcInline = isDesktop && !!active;

  return (
    <>
      {showIntro && <IntroVideo onFinished={() => setShowIntro(false)} />}
      <div
        className={`google-shell ${isSplit ? "is-split" : ""} ${isServicesPage ? "is-services" : ""}`}
        style={{ opacity: showIntro ? 0 : 1, pointerEvents: showIntro ? "none" : "auto", overscrollBehavior: "none" as any }}
      >
        <div className="giant-panel" style={{ overscrollBehavior: "contain" } as any}>
          {showTopBar ? <TopBar /> : null}
          <div className="giant-body">
            <SideBar />
            <main className="content-panel">
              <div className="content-scroll" style={{ overscrollBehavior: "contain" } as any}>
                {/* NO FLASH: both mounted, only display toggles */}
                <div style={{ display: showPcInline ? "none" : "block", minHeight: "100%" }}>
                  {children}
                  {isPcOpen && !isMobile ? <PcFaders /> : null}
                </div>
                <div style={{ display: showPcInline ? "block" : "none", minHeight: "100%" }}>
                  <PcSheetHost />
                </div>
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
