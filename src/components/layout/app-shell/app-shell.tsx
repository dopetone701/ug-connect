"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation"; // ADD
import TopBar from "../top-bar/top-bar";
import SideBar from "../side-bar/side-bar";
import BottomBar from "../bottom-bar/bottom-bar";
import { initTheme } from "@/lib/theme/theme-controller";
import "./app-shell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => { initTheme(); }, []);
  const pathname = usePathname();
  const isWatchPage = pathname?.includes('/movies/watch');

  return (
    <div className="google-shell">
      <div className="giant-panel">
        <TopBar />
        <div className="giant-body">
          <SideBar />
          <main className={`content-panel ${isWatchPage ? 'no-scroll watch-page' : ''}`}>{children}</main>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
