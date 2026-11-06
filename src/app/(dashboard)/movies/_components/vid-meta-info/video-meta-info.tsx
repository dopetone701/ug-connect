"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useActorViewPanel } from "@/stores/use-actor-view-panel";


// [STRIPPED 77 bytes] Actor DNA — truth is D1 actors.photo_url (R2), NOT movie row.
// [STRIPPED 75 bytes] Watch page used to show only movie.cast[].photo (stale).
// Now: show movie photo instantly, then upgrade to D1 photo if D1 has one.
// So if you re-upload Sarah's headshot in Edit, Watch page shows the new photo
// without you having to re-save the movie.
const ACTOR_API_BASE = "https://actor-dna-api.connectu89.workers.dev";


const norm = (s: string) =>
  String(s || "").trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim();


type CastItem = { name: string; photo: string | null; actorId?: string | null };


function parseCastFromMovie(movie: any): CastItem[] {
  if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
    return movie.cast.slice(0, 5).map((c: any) => {
      if (typeof c === "string") return { name: c, photo: null };
      return {
        name: c?.name || c?.actor || c?.fullName || String(c),
        photo: c?.photo || c?.photoUrl || c?.photo_url || c?.image || c?.avatar || c?.profile_path || c?.headshot || null,
        actorId: c?.actorId || c?.actor_id || null,
      };
    });
  }
  const rawActors = String(movie?.actors || movie?.cast || "").trim();
  if (!rawActors) return [];
  try {
    const parsed = JSON.parse(rawActors);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 5).map((c: any) => typeof c === "string" ? { name: c, photo: null } : { name: c?.name || String(c), photo: c?.photo || c?.photoUrl || null });
    }
  } catch {}
  return rawActors.split(",").map((a: string) => a.trim()).filter(Boolean).slice(0, 5).map((name) => ({ name, photo: null }));
}


// [STRIPPED 77 bytes] SYNC TRUE ACTOR — reuse, don't duplicate
// For each name: GET /actors?search=name&limit=3, take EXACT normalized match only.
// If D1 has a photo, use it. If D1 has no photo, keep movie photo (don't blank it).
// If no D1 actor at all, keep movie photo as-is.
async function hydrateFromDNA(cast: CastItem[]): Promise<CastItem[]> {
  if (!cast.length) return cast;
  return Promise.all(cast.map(async (m) => {
    try {
      const res = await fetch(`${ACTOR_API_BASE}/actors?search=${encodeURIComponent(m.name)}&limit=3`);
      if (!res.ok) return m;
      const data = await res.json().catch(() => null);
      const list: any[] = Array.isArray(data) ? data : data?.actors || data?.data || [];
      const hit = list.find((a) => norm(a?.name || "") === norm(m.name));
      if (!hit) return m;
      const actorPhoto = hit.photo || hit.photo_url || hit.photoUrl || null;
      return { ...m, actorId: hit.id || m.actorId || null, photo: actorPhoto || m.photo || null };
    } catch { return m; }
  }));
}


export default function VideoMetaInfo({ movie, descExpanded, setDescExpanded }: any) {
  const baseCast = useMemo(() => parseCastFromMovie(movie), [movie]);
  const [cast, setCast] = useState<CastItem[]>(baseCast);
  const openActorPanel = useActorViewPanel((s) => s.open);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);


  const startLongPress = (m: CastItem) => {
    longPressedRef.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressedRef.current = true;
      openActorPanel({ actorId: m.actorId, name: m.name, photo: m.photo });
    }, 500);
  };


  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };


  // Show movie cast instantly, then upgrade to true D1 photo in background
  useEffect(() => {
    setCast(parseCastFromMovie(movie));
    let cancelled = false;
    hydrateFromDNA(parseCastFromMovie(movie)).then((hydrated) => {
      if (!cancelled) setCast(hydrated);
    });
    return () => { cancelled = true; };
    // Re-run when movie changes (different watch page). movie is the whole row.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.id, movie?.cast, movie?.actors]);


  return (
    <div className="connect-desc-block">
      <h1 className="c-title">{movie.title}</h1>
      <div className="c-meta-row">
        <span className="c-pill">{movie.genre}</span>
        <span className="c-pill muted">{movie.vj}</span>
        <span className="c-pill muted">{movie.year || "2024"}</span>
        <span className="c-pill muted">{movie.rating || "HD"}</span>
      </div>
      <div className="c-desc-wrap">
        <p className={`c-desc ${!descExpanded ? "clamped" : ""}`}>{movie.description}</p>
        {movie.description?.length > 100 && (
          <button className="c-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
            {descExpanded ? "See less" : "...more"}
          </button>
        )}
      </div>


      {cast.length > 0 && (
        <div className="c-cast-row">
          <div className="c-cast-header">Cast</div>
          <div className="c-cast-list">
            {cast.map((m, i) => {
              const initial = m.name.charAt(0).toUpperCase();
              // Photo may be R2 key ("actors/dna/...") or https url — if it's a key, it still
              // works if your movie server serves /r2/. If it 404s, D1 photo (https) will have replaced it above.
              const src = m.photo && (m.photo.startsWith("http") || m.photo.startsWith("blob:") || m.photo.startsWith("data:"))
                ? m.photo
                : m.photo
                ? `https://movie-server-api.connectu89.workers.dev/r2/${m.photo.replace(/^\/+/, "")}`
                : null;
              return (
               <div
                  key={`${m.actorId || m.name}-${i}`}
                  className="c-cast-item"
                  title={m.name}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startLongPress(m);
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    cancelLongPress();
                  }}
                  onPointerLeave={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if (longPressedRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      longPressedRef.current = false;
                    }
                  }}
                >
                  <div className="c-cast-avatar">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={m.name} className="c-cast-img" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <span className="c-cast-fallback">{initial}</span>
                    )}
                  </div>
                  <span className="c-cast-name">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}


     <style jsx>{`
  .c-cast-header {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--text));
    margin-bottom: 10px;
  }
  .c-cast-row {
    margin-top: 14px;
  }
  .c-cast-list {
    display: flex;
    flex-direction: row;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .c-cast-list::-webkit-scrollbar {
    display: none;
  }
  .c-cast-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    width: 64px;
  }
  .c-cast-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    background: hsl(var(--surface-hover));
    border: 1px solid hsl(var(--border));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .c-cast-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .c-cast-fallback {
    font-size: 20px;
    font-weight: 700;
    color: hsl(var(--text));
    line-height: 1;
    text-transform: uppercase;
  }
  .c-cast-name {
    width: 100%;
    font-size: 12px;
    line-height: 1.2;
    text-align: center;
    color: hsl(var(--text) / 0.9);
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`}</style>
    </div>
  );
}

