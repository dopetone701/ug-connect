"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { THEMES } from "@/lib/theme/dna";
import { setTheme } from "@/lib/theme/theme-controller";
import "./side-bar.css";

const nav = [
  {
    href: "/dashboard",
    label: "Home",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 10.25 12 3.5l8.5 6.75" />
        <path d="M5.5 9.5v9.25A1.75 1.75 0 0 0 7.25 20.5h9.5a1.75 1.75 0 0 0 1.75-1.75V9.5" />
        <path d="M9.5 20.5v-6.75h5v6.75" />
      </svg>
    ),
  },
  { href: "/movies", label: "Movies", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg> },
  {
    href: "/ug-foods",
    label: "UG Foods",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 11.5h14" />
        <path d="M6.25 11.5a5.75 5.75 0 0 1 11.5 0" />
        <path d="M4 11.5v1.25a5.25 5.25 0 0 0 5.25 5.25h5.5A5.25 5.25 0 0 0 20 12.75V11.5" />
        <path d="M7 7V4" />
        <path d="M12 7V3" />
        <path d="M17 7V4" />
      </svg>
    ),
  },
  {
    href: "/mobile-money",
    label: "Mobile Money",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.75" y="5" width="18.5" height="14" rx="2.5" />
        <path d="M2.75 9.5h18.5" />
        <path d="M16.25 14.25h2.25" />
      </svg>
    ),
  },

  

  {
  href: "/salons",
  label: "Salons",
  locked: true,
  svg: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M5 21v-3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" />
      <path d="M13 21v-3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" />
      <path d="M8 11v2" />
      <path d="M16 11v2" />
    </svg>
  ),
},
  {
    href: "/jobs",
    label: "Jobs",
    locked: true,
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7.25" width="18" height="13.25" rx="2.25" />
        <path d="M8 7.25V5.5A2.25 2.25 0 0 1 10.25 3.25h3.5A2.25 2.25 0 0 1 16 5.5v1.75" />
        <path d="M3 11.5h18" />
        <path d="M10 11.5v1.25a2 2 0 0 0 4 0V11.5" />
      </svg>
    ),
  },
  {
    href: "/beds-near-u",
    label: "Beds Near U",
    locked: true,
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 18.5V8.25" />
        <path d="M20 18.5V8.25" />
        <path d="M4 14.25h16" />
        <path d="M4 18.5h16" />
        <path d="M6.25 14.25V9.75h5.5a2.75 2.75 0 0 1 2.75 2.75v1.75" />
        <path d="M6.25 9.75V7.5a2.25 2.25 0 0 1 2.25-2.25h7a2.25 2.25 0 0 1 2.25 2.25v6.75" />
      </svg>
    ),
  },

  { href: "/control-center-page", label: "Control Center", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></svg> },

];

export default function SideBar() {
  const path = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside className="side-bar">
      <nav className="side-nav">
        {nav.map((i) => (
          <Link key={i.href} href={i.href} className={`nav-item ${path === i.href ? "active" : ""}`}>
            <span className="nav-left">
              {i.svg}
              <span className="nav-label">{i.label}</span>
            </span>
            {i.locked && <span className="soon">soon</span>}
          </Link>
        ))}
      </nav>

      <div className="settings-section">
        <button className="settings-toggle" onClick={()=>setShowSettings(v=>!v)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.04A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.01a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06A2 2 0 1 1 19.8 7l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.04A1.7 1.7 0 0 0 19.4 15Z" />
          </svg>
          Settings
        </button>
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-row">Change Theme</div>
            <div className="theme-grid-mini">
              {THEMES.map(t=>(
                <button key={t.id} className="theme-dot" data-theme-dot={t.id} onClick={()=>setTheme(t.id)} title={t.label}></button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="side-footer">
        <a>Privacy</a>
        <a>Terms</a>
        <a>Help</a>
        <a>About</a>
      </div>
    </aside>
  );
}
