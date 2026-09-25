"use client";
import { useState, useEffect } from "react";
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { open, minimized } = useWatchDrawer() as any;
  const { isOpen: isReelsOpen, movies, startIndex, currentMovie, closeReels } = useReelsDrawer() as any;
  const [isMobile, setIsMobile] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [checked, setChecked] = useState(false);
  const { isOpen: isCastOpen, setOpen: setCastOpen } = useGlobalCast();

  useEffect(() => {
    initTheme();
    const isMobileCheck = window.innerWidth <= 768;
    const isLanding = window.location.pathname === "/";
    const seen = sessionStorage.getItem("ug-intro-seen");
    if (isLanding && !seen && isMobileCheck) setShowIntro(true);
    setChecked(true);

    // lock visual viewport so keyboard doesn't push drawers
    const setVH = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--app-vh', `${vh}px`);
    };
    setVH();
    window.visualViewport?.addEventListener('resize', setVH);
    window.visualViewport?.addEventListener('scroll', setVH);
    return () => {
      window.visualViewport?.removeEventListener('resize', setVH);
      window.visualViewport?.removeEventListener('scroll', setVH);
    }
  }, []);

  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth <= 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const isSplit = !isMobile && open && !minimized;

  if (!checked) return <div style={{ background: "#000", width: "100vw", height: "100dvh" }} />;

  return (
    <>
      {showIntro && <IntroVideo onFinished={() => setShowIntro(false)} />}

      <div
        className={`google-shell ${isSplit ? "is-split" : ""}`}
        style={{ opacity: showIntro ? 0 : 1, pointerEvents: showIntro ? "none" : "auto" }}
      >
        <div className="giant-panel">
          <TopBar />
          <div className="giant-body">
            <SideBar />
            {/* THIS is the only container that should scroll */}
            <main className="content-panel">
              <div className="content-scroll">
                {children}
                {/* WRAP ALL CONTENT-LEVEL DRAWERS INSIDE HERE */}
                <WatchDrawer />
              </div>
            </main>
          </div>
        </div>
        
        <BottomBar />

        {/* Portaled fixed overlays - MUST be fixed to viewport, not to panel */}
        {isReelsOpen && (
          <div className="reels-backdrop" onClick={closeReels}>
            <div className="reels-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="reels-handle" />
              <MobilePreview movies={movies} startIndex={startIndex} currentMovie={currentMovie} onClose={closeReels} />
            </div>
          </div>
        )}

        <CastSwipeClose isOpen={isCastOpen} onClose={() => setCastOpen(false)}>
          <Cast />
        </CastSwipeClose>
      </div>
    </>
  );
}