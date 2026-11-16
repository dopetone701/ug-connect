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

type CommentItem = {
  id: string;
  movieId?: string | null;
  movieTitle?: string;
  text: string;
  createdAt?: number | string | null;
  target?: string;
};

type LikeItem = {
  id: string;
  movieId?: string | null;
  movieTitle?: string;
  type?: string;
  createdAt?: number | string | null;
};

type ShareItem = {
  id: string;
  movieId?: string | null;
  movieTitle?: string;
  channel?: string;
  target?: string;
  createdAt?: number | string | null;
};

type EngagementData = {
  comments?: CommentItem[];
  likes?: LikeItem[];
  shares?: ShareItem[];
};

type TabId = "comments" | "likes" | "shares";

function formatDate(v: number | string | null | undefined) {
  if (!v) return "";
  const d = new Date(typeof v === "number" ? v : String(v));
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
}

function CoverThumb({ title, cover }: { title?: string; cover?: string | null }) {
  if (cover) {
    return (
      <img
        src={cover}
        alt={title || "Movie"}
        style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.1)" }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  const letter = (title || "M").trim().charAt(0).toUpperCase() || "M";
  return (
    <div
      style={{
        width: 48,
        height: 68,
        borderRadius: 10,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 800,
        background: "linear-gradient(160deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))",
        color: "#fff",
      }}
    >
      {letter}
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 140;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          lineHeight: 1.45,
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? undefined : 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "inherit",
          opacity: 0.92,
        }}
      >
        {text}
      </div>

      {!expanded && isLong && (
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -2,
            height: 22,
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))",
            borderRadius: "0 0 8px 8px",
          }}
        />
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 6,
            padding: 0,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            opacity: 0.95,
          }}
        >
          {expanded ? "Show less ↑" : "View all ↓"}
        </button>
      )}
    </div>
  );
}

export default function UserEngagementMonitor({ userId }: DrawerProps) {
  const [data, setData] = useState<EngagementData | null>(null);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("comments");

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await adminFetch<EngagementData>(`/admin/users/${userId}/engagement`);
        if (!dead) setData(d || {});
      } catch {
        if (!dead) setError("Engagement not available yet — deploy ug-admin-api with /engagement route");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, [userId]);

  // ── Same as Activity: get movies for covers/titles ──
  useEffect(() => {
    try {
      const c = localStorage.getItem("ug-all-movies");
      if (c) {
        const p = JSON.parse(c);
        if (Array.isArray(p) && p.length) {
          setAllMovies(p.map(normalize));
          return;
        }
      }
    } catch {}
    fetch(MOVIE_API, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list = d.movies || d.data || d || [];
        if (Array.isArray(list) && list.length) {
          const norm = list.map(normalize);
          setAllMovies(norm);
          try {
            localStorage.setItem("ug-all-movies", JSON.stringify(norm));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const byId = useMemo(() => {
    const m = new Map();
    allMovies.forEach((x: any) => {
      if (x?.id != null) m.set(String(x.id), x);
    });
    return m;
  }, [allMovies]);

  const movieOf = (movieId?: string | null) => {
    if (!movieId) return null;
    return byId.get(String(movieId)) || null;
  };
  const titleOf = (movieId?: string | null, fallback?: string) => {
    const m = movieOf(movieId);
    return m?.title || m?.name || fallback || (movieId ? `Movie ${movieId}` : "App");
  };
  const coverOf = (movieId?: string | null) => {
    const m = movieOf(movieId);
    return m?.cover_url || m?.cover || null;
  };

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  if (loading)
    return (
      <UserDrawerShell title="Engagement">
        <div className="ud-card">Loading engagement...</div>
      </UserDrawerShell>
    );

  if (error)
    return (
      <UserDrawerShell title="Engagement">
        <div className="ud-card">{error}</div>
      </UserDrawerShell>
    );

  const comments = data?.comments || [];
  const likes = data?.likes || [];
  const shares = data?.shares || [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "comments", label: `Comments (${comments.length})` },
    { id: "likes", label: `Likes (${likes.length})` },
    { id: "shares", label: `Shares (${shares.length})` },
  ];

  return (
    <UserDrawerShell title="Engagement">
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

      {tab === "comments" &&
        (comments.length === 0 ? (
          <div className="ud-card">No comments yet.</div>
        ) : (
          <div className="ud-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {comments.map((c) => (
              <div key={c.id} className="ud-row" style={{ display: "flex", gap: 12, cursor: "default", alignItems: "flex-start", minWidth: 0 }}>
                <CoverThumb title={titleOf(c.movieId, c.movieTitle)} cover={coverOf(c.movieId)} />
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div className="ud-row-label" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {titleOf(c.movieId, c.movieTitle)}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <ExpandableText text={c.text} />
                  </div>
                  <div className="ud-row-hint" style={{ marginTop: 6 }}>
                    {c.movieId ? `Movie ID: ${c.movieId}` : "App comment"} {c.createdAt ? ` · ${formatDate(c.createdAt)}` : ""}
                  </div>
                </span>
                {c.movieId && (
                  <button
                    type="button"
                    onClick={() => copy(c.id, String(c.movieId))}
                    style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {copied === c.id ? "✓ Copied" : "Copy ID"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

      {tab === "likes" &&
        (likes.length === 0 ? (
          <div className="ud-card">No likes yet.</div>
        ) : (
          <div className="ud-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {likes.map((l) => (
              <div key={l.id} className="ud-row" style={{ display: "flex", gap: 12, cursor: "default", alignItems: "center", minWidth: 0 }}>
                <CoverThumb title={titleOf(l.movieId, l.movieTitle)} cover={coverOf(l.movieId)} />
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div className="ud-row-label" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {l.movieId ? titleOf(l.movieId, l.movieTitle) : l.movieTitle || "Comment"}
                  </div>
                  <div className="ud-row-hint">
                    {l.movieId ? `Movie ID: ${l.movieId}` : l.type || ""} {l.createdAt ? ` · ${formatDate(l.createdAt)}` : ""}
                  </div>
                </span>
                {l.movieId && (
                  <button
                    type="button"
                    onClick={() => copy(l.id, String(l.movieId))}
                    style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {copied === l.id ? "✓ Copied" : "Copy ID"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

      {tab === "shares" &&
        (shares.length === 0 ? (
          <div className="ud-card">No shares yet.</div>
        ) : (
          <div className="ud-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shares.map((s) => (
              <div key={s.id} className="ud-row" style={{ display: "flex", gap: 12, cursor: "default", alignItems: "center", minWidth: 0 }}>
                <CoverThumb title={titleOf(s.movieId, s.movieTitle)} cover={coverOf(s.movieId)} />
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div className="ud-row-label" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {s.movieId ? titleOf(s.movieId, s.movieTitle) : s.movieTitle || "App"}
                  </div>
                  <div className="ud-row-hint">
                    {s.movieId ? `Movie ID: ${s.movieId}` : "App share"} {s.channel ? ` · ${s.channel}` : ""} {s.createdAt ? ` · ${formatDate(s.createdAt)}` : ""}
                  </div>
                </span>
                {s.movieId && (
                  <button
                    type="button"
                    onClick={() => copy(s.id, String(s.movieId))}
                    style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {copied === s.id ? "✓ Copied" : "Copy ID"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

      <p className="ud-user-meta" style={{ marginTop: 12, textAlign: "left" }}>
        Read-only — admin view only
      </p>
    </UserDrawerShell>
  );
}
