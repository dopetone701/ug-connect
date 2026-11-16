"use client";
import { useEffect, useMemo, useState } from "react";
import UserDrawerShell from "../user-drawer-shell";
import type { DrawerProps } from "../drawer.types";
import { adminFetch } from "../../api/admin-http";

const MOVIE_API = "https://movie-server-api.connectu89.workers.dev/api/movies";

const normalize = (x: any) => {
  const preview = x.preview_urls?.[0] || x.preview_url || x.trailer_url || x.video_preview_url || x.preview;
  return {
    ...x,
    id: String(x.id),
    cover: x.cover || x.cover_url,
    cover_url: x.cover || x.cover_url,
    preview_url: preview,
  };
};

type ActivityData = {
  myListIds?: any[];
  recentIds?: any[];
  favIds?: any[];
  watchLaterIds?: any[];
  downloadIds?: any[]; // 👈 waiting to be plugged in
};

type TabId = "my-list" | "continue" | "liked" | "watch-later" | "downloads";

export default function UserActivityMonitor({ userId }: DrawerProps) {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("my-list");

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await adminFetch<ActivityData>(`/admin/users/${userId}/activity`);
        if (!dead) setActivity(d || {});
      } catch (e: any) {
        if (!dead) setError("Activity not available yet — needs /admin/users/:id/activity in ug-admin-api");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [userId]);

  useEffect(() => {
    try {
      const c = localStorage.getItem("ug-all-movies");
      if (c) { const p = JSON.parse(c); if (Array.isArray(p) && p.length) { setAllMovies(p.map(normalize)); return; } }
    } catch {}
    fetch(MOVIE_API, { cache: "no-store" }).then(r => r.json()).then(d => {
      const list = d.movies || d.data || d || [];
      if (Array.isArray(list) && list.length) { const norm = list.map(normalize); setAllMovies(norm); try { localStorage.setItem("ug-all-movies", JSON.stringify(norm)); } catch {} }
    }).catch(() => {});
  }, []);

  const byId = useMemo(() => { const m = new Map(); allMovies.forEach((x: any) => { if (x?.id != null) m.set(String(x.id), x); }); return m; }, [allMovies]);
  const getMovies = (ids: any[]) => { if (!Array.isArray(ids) || !ids.length) return []; return ids.map((id: any) => byId.get(String(id))).filter(Boolean); };

  const myListMovies = getMovies(activity?.myListIds || []);
  const continueMovies = getMovies(activity?.recentIds || []).slice(0, 20);
  const likedMovies = getMovies(activity?.favIds || []);
  const watchLaterMovies = getMovies(activity?.watchLaterIds || []);
  const downloadMovies = getMovies(activity?.downloadIds || []); // 👈 empty until frontend downloads logic exists

  const current = tab === "my-list" ? myListMovies : tab === "continue" ? continueMovies : tab === "liked" ? likedMovies : tab === "watch-later" ? watchLaterMovies : downloadMovies;
  const currentIds = tab === "my-list" ? activity?.myListIds || [] : tab === "continue" ? activity?.recentIds || [] : tab === "liked" ? activity?.favIds || [] : tab === "watch-later" ? activity?.watchLaterIds || [] : activity?.downloadIds || [];

  const copy = async (id: string) => {
    try { await navigator.clipboard.writeText(String(id)); setCopied(String(id)); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  if (loading) return <UserDrawerShell title="Activity"><div className="ud-card">Loading activity...</div></UserDrawerShell>;
  if (error) return <UserDrawerShell title="Activity"><div className="ud-card">{error}</div></UserDrawerShell>;

  const tabs: { id: TabId; label: string }[] = [
    { id: "my-list", label: `My List (${myListMovies.length})` },
    { id: "continue", label: `Continue Watching (${continueMovies.length})` },
    { id: "liked", label: `Liked (${likedMovies.length})` },
    { id: "watch-later", label: `Watch Later (${watchLaterMovies.length})` },
    { id: "downloads", label: `Downloads (${downloadMovies.length})` },
  ];

  return (
    <UserDrawerShell title="Activity">
      <div className="ud-list" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className="ud-btn is-ghost"
            style={{ background: tab === t.id ? "rgba(255,255,255,0.15)" : undefined }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "downloads" ? (
        <div className="ud-card">
          <div>Downloads not built yet in frontend.</div>
          <div className="ud-user-meta" style={{ marginTop: 8 }}>
            Waiting to be plugged in — once you build downloads logic, send downloadIds in /admin/users/:id/activity and they will show here automatically.
          </div>
        </div>
      ) : current.length === 0 ? (
        <div className="ud-card">
          No movies in this list.
          {currentIds.length > 0 && <div className="ud-user-meta" style={{ marginTop: 8 }}>IDs found but movie details not in catalog: {currentIds.slice(0, 5).join(", ")}{currentIds.length > 5 ? ` +${currentIds.length - 5} more` : ""}</div>}
        </div>
      ) : (
        <div className="ud-list">
          {current.map((m: any) => (
            <div key={m.id} className="ud-row" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "default" }}>
              {m.cover_url ? (
                <img src={m.cover_url} alt="" style={{ width: 44, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width: 44, height: 64, borderRadius: 8, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
              )}
              <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div className="ud-row-label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title || m.name || `Movie ${m.id}`}</div>
                <div className="ud-row-hint">ID: {m.id}</div>
              </span>
              <button
                type="button"
                onClick={() => copy(m.id)}
                style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {copied === String(m.id) ? "✓ Copied" : "Copy ID"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="ud-user-meta" style={{ marginTop: 12, textAlign: "left" }}>Read-only mirror of Library — admin view only</p>
    </UserDrawerShell>
  );
}
