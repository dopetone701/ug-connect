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
  }, []);

  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth <= 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const isSplit = !isMobile && open && !minimized;

  if (!checked) {
    return <div style={{ background: "#000", width: "100vw", height: "100dvh" }} />;
  }

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
            <main className="content-panel">
              <div className="content-scroll">{children}</div>
              <WatchDrawer />
            </main>
          </div>
        </div>
        <BottomBar />

        {isReelsOpen && (
          <div className="reels-backdrop" onClick={closeReels}>
            <div className="reels-sheet" onClick={(e) => e.stopPropagation()}>
              <MobilePreview
                movies={movies}
                startIndex={startIndex}
                currentMovie={currentMovie}
                onClose={closeReels}
              />
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