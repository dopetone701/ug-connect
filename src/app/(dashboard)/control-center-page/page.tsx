"use client";
import { useState } from "react";
import "./control-center.css";

import CreateMovieModal from "./components/create-movie/create-movie-modal";
import EditMovieModal from "./components/edit-movie/edit-movie-modal";
import AppLogoManager from "./components/app-logo-manager";

// --- ONLY INJECTION: Movie Wall Controller Panel ---
import MovieWallControllerPanel, { WallVjBattleChip } from "./components/movie-wall-controller/movie-wall-controller-panel";

// --- ONLY INJECTION: Cover Matrix Panel ---
import CoverMatrixPanel, { CoverMatrixChip } from "./components/cover-matrix/cover-matrix-panel";

// --- ONLY INJECTION: Title Matrix Panel ---
import TitleMatrixPanel, { TitleMatrixChip } from "./components/title-matrix/title-matrix-panel";

// --- ONLY INJECTION: User Drawer System ---
import UserDrawerHost from "./components/users-list/core/drawers/user-drawer-host";
import { useUserDrawer } from "./components/users-list/core/store/use-user-drawer";

// --- USERS LIST ---
import { useUsersPage } from "./components/users-list/core/hooks/use-users-page";
import { UserRow } from "./components/users-list/lists/user-row";

const tabs = ["Overview", "Users", "Orders", "Settings", "Create", "Edit Movie", "Logo"];

function UsersList() {
  const { items, loading, error, loadMore, hasMore, retry } = useUsersPage();
  const openDrawer = useUserDrawer((s) => s.open);

  if (loading && items.length === 0) return <p>Syncing users...</p>;
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button className="cc-tab" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (items.length === 0) return <p>No users found.</p>;

  return (
    <div>
      {items.map((user) => (
        <div
          key={user.id}
          onClick={() => openDrawer("hub", { userId: user.id })}
          style={{ cursor: "pointer" }}
        >
          <UserRow user={user} />
        </div>
      ))}
      {hasMore && (
        <button className="cc-tab" onClick={loadMore} style={{ marginTop: 12 }}>
          Load more
        </button>
      )}
    </div>
  );
}

export default function Page() {
  const [active, setActive] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="cc-wrap">
      <h1 className="cc-title">Control Center</h1>
      <p className="cc-sub">Admin only - sidebar stays, no reload.</p>

      <div className="cc-tabs">
        {tabs.map((t) => (
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
            className={`cc-tab ${active === t ? "active" : ""} ${t === "Create" ? "cc-tab-create" : ""} ${t === "Edit Movie" ? "cc-tab-edit" : ""} ${t === "Logo" ? "cc-tab-logo" : ""}`}
          >
            {t === "Create" ? "+ Create" : t === "Edit Movie" ? "✏️ Edit Movie" : t === "Logo" ? "🎨 Logo" : t}
          </button>
        ))}

        {/* --- CHIP TOGETHER WITH OTHER CHIPS --- */}
        <WallVjBattleChip />
        <CoverMatrixChip />
        <TitleMatrixChip />
      </div>

      <div className="cc-grid">
        <div className="cc-card">
          <div className="cc-card-label">TOTAL USERS</div>
          <div className="cc-card-value">12,420</div>
        </div>
        <div className="cc-card">
          <div className="cc-card-label">ACTIVE TAB</div>
          <div className="cc-card-value">{active}</div>
        </div>
        <div className="cc-card">
          <div className="cc-card-label">STATUS</div>
          <div className="cc-card-value" style={{ color: "#22c55e" }}>
            Online
          </div>
        </div>
      </div>

      <div className="cc-panel">
        {active === "Logo" ? (
          <AppLogoManager />
        ) : active === "Users" ? (
          <UsersList />
        ) : (
          <>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{active} Content</h3>
            <p style={{ color: "#777" }}>This is the {active} section.</p>
          </>
        )}
      </div>

      {/* MODALS */}
      <CreateMovieModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditMovieModal open={showEdit} onClose={() => setShowEdit(false)} />

      {/* --- ONLY INJECTION: Empty Panel (hidden until chip tapped) --- */}
      <MovieWallControllerPanel />

      {/* --- ONLY INJECTION: Cover Matrix Panel (hidden until chip tapped) --- */}
      <CoverMatrixPanel />

      {/* --- ONLY INJECTION: Title Matrix Panel (hidden until chip tapped) --- */}
      <TitleMatrixPanel />

      {/* --- ONLY INJECTION: User Drawer System (hidden until a drawer opens) --- */}
      <UserDrawerHost />
    </div>
  );
}