"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./top-bar.css";

const PLACES = ["Dubai", "Kampala", "London", "New York", "Nairobi", "Toronto", "Doha", "Johannesburg"];

export default function TopBar() {
  const pathname = usePathname();
  const [loc, setLoc] = useState("Dubai");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const isAllMoviesPage = pathname?.startsWith("/movies") || pathname?.startsWith("/all-movies");

  useEffect(() => {
    setLoc(localStorage.getItem("ug-loc") || "Dubai");
    setCollapsed(localStorage.getItem("ug-sidebar-collapsed") === "true");
  }, []);

  const filtered = PLACES.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0,2);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("ug-sidebar-collapsed", String(next));
    document.querySelector('.side-bar')?.classList.toggle('collapsed', next);
    window.dispatchEvent(new CustomEvent("ug-toggle-sidebar", { detail: next }));
  };

  return (
    <header className={`top-bar ${isAllMoviesPage ? 'all-movies-page' : ''}`}>
      <div className="logo">
        <img src="/logo.png" alt="UG Connect" className="logo-img" />
      </div>

      <div className="location-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="sidebar-v-toggle big" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button className="loc-btn" onClick={() => setOpen(v => !v)}>
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
        {isAllMoviesPage && (
          <button className="mobile-search-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6"/>
              <path d="M21 21l-4.3-4.3"/>
            </svg>
          </button>
        )}
        <button className="grid-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="17" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/></svg>
        </button>
        <div className="profile">E</div>
        <button className="apple-burger" aria-label="menu"><span></span><span></span><span></span></button>
      </div>
    </header>
  );
}
