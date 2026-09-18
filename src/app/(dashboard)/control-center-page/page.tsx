"use client";
import { useState } from "react";
import "./control-center.css";
import CreateMovieModal from "./components/create-movie-modal";
import EditMovieModal from "./components/edit-movie-modal";
import AppLogoManager from "./components/app-logo-manager";

const tabs = ["Overview", "Users", "Orders", "Settings", "Create", "Edit Movie", "Logo"];

export default function Page() {
  const [active, setActive] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
              } else if (t === "Edit Movie") {
                setShowEdit(true);
              } else {
                setActive(t);
              }
            }}
            className={`cc-tab ${active === t ? 'active' : ''} ${t === 'Create' ? 'cc-tab-create' : ''} ${t === 'Edit Movie' ? 'cc-tab-edit' : ''} ${t === 'Logo' ? 'cc-tab-logo' : ''}`}
          >
            {t === "Create" ? "+ Create" : t === "Edit Movie" ? "✏️ Edit Movie" : t === "Logo" ? "🎨 Logo" : t}
          </button>
        ))}
      </div>

      <div className="cc-grid">
        <div className="cc-card"><div className="cc-card-label">TOTAL USERS</div><div className="cc-card-value">12,420</div></div>
        <div className="cc-card"><div className="cc-card-label">ACTIVE TAB</div><div className="cc-card-value">{active}</div></div>
        <div className="cc-card"><div className="cc-card-label">STATUS</div><div className="cc-card-value" style={{color:'#22c55e'}}>Online</div></div>
      </div>

      <div className="cc-panel">
        {active === "Logo" ? (
          <AppLogoManager />
        ) : (
          <>
            <h3 style={{fontWeight:700, marginBottom:12}}>{active} Content</h3>
            <p style={{color:'#777'}}>This is the {active} section.</p>
          </>
        )}
      </div>

      {/* MODALS */}
      <CreateMovieModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditMovieModal open={showEdit} onClose={() => setShowEdit(false)} />
    </div>
  );
}
