"use client";
import { useState, useEffect } from "react";
import type {
  MovieType,
  CastMember,
  SeasonDraft,
  MoviePayload,
} from "../types";
import type { MovieCategoryId } from "../constants";

// [STRIPPED 77 bytes] Actor DNA — same as Create/Edit MovieDetailsFields
const ACTOR_API_BASE = "https://actor-dna-api.connectu89.workers.dev";

type InitialMovieData = MoviePayload & {
  id?: string;
  category?: string;
  origin?: string;
  country?: string;
};

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch { return []; }
  }
  return [];
}

function getMovieCategory(movie?: InitialMovieData): MovieCategoryId | "" {
  if (!movie) return "";
  const value = movie.category || movie.origin || movie.country || "";
  return value as MovieCategoryId | "";
}

function mapSeasons(value: unknown): SeasonDraft[] {
  const source = parseArray<any>(value);
  return source.map((season, seasonIndex) => ({
    id: season.id || crypto.randomUUID(),
    name: season.name || `Season ${seasonIndex + 1}`,
    episodes: (Array.isArray(season.episodes) ? season.episodes : []).map((episode: any) => ({
      id: episode.id || crypto.randomUUID(),
      title: episode.title || "",
      main_url: episode.main_url || episode.video_url || "",
      preview_url: episode.preview_url || null,
      file: null,
      objectUrl: null,
      progress: 0,
      status: "done" as const,
    })),
  }));
}

// [STRIPPED 77 bytes] Normalize cast from movie row -> picker shape
// Movie row cast can be: [{name, photo}], ["Name"], or JSON string.
// We keep movie photo as fallback — Actor DNA photo wins if it exists,
// because backfill copies movie photo -> actor, and new headshots go to actor.
type CastDraft = CastMember & {
  actorId?: string | null;
  photoUrl?: string | null;
  isExisting?: boolean;
  _file?: File | null;
};

function normalizeCast(raw: unknown): CastDraft[] {
  const arr = parseArray<any>(raw);
  return arr.slice(0, 5).map((c: any) => {
    if (typeof c === "string") return { name: c, photo: null, actorId: null, photoUrl: null, isExisting: false } as CastDraft;
    const name = c?.name || c?.actor || c?.fullName || "";
    const photo = c?.photo || c?.image || c?.avatar || c?.profile_path || c?.headshot || c?.photoUrl || null;
    return {
      name: String(name),
      photo: photo || null,
      photoUrl: c?.photoUrl || null,
      actorId: c?.actorId || c?.actor_id || null,
      isExisting: Boolean(c?.actorId || c?.actor_id),
    } as CastDraft;
  }).filter((c) => c.name.trim());
}

const norm = (s: string) =>
  s.trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim();

// [STRIPPED 77 bytes] Hydrate cast from D1 on open
// [STRIPPED 77 bytes] For each cast name: GET /actors?search=name&limit=3, take EXACT normalized match only.
// [STRIPPED 77 bytes] - actorId = D1 id (so Photo pick uploads to existing actor, not create duplicate)
// [STRIPPED 77 bytes] - photo = actor photo (R2) if exists, else keep movie photo
// [STRIPPED 77 bytes] - isExisting = true only on exact match — "Rambo" must NOT match "Rambo Jr"
// If actor has no photo yet but movie does, we keep movie photo in UI — Save's sync-movie
// will copy it to the actor (fixed Worker) so next open it comes from D1.
async function hydrateCast(cast: CastDraft[]): Promise<CastDraft[]> {
  if (!cast.length) return cast;
  const out = await Promise.all(
    cast.map(async (m) => {
      if (m.actorId) return m; // already linked (e.g. re-open after Create)
      try {
        const res = await fetch(`${ACTOR_API_BASE}/actors?search=${encodeURIComponent(m.name)}&limit=3`);
        if (!res.ok) return m;
        const data = await res.json().catch(() => null);
        const list: any[] = Array.isArray(data) ? data : data?.actors || data?.data || [];
        // EXACT match only — prevents "Michael" matching "Michael Scofield"
        const hit = list.find((a) => norm(a?.name || "") === norm(m.name));
        if (!hit) return m;
        const actorPhoto = hit.photo || hit.photo_url || hit.photoUrl || null;
        return {
          ...m,
          actorId: hit.id,
          isExisting: true,
          photoUrl: actorPhoto || m.photoUrl || null,
          // Actor photo wins; movie photo is fallback (watch page shows movie photo, picker should match)
          photo: actorPhoto || m.photo || null,
        } as CastDraft;
      } catch { return m; }
    })
  );
  return out;
}

export function useEditMovieForm(initialData?: InitialMovieData) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [type, setType] = useState<MovieType>("Single");
  const [year, setYear] = useState("");
  const [actors, setActors] = useState("");
  const [cast, setCast] = useState<CastMember[]>([]);
  const [description, setDescription] = useState("");
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);
  const [category, setCategory] = useState<MovieCategoryId | "">("");
  const [castHydrating, setCastHydrating] = useState(false);
  const [vj_slogan, setVjSlogan] = useState("");


  // Populate the form whenever a different movie is loaded.
  useEffect(() => {
    if (!initialData) return;
    let cancelled = false;

    setTitle(initialData.title || "");
    setGenre(initialData.genre || "");
    setVj(initialData.vj || "VJ Junior");
    setType((initialData.type as MovieType) || "Single");
    setYear(initialData.year != null ? String(initialData.year) : "");
    setDescription(initialData.description || "");
    setCategory(getMovieCategory(initialData));
    setSeasons(mapSeasons(initialData.seasons));
    setVj(initialData.vj || "VJ Junior");
    setVjSlogan((initialData as any).vj_slogan || (initialData as any).slogan || "");


    // Cast: normalize FIRST (so UI shows instantly from movie row, with movie photos),
    // then hydrate from D1 in background (adds actorId + R2 photo where available).
    const rawCast = normalizeCast(initialData.cast);
    // If movie has no cast array but has actors string, build cast from it
    const fromActorsString: CastDraft[] = rawCast.length > 0 ? rawCast : String(initialData.actors || "")
      .split(",").map((a) => a.trim()).filter(Boolean).slice(0, 5)
      .map((name) => ({ name, photo: null, actorId: null, photoUrl: null, isExisting: false } as CastDraft));

    setActors(initialData.actors || fromActorsString.map((c) => c.name).join(", "));
    setCast(fromActorsString as CastMember[]);

    // Hydrate — do NOT block UI, do NOT clear cast on failure
    if (fromActorsString.length > 0) {
      setCastHydrating(true);
      hydrateCast(fromActorsString).then((hydrated) => {
        if (cancelled) return;
        setCast(hydrated as CastMember[]);
        // Keep actors string in sync with hydrated names (names unchanged, but safe)
        setActors((prev) => prev || hydrated.map((c) => c.name).join(", "));
      }).finally(() => { if (!cancelled) setCastHydrating(false); });
    }

    return () => { cancelled = true; };
  }, [initialData]);

  const reset = () => {
    setTitle("");
    setGenre("");
    setVj("VJ Junior");
    setVjSlogan("");
    setType("Single");
    setYear("");
    setActors("");
    setCast([]);
    setDescription("");
    setSeasons([]);
    setCategory("");
    setCastHydrating(false);
  };

  const isValid = () => {
    return title.trim().length > 0 && year.trim().length > 0;
  };

  return {
    title, genre, vj, vj_slogan, type, year, actors, cast, description, seasons, category,
    castHydrating,
   setTitle, setGenre, setVj, setVjSlogan, setType, setYear, setActors, setCast, setDescription, setSeasons, setCategory,
    reset, isValid,
  };
}

