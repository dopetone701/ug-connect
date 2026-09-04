"use client";
import { useState } from "react";
import "./control-center.css";
import CreateMovieModal from "./components/create-movie-modal";

const tabs = ["Overview", "Users", "Orders", "Settings", "Create"];

export default function Page() {
  const [active, setActive] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="cc-wrap">
      <h1 className="cc-title">Control Center</h1>
      <p className="cc-sub">Admin only - sidebar stays, no reload.</p>

      <div className="cc-tabs">
        {tabs.map(t => (
          <button 
            key={t} 
            onClick={() => {
              if (t === "Create") {
                setShowCreate(true);
              } else {
                setActive(t);
              }
            }} 
            className={`cc-tab ${active===t ? 'active' : ''} ${t==='Create' ? 'cc-tab-create' : ''}`}
          >
            {t === "Create" ? "+ Create" : t}
          </button>
        ))}
      </div>

      <div className="cc-grid">
        <div className="cc-card"><div className="cc-card-label">TOTAL USERS</div><div className="cc-card-value">12,420</div></div>
        <div className="cc-card"><div className="cc-card-label">ACTIVE TAB</div><div className="cc-card-value">{active}</div></div>
        <div className="cc-card"><div className="cc-card-label">STATUS</div><div className="cc-card-value" style={{color:'#22c55e'}}>Online</div></div>
      </div>

      <div className="cc-panel">
        <h3 style={{fontWeight:700, marginBottom:12}}>{active} Content</h3>
        <p style={{color:'#777'}}>This is the {active} section.</p>
      </div>

      {/* MODAL - separate file */}
      <CreateMovieModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
