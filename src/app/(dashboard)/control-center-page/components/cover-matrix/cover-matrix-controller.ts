"use client";
import { create } from "zustand";

// --- CHANGE THIS ONE LINE to your creation worker URL ---
export const COVER_WORKER = "https://movie-creation-portal-api.connectu89.workers.dev";
export const R2_BASE = "https://movie-server-api.connectu89.workers.dev/r2";
export const toR2Url = (key: string) => (!key ? "" : key.startsWith("http") ? key : `${R2_BASE}/${encodeURI(key)}`);
export const cleanKey = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "cover";

export type CoverSchedule = { intervalMs: number; nextRotateAt: number | null; activeIndex: number };
export type MatrixMovie = {
  id: string; title: string; vj?: string; genre?: string;
  cover_url: string; cover_url_raw?: string;
  covers: string[]; covers_raw?: string[];
  cover_schedule: CoverSchedule;
};

type State = {
  movies: MatrixMovie[];
  loading: boolean;
  busyId: string | null;
  loadMovies: () => Promise<void>;
  addCover: (movie: MatrixMovie, file: File) => Promise<void>;
  deleteCover: (movie: MatrixMovie, key: string) => Promise<void>;
  replaceCover: (movie: MatrixMovie, oldKey: string, file: File) => Promise<void>;
  setActiveCover: (movie: MatrixMovie, key: string) => Promise<void>;
  scheduleRotate: (movie: MatrixMovie, intervalMs: number) => Promise<void>;
  shuffleOne: (movie: MatrixMovie) => Promise<void>;
  shuffleAll: () => Promise<void>;
  rotateIfDue: () => Promise<void>;
};


async function uploadToR2(file: File, key: string) {
  if (!file || file.size === 0) {
    throw new Error("Selected photo is empty.");
  }

  // Read the photo into a stable binary buffer.
  const buffer = await file.arrayBuffer();

  if (buffer.byteLength === 0) {
    throw new Error("Photo could not be read from your device.");
  }

  const res = await fetch(
    `${COVER_WORKER}/upload-single?key=${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: buffer,
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const j = await res.json().catch(() => ({}));
  return j.key || key;
}


async function api(path: string, method = "GET", body?: any) {
  const res = await fetch(`${COVER_WORKER}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
function normalize(m: any): MatrixMovie {
  let coversRaw: string[] = Array.isArray(m.covers_raw) ? [...m.covers_raw] : (Array.isArray(m.covers) ? [...m.covers] : []);
  // SYNC ACTIVE COVER: if cover_url (from Edit Modal / Wall) is not in covers list, put it first — it IS the active cover
  const activeRaw: string = m.cover_url_raw || (m.cover_url && !m.cover_url.startsWith("http") ? m.cover_url : "");
  const activeUrl: string = m.cover_url || "";
  const hasActive = coversRaw.some((k) => k === activeRaw || toR2Url(k) === activeUrl);
  if (activeRaw && !hasActive) coversRaw = [activeRaw, ...coversRaw];
  else if (!activeRaw && activeUrl && !hasActive) coversRaw = [activeUrl, ...coversRaw];
  // Sync activeIndex to the actual active cover
  const sched = { intervalMs: 24*60*60*1000, nextRotateAt: null, activeIndex: 0, ...(m.cover_schedule || {}) };
  const ai = coversRaw.findIndex((k) => k === activeRaw || toR2Url(k) === activeUrl);
  if (ai >= 0) sched.activeIndex = ai;
  const rawCover = m.cover_url_raw || (m.cover_url && !m.cover_url.startsWith("http") ? m.cover_url : coversRaw[0] || "");
  const fullCover = m.cover_url && m.cover_url.startsWith("http") ? m.cover_url : toR2Url(rawCover || coversRaw[0] || "");
  return {
    id: m.id, title: m.title || "Untitled", vj: m.vj || "", genre: m.genre || "",
    cover_url: fullCover, cover_url_raw: rawCover,
    covers: coversRaw.map(toR2Url), covers_raw: coversRaw,
    cover_schedule: sched,
  };
}

export const useCoverMatrix = create<State>()((set, get) => ({
  movies: [], loading: false, busyId: null,
  loadMovies: async () => {
    set({ loading: true });
    try {
      const j = await api("/movies");
      const list = Array.isArray(j) ? j : (j.movies || j.data || []);
      set({ movies: list.map(normalize) });
    } finally { set({ loading: false }); }
  },
  addCover: async (movie, file) => {
    set({ busyId: movie.id });
    try {
      const key = `covers/${movie.id}-${cleanKey(movie.title)}-${Date.now()}-${cleanKey(file.name || "cover")}.jpg`;
      const uploaded = await uploadToR2(file, key);
      await api(`/movies/${movie.id}/covers`, "POST", { key: uploaded });
      await get().loadMovies();
    } finally { set({ busyId: null }); }
  },
  deleteCover: async (movie, key) => {
    const raw = key.includes("/r2/") ? key.split("/r2/")[1] : (movie.covers_raw?.[movie.covers.indexOf(key)] || key);
    const rawKey = decodeURIComponent(raw);
    set({ busyId: movie.id });
    try { await api(`/movies/${movie.id}/covers?key=${encodeURIComponent(rawKey)}`, "DELETE"); await get().loadMovies(); }
    finally { set({ busyId: null }); }
  },
  replaceCover: async (movie, oldKey, file) => {
    set({ busyId: movie.id });
    try {
      const idx = movie.covers.indexOf(oldKey);
      const oldRaw = movie.covers_raw?.[idx] || oldKey;
      const key = `covers/${movie.id}-${cleanKey(movie.title)}-${Date.now()}-${cleanKey(file.name || "cover")}.jpg`;
      const uploaded = await uploadToR2(file, key);
      await api(`/movies/${movie.id}/covers/replace`, "POST", { oldKey: oldRaw, newKey: uploaded });
      await get().loadMovies();
    } finally { set({ busyId: null }); }
  },
  setActiveCover: async (movie, key) => {
    const idx = movie.covers.indexOf(key);
    const raw = movie.covers_raw?.[idx] || key;
    set({ busyId: movie.id });
    try { await api(`/movies/${movie.id}/covers/activate`, "POST", { key: raw }); await get().loadMovies(); }
    finally { set({ busyId: null }); }
  },
  scheduleRotate: async (movie, intervalMs) => {
    if ((movie.covers?.length || 0) < 2) return; // single cover = schedule ignored, add covers to init schedule mode
    set({ busyId: movie.id });
    try { await api(`/movies/${movie.id}/covers/schedule`, "POST", { intervalMs }); await get().loadMovies(); }
    finally { set({ busyId: null }); }
  },
  shuffleOne: async (movie) => {
    if ((movie.covers?.length || 0) < 2) return; // single cover = no shuffle
    set({ busyId: movie.id });
    try { await api(`/movies/${movie.id}/covers/shuffle`, "POST", {}); await get().loadMovies(); }
    finally { set({ busyId: null }); }
  },
  shuffleAll: async () => {
    for (const m of get().movies) { try { await api(`/movies/${m.id}/covers/shuffle`, "POST", {}); } catch {} }
    await get().loadMovies();
  },
  rotateIfDue: async () => {
    try { const j = await api(`/cover-matrix/rotate-due`, "POST", {}); if (j.rotated?.length) await get().loadMovies(); } catch {}
  },
}));

export function startCoverMatrixJob() {
  if ((globalThis as any).__cmJob) return;
  (globalThis as any).__cmJob = setInterval(() => { useCoverMatrix.getState().rotateIfDue().catch(() => {}); }, 60 * 1000);
}

