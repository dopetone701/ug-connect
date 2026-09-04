"use client";
import { useEffect } from "react";
import TopBar from "../top-bar/top-bar";
import SideBar from "../side-bar/side-bar";
import BottomBar from "../bottom-bar/bottom-bar";
import { initTheme } from "@/lib/theme/theme-controller";
import "./app-shell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => { initTheme(); }, []);
  return (
    <div className="google-shell">
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
