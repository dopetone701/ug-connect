// edit-movie/lib/update-movie.ts - FIXED (v2)
// 1) PUT movie, 2) sync cast to actor-dna-api, 3) upload new headshots to R2 actors/dna/

import { API_URL } from "../constants";
import type { MoviePayload, CastMember } from "../types";

// [STRIPPED 77 bytes] Defined locally — do NOT import from constants unless you added it there.
// If edit-movie/constants.ts exports ACTOR_API_BASE, delete this line and import it — never both.
const ACTOR_API_BASE = "https://actor-dna-api.connectu89.workers.dev";

const norm = (s: string) =>
  s.trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim();

const isBlob = (v: any) => typeof v === "string" && v.startsWith("blob:");
const cleanPhoto = (v: any) => (typeof v === "string" && !isBlob(v) ? v : null);

// [STRIPPED 77 bytes] `castWithFiles` is the DRAFT list from state — NOT payload.cast.
// [STRIPPED 77 bytes] Why: payload is JSON — JSON cannot carry a File.
// [STRIPPED 77 bytes] If you only pass payload.cast, new headshots never upload (file is stripped).
// EditMovieModal Save MUST call:
//   await updateMovie(movieId, payload, cast);
// where `cast` is the hook state (has _file / file / actorId / photoUrl).
export async function updateMovie(movieId: string, payload: MoviePayload, castWithFiles?: CastWithFile[]) {
   const body = {
    title: payload.title?.trim(),
    genre: payload.genre?.trim(),
    vj: payload.vj?.trim(),
    vj_slogan: (payload as any).vj_slogan?.trim() || "",
    type: payload.type,

    year: payload.year || null,
    actors: payload.actors?.trim(),
    cast: payload.cast,
    description: payload.description?.trim(),
    cover_url: payload.cover_url,
    main_url: payload.main_url || null,
    video_url: payload.main_url || null,
    preview_urls: payload.preview_urls || [],
    seasons: payload.seasons || [],
    category: (payload as any).category || "",
    origin: (payload as any).origin || (payload as any).category || "",
    country: (payload as any).country || (payload as any).category || "",
  };

  const res = await fetch(`${API_URL}/${movieId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed ${res.status}: ${text}`);
  }
  const result = await res.json();

  // [STRIPPED 77 bytes] ACTOR DNA SYNC
  try {
    // Prefer the live draft list (has Files) — fall back to payload.cast (no Files, photo-only sync)
    await syncMovieCastWithPhotos(movieId, castWithFiles || (payload.cast as CastWithFile[]));
  } catch (e) {
    console.warn("actor DNA sync skipped", e);
  }
  return result;
}

// [STRIPPED 77 bytes] MovieDetailsFields uses `_file`, older code used `file` — accept BOTH.
// [STRIPPED 77 bytes] Your pasted file only checked `c.file`, but the fixed MovieDetailsFields sets `_file`.
// [STRIPPED 77 bytes] Result: new headshots would NEVER upload. Fixed here.
type CastWithFile = CastMember & {
  file?: File | null;
  _file?: File | null;
  actorId?: string | null;
  photoUrl?: string | null;
  isExisting?: boolean;
};

const getFile = (c: CastWithFile) => {
  const f = (c as any)._file ?? (c as any).file;
  return f instanceof File ? f : null;
};

export async function syncMovieCastWithPhotos(movieId: string, cast: CastWithFile[]) {
  if (!Array.isArray(cast)) return;
  const syncCast = cast
    .filter((c) => c?.name?.trim())
    .map((c) => ({
      name: c.name.trim(),
      // [STRIPPED 77 bytes] Never send blob: to Worker — Worker ignores it, but send null instead.
      photo: cleanPhoto(c.photoUrl || c.photo),
    }));

  const syncRes = await fetch(`${ACTOR_API_BASE}/actors/sync-movie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ movieId, cast: syncCast }),
  });
  const syncData = await syncRes.json().catch(() => null);
  if (!syncRes.ok) { console.warn("sync-movie failed", syncData); return syncData; }

  const byName = new Map<string, string>();
  for (const a of syncData?.actors || []) {
    if (a?.name && a?.id) byName.set(norm(a.name), a.id);
  }

  for (const c of cast) {
    const file = getFile(c);
    if (!file) continue;
    const actorId = c.actorId || byName.get(norm(c.name));
    if (!actorId) continue;
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const up = await fetch(`${ACTOR_API_BASE}/actors/${actorId}/photo`, { method: "POST", body: fd });
      if (!up.ok) console.warn("actor photo upload failed for", c.name, await up.text());
    } catch (e) { console.warn("actor photo upload error for", c.name, e); }
  }
  return syncData;
}

export async function fetchMovieById(movieId: string) {
  const res = await fetch(`${API_URL}/${movieId}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch movie failed ${res.status}`);
  const data = await res.json();
  const movie = data.movie || data.data || data;

  try {
    if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
      const hydrated = await Promise.all(
        movie.cast.map(async (c: any) => {
          const name = (c?.name || "").trim();
          if (!name) return c;
          try {
            const r = await fetch(`${ACTOR_API_BASE}/actors?search=${encodeURIComponent(name)}&limit=3`);
            const d = await r.json().catch(() => null);
            const list: any[] = Array.isArray(d) ? d : d?.actors || [];
            // [STRIPPED 77 bytes] EXACT match only. Your version took [0] — search "Michael"
            // [STRIPPED 77 bytes] could return "Michael Scofield" first and link the wrong actor.
            const hit = list.find((a) => norm(a?.name || "") === norm(name));
            if (hit) {
              const actorPhoto = hit.photo || hit.photo_url || null;
              return {
                ...c,
                name: hit.name || name,
                actorId: hit.id,
                photoUrl: actorPhoto || c.photoUrl || c.photo || null,
                photo: actorPhoto || c.photo || null,
                isExisting: true,
              };
            }
          } catch {}
          return c;
        })
      );
      movie.cast = hydrated;
      if (typeof movie.actors === "string") movie.actors = hydrated.map((c: any) => c.name).join(", ");
    }
  } catch (e) { console.warn("hydrate actor photos skipped", e); }
  return movie;
}

