"use client";
import { useMemo, useState, useEffect } from "react";
import "./control-center.css";
import { useBriefNumbers } from "@/stores/use-brief-numbers";

import CreateMovieModal from "./components/create-movie/create-movie-modal";
import EditMovieModal from "./components/edit-movie/edit-movie-modal";
import AppLogoManager from "./components/app-logo-manager";
import MovieWallControllerPanel, { WallVjBattleChip } from "./components/movie-wall-controller/movie-wall-controller-panel";
import CoverMatrixPanel, { CoverMatrixChip } from "./components/cover-matrix/cover-matrix-panel";
import TitleMatrixPanel, { TitleMatrixChip } from "./components/title-matrix/title-matrix-panel";
import UserDrawerHost from "./components/users-list/core/drawers/user-drawer-host";
import { useUserDrawer } from "./components/users-list/core/store/use-user-drawer";
import { useUsersPage } from "./components/users-list/core/hooks/use-users-page";
import { UserRow } from "./components/users-list/lists/user-row";

const tabs = ["Overview", "Users", "Admins", "Orders", "Settings", "Create", "Edit Movie", "Logo"];

function myIdFromToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("ug_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

type UsersListProps = {
  items: ReturnType<typeof useUsersPage>["items"];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  retry: () => void;
  onlyAdmins: boolean;
  myId: string | null;
};

function UsersList({ items, loading, error, loadMore, hasMore, retry, onlyAdmins, myId }: UsersListProps) {
  const openDrawer = useUserDrawer((s) => s.open);
  const shown = useMemo(() => {
  const base = onlyAdmins
    ? items.filter((u: any) => u.isAdmin === true || (myId && u.id === myId))
    : items;
  if (!myId) return base;
  return [...base].sort((a, b) => (a.id === myId ? -1 : b.id === myId ? 1 : 0));
}, [items, onlyAdmins, myId]);

  if (loading && items.length === 0) return <p>Syncing users...</p>;
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button className="cc-tab" onClick={retry}>Try again</button>
      </div>
    );
  }
  if (shown.length === 0) return <p>{onlyAdmins ? "No admin accounts found." : "No users found."}</p>;

  return (
    <div>
      {onlyAdmins ? <p style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>👑 Admin accounts</p> : null}
      {shown.map((user) => (
        <div key={user.id} onClick={() => openDrawer("hub", { userId: user.id })} style={{ cursor: "pointer" }}>
          <UserRow user={user} isMe={myId ? user.id === myId : false} />
        </div>
      ))}
      {!onlyAdmins && hasMore && (
        <button className="cc-tab" onClick={loadMore} style={{ marginTop: 12 }}>Load more</button>
      )}
    </div>
  );
}

export default function Page() {
  const [active, setActive] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const users = useUsersPage();
  const { briefNumber } = useBriefNumbers();
  const totalUsers = users.counts?.all ?? users.resultCount ?? users.items.length;
  const myId = useMemo(() => myIdFromToken(), []);

  const status = users.error
    ? { text: "Offline", color: "#ef4444" }
    : users.counts
      ? { text: "Online", color: "#22c55e" }
      : { text: "Checking...", color: "#f59e0b" };

  const liveFromList = useMemo(() => {
    const now = Date.now();
    return (users.items || []).filter((u: any) => {
      const t = u?.lastActiveAt ?? u?.last_active ?? u?.lastActive ?? null;
      if (!t) return false;
      const ms = typeof t === "number" ? t : Date.parse(t);
      return !Number.isNaN(ms) && ms >= now - 90000;
    }).length;
  }, [users.items]);

  const liveUsers: number | null =
    (users as any).liveUsers ?? (users.counts as any)?.liveUsers ?? null;
  const displayLive = typeof liveUsers === "number" ? liveUsers : liveFromList;

  useEffect(() => {
    const refresh = () => {
      const u: any = users as any;
      if (typeof u.refetch === "function") u.refetch();
      else if (typeof u.retry === "function") u.retry();
    };
    const id = setInterval(refresh, 5000);
    const onFocus = () => refresh();
    const onVisible = () => { if (!document.hidden) refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cc-wrap">
      <h1 className="cc-title">Control Center</h1>
      <p className="cc-sub">Admin only - sidebar stays, no reload.</p>

      <div className="cc-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              if (t === "Create") setShowCreate(true);
              else if (t === "Edit Movie") setShowEdit(true);
              else setActive(t);
            }}
            className={`cc-tab ${active === t ? "active" : ""} ${t === "Create" ? "cc-tab-create" : ""} ${t === "Edit Movie" ? "cc-tab-edit" : ""} ${t === "Logo" ? "cc-tab-logo" : ""}`}
          >
            {t === "Create" ? "+ Create" : t === "Edit Movie" ? "✏️ Edit Movie" : t === "Logo" ? "🎨 Logo" : t}
          </button>
        ))}
        <WallVjBattleChip />
        <CoverMatrixChip />
        <TitleMatrixChip />
      </div>

      <div className="cc-grid">
        <div className="cc-card">
          <div className="cc-card-label">TOTAL USERS</div>
          <div className="cc-card-value">{users.counts ? briefNumber(totalUsers) : "—"}</div>
        </div>
        <div className="cc-card">
          <div className="cc-card-label">STATUS</div>
          <div className="cc-card-value" style={{ display: "flex", alignItems: "center", gap: 8, color: status.color }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: status.color, flexShrink: 0 }} />
            {status.text} • {briefNumber(displayLive)}
          </div>
        </div>
      </div>

      <div className="cc-panel">
        {active === "Logo" ? (
          <AppLogoManager />
        ) : active === "Users" || active === "Admins" ? (
          <UsersList
            items={users.items}
            loading={users.loading}
            error={users.error}
            loadMore={users.loadMore}
            hasMore={users.hasMore}
            retry={users.retry}
            onlyAdmins={active === "Admins"}
            myId={myId}
          />
        ) : (
          <>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{active} Content</h3>
            <p style={{ color: "#777" }}>This is the {active} section.</p>
          </>
        )}
      </div>

      <CreateMovieModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditMovieModal open={showEdit} onClose={() => setShowEdit(false)} />
      <MovieWallControllerPanel />
      <CoverMatrixPanel />
      <TitleMatrixPanel />
      <UserDrawerHost />
    </div>
  );
}
