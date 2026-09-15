"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import TopBar from "../top-bar/top-bar";
import SideBar from "../side-bar/side-bar";
import BottomBar from "../bottom-bar/bottom-bar";
import { initTheme } from "@/lib/theme/theme-controller";
import "./app-shell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { initTheme(); }, []);
  
  const isWatch = pathname?.includes("/movies/watch");

  return (
    <div className={isWatch ? "google-shell is-watch" : "google-shell"}>
      {isWatch && (
        <style>{`
          @media(max-width:768px){
            .google-shell.is-watch .giant-panel > .top-bar,
            .google-shell.is-watch header {
              display:none !important;
            }
            .google-shell.is-watch .content-panel {
              padding-top:0 !important;
              margin-top:0 !important;
            }
          }
        `}</style>
      )}

      <div className="giant-panel">
        <TopBar />
        <div className="giant-body">
          <SideBar />
          <main className="content-panel">{children}</main>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
