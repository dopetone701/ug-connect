"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./top-bar.css";
import SideBar from "../side-bar/side-bar";

const PLACES = ["Dubai", "Kampala", "London", "New York", "Nairobi", "Toronto", "Doha", "Johannesburg"];

export default function TopBar() {
  const pathname = usePathname();
  const [loc, setLoc] = useState("Dubai");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
const [waOpen, setWaOpen] = useState(false);
const [drawerMode, setDrawerMode] = useState<"menu" | "search">("menu");

  const isAllMoviesPage = pathname?.startsWith("/movies") || pathname?.startsWith("/all-movies");

  useEffect(() => {
    setLoc(localStorage.getItem("ug-loc") || "Dubai");
    setCollapsed(localStorage.getItem("ug-sidebar-collapsed") === "true");
  }, []);

  useEffect(() => {
    if (waOpen) document.body.classList.add("wa-pushed");
    else document.body.classList.remove("wa-pushed");
  }, [waOpen]);

  useEffect(() => {
    setWaOpen(false);
    document.body.classList.remove("wa-pushed");
  }, [pathname]);

  const filtered = PLACES.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 2);

  const toggleSidebar = () => {
    const next =!collapsed;
    setCollapsed(next);
    localStorage.setItem("ug-sidebar-collapsed", String(next));
    document.querySelector('.side-bar')?.classList.toggle('collapsed', next);
    window.dispatchEvent(new CustomEvent("ug-toggle-sidebar", { detail: next }));
  };

  return (
    <>
      <header className={`top-bar ${isAllMoviesPage? 'all-movies-page' : ''}`}>
        <div className="logo">
          <img src="/logo.png" alt="UG Connect" className="logo-img" />
        </div>

        <div className="location-wrap pc-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
         <button className="sidebar-v-toggle big pc-only" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button className="loc-btn" onClick={() => setOpen(v =>!v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {loc} <span className="chev">▾</span>
          </button>
          {open && (
            <div className="loc-dropdown">
              <input className="loc-search" placeholder="Search place..." value={query} onChange={e=>setQuery(e.target.value)} autoFocus />
              {filtered.map(p=>(
                <button key={p} className="loc-item" onClick={()=>{setLoc(p); setOpen(false); setQuery(""); localStorage.setItem("ug-loc", p)}}>
                  {p}
                </button>
              ))}
              {filtered.length===0 && <div className="loc-empty">No match</div>}
            </div>
          )}
        </div>

        <div className="search-wrap desktop-search">
          <svg className="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.3-4.3"/></svg>
          <input className="search" placeholder="Search" />
        </div>

        <div className="right-actions">

          <button className="tv-share-btn mob-only" aria-label="Cast">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />
    <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />
    <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />
    <path d="M5 4h14c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1h-4v-2h3V6H5v3H3V5c0-.55.45-1 1-1h1Z" />
  </svg>
</button>

          {isAllMoviesPage && (
<button
  className="mobile-search-icon"
  aria-label="Search"
  onClick={() => {
    setDrawerMode("search");
    setWaOpen(true);
  }}
>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="6"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
            </button>
          )}
          <button className="grid-btn">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="4" height="4" rx="1"/>
    <rect x="10" y="3" width="4" height="4" rx="1"/>
    <rect x="17" y="3" width="4" height="4" rx="1"/>
    <rect x="3" y="10" width="4" height="4" rx="1"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/>
    <rect x="17" y="10" width="4" height="4" rx="1"/>
    <rect x="3" y="17" width="4" height="4" rx="1"/>
    <rect x="10" y="17" width="4" height="4" rx="1"/>
    <rect x="17" y="17" width="4" height="4" rx="1"/>
  </svg>
</button>

{/* Sliders button */}
<button className="sliders-btn" aria-label="Settings">
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 7H20"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle
      cx="10"
      cy="7"
      r="3"
      fill="currentColor"
    />

    <path
      d="M4 17H20"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle
      cx="15"
      cy="17"
      r="3"
      fill="currentColor"
    />
  </svg>
</button>

<div className="profile">E</div>

          <button
  className="apple-burger"
  aria-label="menu"
onClick={() => {
  setDrawerMode("menu");
  setWaOpen(true);
}}
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rectangle */}
    <rect
      x="4"
      y="4"
      width="16"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />

    {/* Two bars */}
    <path
      d="M4 16H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <path
      d="M4 20H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</button>

        </div>
      </header>

      {waOpen && (
  <div className="wa-mob-panel">

    <div className="wa-mob-top">
  <img
    src="/logo.png"
    alt="UG Connect"
    className="wa-panel-logo"
  />

  {drawerMode === "search" && (
    <div className="wa-filtered-title">
      Filtered Content
    </div>
  )}

  <button
    className="wa-v"
    onClick={() => setWaOpen(false)}
    aria-label="Close"
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  </button>
</div>


    <div className="wa-mob-body">
      <div className="wa-card">

        {drawerMode === "menu" ? (
          <SideBar />
        ) : (
          <div className="mobile-search-panel">

  <div className="mobile-search-input-wrap">

    <svg
      className="mobile-search-icon"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21l-4.3-4.3" />
    </svg>

    <input
      autoFocus
      className="mobile-drawer-search"
      placeholder="Search movies..."
    />

    <button
      className="mobile-search-settings"
      aria-label="Search filters"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7H20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="7" r="3" fill="currentColor" />

        <path
          d="M4 17H20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="15" cy="17" r="3" fill="currentColor" />
      </svg>
    </button>

  </div>

</div>

        )}

      </div>
    </div>

  </div>
)}

    </>
  );
}
