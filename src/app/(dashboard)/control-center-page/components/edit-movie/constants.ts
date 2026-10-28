// edit-movie/constants.ts - mirrors create-movie/constants.ts

export const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
export const API_BASE = "https://movie-server-api.connectu89.workers.dev";
export const API_URL = `${API_BASE}/api/movies`;
export const R2_BASE = `${API_BASE}/r2`;
export const FALLBACK = "/movie.jpg";

export const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
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

export function cleanKey(str: string) {
  return str
    .replace(/[^a-zA-Z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function getR2Url(k?: string | null) {
  if (!k) return "";
  if (k.startsWith("http")) return k;
  return `${R2_BASE}/${k.replace(/^\//, "")}`;
}

export function getRawKey(m: any, field: string) {
  let v = m[`${field}_raw`] || m[field] || m.main_url || m.video_url || null;
  if (v && v.includes("/r2/")) v = v.split("/r2/")[1];
  if (v && v.startsWith("http")) {
    try {
      v = decodeURIComponent(
        new URL(v).pathname.replace("/r2/", "").replace(/^\/+/, "")
      );
    } catch {}
  }
  return v;
}

export function safeId(id: any) {
  return String(id || "").slice(0, 8);
}
