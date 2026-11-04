// actor-dna.ts - UG Connect Actor DNA
// Does NOT touch movies table. Only talks to actor-dna-api worker.
// Safe: all calls in try/catch, never blocks movie save.

const DNA_URL = "https://actor-dna-api.connectu89.workers.dev";

export type DnaCastMember = {
  name: string;
  photo?: string | null;
};

export type DnaActor = {
  id: string;
  name: string;
  normalized_name?: string;
  photo?: string | null;
  photo_key?: string | null;
  photo_url?: string | null;
  bio?: string;
  movieCount?: number;
  created_at?: string;
  updated_at?: string;
};

export type DnaMovie = {
  id: string;
  title: string;
  genre?: string;
  year?: number;
  cover_url?: string | null;
  poster?: string | null;
  category?: string;
};

// ---------------------------------------------------
// MAIN: Sync a movie's cast to Actor DNA
// Call AFTER saveMovie / updateMovie succeeds
// ---------------------------------------------------
export async function syncMovieCast(
  movieId: string,
  cast: DnaCastMember[] | any[]
): Promise<{ success: boolean; synced?: number; actors?: DnaActor[] }> {
  if (!movieId || !cast) return { success: false };
  // Even empty cast is valid - it clears links for that movie
  const cleanCast = (cast || [])
    .filter((c) => c && typeof c.name === "string" && c.name.trim())
    .map((c) => ({ name: c.name.trim() }));

  try {
    const res = await fetch(`${DNA_URL}/actors/sync-movie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, cast: cleanCast }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("actor DNA sync failed", data);
      return { success: false };
    }
    return { success: true, synced: data.synced, actors: data.actors };
  } catch (e) {
    console.warn("actor DNA sync failed", e);
    return { success: false };
  }
}

// ---------------------------------------------------
// Search actors
// ---------------------------------------------------
export async function searchActors(
  search = "",
  page = 1,
  limit = 20
): Promise<{ actors: DnaActor[]; page: number; limit: number }> {
  try {
    const res = await fetch(
      `${DNA_URL}/actors?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
    );
    const data = await res.json().catch(() => ({}));
    return { actors: data.actors || [], page: data.page || page, limit: data.limit || limit };
  } catch {
    return { actors: [], page, limit };
  }
}

// ---------------------------------------------------
// Get one actor by ID
// ---------------------------------------------------
export async function getActorById(id: string): Promise<DnaActor | null> {
  if (!id) return null;
  try {
    const res = await fetch(`${DNA_URL}/actors/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.actor || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------
// Get one actor by name (exact, normalized)
// ---------------------------------------------------
export async function getActorByName(name: string): Promise<DnaActor | null> {
  if (!name?.trim()) return null;
  try {
    const res = await fetch(`${DNA_URL}/actors/by-name/${encodeURIComponent(name.trim())}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.actor || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------
// Get filmography for an actor
// ---------------------------------------------------
export async function getActorMovies(
  actorId: string,
  page = 1,
  limit = 20
): Promise<{ actor: DnaActor | null; movies: DnaMovie[]; total: number }> {
  if (!actorId) return { actor: null, movies: [], total: 0 };
  try {
    const res = await fetch(
      `${DNA_URL}/actors/${encodeURIComponent(actorId)}/movies?page=${page}&limit=${limit}`
    );
    const data = await res.json().catch(() => ({}));
    return {
      actor: data.actor || null,
      movies: data.movies || [],
      total: data.total || 0,
    };
  } catch {
    return { actor: null, movies: [], total: 0 };
  }
}

// ---------------------------------------------------
// Resolve cast to existing actors WITHOUT creating
// Useful for showing "already exists" in UI
// ---------------------------------------------------
export async function resolveCast(
  cast: DnaCastMember[]
): Promise<DnaActor[]> {
  if (!cast?.length) return [];
  try {
    const res = await fetch(`${DNA_URL}/actors/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cast: cast.map((c) => ({ name: c.name })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    return data.actors || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------
// Backfill helper - call from admin only
// Loops until hasMore = false
// ---------------------------------------------------
export async function backfillAll(
  batchSize = 100,
  onProgress?: (info: { processed: number; total: number }) => void
): Promise<{ total: number }> {
   let cursor: string | null = null;
  let total = 0;
  let hasMore = true;
  let guard = 0;

  while (hasMore && guard < 100) {
    guard++;
    const backfillUrl: string = cursor
      ? `${DNA_URL}/actors/backfill?batchSize=${batchSize}&cursor=${encodeURIComponent(cursor)}`
      : `${DNA_URL}/actors/backfill?batchSize=${batchSize}`;
    const backfillRes: Response = await fetch(backfillUrl, { method: "POST" });
    const backfillData: any = await backfillRes.json().catch(() => ({}));
    total += backfillData.processed || 0;
    onProgress?.({ processed: backfillData.processed || 0, total });
    cursor = backfillData.nextCursor || null;
    hasMore = !!backfillData.hasMore;
    if (!hasMore) break;
  }
  return { total };

}

// ---------------------------------------------------
// Upload / replace actor portrait
// Updates everywhere because filmography reads from actor row
// ---------------------------------------------------
export async function uploadActorPhoto(
  actorId: string,
  file: File
): Promise<DnaActor | null> {
  if (!actorId || !file) return null;
  try {
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch(`${DNA_URL}/actors/${encodeURIComponent(actorId)}/photo`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return null;
    return data?.actor || null;
  } catch {
    return null;
  }
}
