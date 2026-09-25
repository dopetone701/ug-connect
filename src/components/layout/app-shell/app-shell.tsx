"use client";
import { useEffect, useState } from "react";
import TopBar from "../top-bar/top-bar";
import SideBar from "../side-bar/side-bar";
import BottomBar from "../bottom-bar/bottom-bar";
import { initTheme } from "@/lib/theme/theme-controller";
import WatchDrawer from "@/app/(dashboard)/movies/_components/watch-drawer";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";
import MobilePreview from "@/app/(dashboard)/movies/watch/[id]/mobile-preview";
import "./app-shell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { open, minimized } = useWatchDrawer() as any;
  const { isOpen: isReelsOpen, movies, startIndex, currentMovie, closeReels } = useReelsDrawer() as any;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { initTheme(); }, []);
  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth <= 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const isSplit = !isMobile && open && !minimized;

  return (
    <div className={`google-shell ${isSplit ? "is-split" : ""}`}>
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

      {/* REELS DRAWER - slides up from bottom */}
      {isReelsOpen && (
        <div className="reels-backdrop" onClick={closeReels}>
          <div className="reels-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="reels-handle" />
            <MobilePreview
              movies={movies}
              startIndex={startIndex}
              currentMovie={currentMovie}
              onClose={closeReels}
            />
          </div>
        </div>
      )}
    </div>
  );
}
