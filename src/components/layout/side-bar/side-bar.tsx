"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/theme/dna";
import { setTheme } from "@/lib/theme/theme-controller";
import { SIDEBAR_ITEMS } from "./config";
import "./side-bar.css";
import "./side-sheet.css";
import AppTipsIcon from "@/modal-generator/svg-icons/app-tips-icon";
import { useGlobalCast } from "@/stores/use-global-cast";
import SubscriptionIcon from "@/modal-generator/svg-icons/subscription-icon";


const ADMIN_EMAIL = "connectu89@gmail.com";

const customOrder = ['cast', 'lists', 'privacy', 'account', 'tips', 'subscription', 'invite', 'control-center'];

const icons: any = {
  account: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>,
  subscription: (
  <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <SubscriptionIcon
      size={18}
      color="currentColor"
      playColor="hsl(var(--bg))"
      style={{ width: '100%', height: '100%' }}
    />
  </span>
),

  lists: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  cast: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18v3h3c0-1.66-1.34-3-3-3Z"/><path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z"/><path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z"/><path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z"/></svg>,
  tips: <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 20, height: 20, display: 'flex' }}><AppTipsIcon /></span></span>,
  invite: (
    <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 20, height: 20, display: 'block' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
          <line x1="40.7" y1="41.2" x2="59.3" y2="30.8" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="40.7" y1="58.8" x2="59.3" y2="69.2" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="25" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="5.5" />
          <circle cx="75" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="5.5" />
          <circle cx="75" cy="78" r="18" fill="none" stroke="currentColor" strokeWidth="5.5" />
        </svg>
      </span>
    </span>
  ),
  privacy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  control: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></svg>,
  "control-center": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
};

export default function SideBar({ onOpen }: { onOpen?: (id: string) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [curTheme, setCurTheme] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { setOpen: setCastOpen } = useGlobalCast();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = () => {
      const adminFlag = localStorage.getItem("ug-admin") === "true";
      const raw = localStorage.getItem("ug_user");
      let isEmailAdmin = false;
      let isGuest = false;
      try {
        const u = JSON.parse(raw || "null");
        const email = (u?.email || "").toLowerCase().trim();
        isGuest = !!u?.isGuest || !!u?.isAnonymous || !u?.email?.includes("@") || !!localStorage.getItem("ug_guest");
        if (!isGuest && email === ADMIN_EMAIL) isEmailAdmin = true;
      } catch {}

      const finalAdmin = !isGuest && (adminFlag || isEmailAdmin);
      setIsAdmin(finalAdmin);

      if (isEmailAdmin) localStorage.setItem("ug-admin", "true");
      if (isGuest) localStorage.removeItem("ug-admin");

      setCurTheme(localStorage.getItem("ug-theme") || "dark");
    };

    checkAdmin();
    window.addEventListener("ug-auth-changed" as any, checkAdmin);
    window.addEventListener("ug-guest-continue" as any, checkAdmin);
    window.addEventListener("storage", checkAdmin);
    return () => {
      window.removeEventListener("ug-auth-changed" as any, checkAdmin);
      window.removeEventListener("ug-guest-continue" as any, checkAdmin);
      window.removeEventListener("storage", checkAdmin);
    };
  }, []);

  const sortedItems = [...SIDEBAR_ITEMS.filter((i: any) => {
    if ((i as any).admin) return isAdmin;
    return true;
  })].sort((a: any, b: any) => {
    const indexA = customOrder.indexOf(a.id);
    const indexB = customOrder.indexOf(b.id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

   const handleItemClick = (id: string) => {
    if (id === 'cast') {
      window.dispatchEvent(new CustomEvent("ug-close-menu-panel"));
      setTimeout(() => {
        setCastOpen(true);
      }, 320);
      return;
    }

    // ACCOUNT - open direct like bottom bar You btn
    if (id === 'account') {
      window.dispatchEvent(new CustomEvent("ug-close-menu-panel"));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("ug-open-account-sheet"));
      }, 320);
      return;
    }

    // SURGICAL FIX: Control Center opens as PAGE, not as sheet
    if (id === 'control-center' || id === 'control_center' || id === 'control') {
      window.dispatchEvent(new CustomEvent("ug-close-menu-panel"));
      router.push("/control-center-page");
      return;
    }

    onOpen?.(id);
  };


  return (
    <aside className="side-bar">
      <nav className="side-nav">
        <Link href="/movies" className="nav-item live">
          <span className="nav-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            <span className="nav-label">Movies</span>
          </span>
          <span className="live-dot">live</span>
        </Link>
        <div className="nav-divider" />
        {sortedItems.map((i) => (
          <button key={i.id} onClick={() => handleItemClick(i.id)} className="nav-item as-btn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {icons[i.id] || icons.account}
              <span className="nav-label">{i.label}</span>
            </span>
            <span className="nav-right" style={{ opacity: 0.6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
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
    </aside>
  );
}
