// edit-movie/constants.ts - mirrors create-movie/constants.ts

export const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
export const API_BASE = "https://movie-server-api.connectu89.workers.dev";
export const API_URL = `${API_BASE}/api/movies`;
export const R2_BASE = `${API_BASE}/r2`;
export const FALLBACK = "/movie.jpg";

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB - iPhone safe
export const SINGLE_LIMIT = 90 * 1024 * 1024; // 90MB

export const VJ_OPTIONS = [
  "VJ Junior",
  "VJ Emmy",
  "VJ Jingo",
  "VJ Ice P",
  "VJ Ulio",
  "VJ Mox",
] as const;

export const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Thriller",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Crime",
  "Animation",
  "Family",
  "Fantasy",
] as const;

export const MOVIE_TYPES = [
  { value: "Single", label: "Single Movie" },
  { value: "Mini", label: "Mini Series" },
  { value: "Full", label: "Full Series" },
] as const;

export function cleanKey(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function getR2Url(k?: string | null): string {
  if (!k) return "";
  if (k.startsWith("http")) return k;
  return `${R2_BASE}/${k.replace(/^\//, "")}`;
}

type MovieRecord = {
  main_url?: string | null;
  video_url?: string | null;
  cover_url?: string | null;
  [key: string]: unknown;
};

export function getRawKey(m: MovieRecord, field: string): string | null {
  const rawField = `${field}_raw`;
  let v: string | null = null;
  
  if (m[rawField] && typeof m[rawField] === "string") v = m[rawField] as string;
  else if (m[field] && typeof m[field] === "string") v = m[field] as string;
  else if (m.main_url) v = m.main_url;
  else if (m.video_url) v = m.video_url;

  if (!v) return null;
  if (v.includes("/r2/")) v = v.split("/r2/")[1];
  if (v.startsWith("http")) {
    try {
      v = decodeURIComponent(
        new URL(v).pathname.replace("/r2/", "").replace(/^\/+/, "")
      );
    } catch {
      // keep original
    }
  }
  return v;
}

export function safeId(id: unknown): string {
  return String(id || "").slice(0, 8);
}