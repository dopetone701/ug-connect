"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { THEMES } from "@/lib/theme/dna";
import { setTheme } from "@/lib/theme/theme-controller";
import { SIDEBAR_ITEMS } from "./config";
import "./side-bar.css";
import "./side-sheet.css";

const icons: any = {
  account: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>,
  subscription: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></svg>,
  lists: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  cast: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18v3h3c0-1.66-1.34-3-3-3Z"/><path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z"/></svg>,
  tips: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
  invite: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11v2M17 11v2"/></svg>,
  privacy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  control: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></svg>,
};

export default function SideBar({ onOpen }: { onOpen?: (id: string) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [curTheme, setCurTheme] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("ug-admin") === "true");
    setCurTheme(localStorage.getItem("ug-theme") || "dark");
  }, []);

  const handleOpen = (id: string) => {
    if (onOpen) onOpen(id);
  };

  return (
    <div className="side-bar-inner">
      <nav className="side-nav">
        <Link href="/movies" className="nav-item live">
          <span className="nav-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            <span className="nav-label">Movies</span>
          </span>
          <span className="live-dot">live</span>
        </Link>
        <div className="nav-divider" />
        {SIDEBAR_ITEMS.filter((i: any) => !(i as any).admin || isAdmin).map((i) => (
          <button key={i.id} onClick={() => handleOpen(i.id)} className="nav-item as-btn">
            <span className="nav-left">{icons[i.id] || icons.account}<span className="nav-label">{i.label}</span></span>
          </button>
        ))}
      </nav>
      <div className="settings-section">
        <button className="settings-toggle" onClick={() => setShowSettings(v => !v)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.04A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.01a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06A2 2 0 1 1 19.8 7l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.04A1.7 1.7 0 0 0 19.4 15Z"/></svg>
          Settings
        </button>
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-row">Change Theme</div>
            <div className="theme-grid-mini">
              {THEMES.map(t=>(
                <button key={t.id} className={`theme-dot ${curTheme===t.id?'is-active':''}`} data-theme-dot={t.id} onClick={()=>{setTheme(t.id); setCurTheme(t.id);}} title={t.label}></button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="side-footer"><a>Privacy</a><a>Terms</a><a>Help</a></div>
    </div>
  );
}