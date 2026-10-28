// src/app/(dashboard)/control-center-page/components/create-movie/constants.ts

export const WORKER_URL =
  "https://movie-creation-portal-api.connectu89.workers.dev";

export const R2_BASE = "https://pub-your-r2-public-url.r2.dev"; // change to your R2 public URL

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB - iPhone safe
export const SINGLE_LIMIT = 90 * 1024 * 1024; // 90MB

export const MAX_ACTORS = 5;

export const API_ENDPOINTS = {
  MOVIES: `${WORKER_URL}/movies`,
  UPLOAD_SINGLE: `${WORKER_URL}/upload-single`,
  CREATE_MULTIPART: `${WORKER_URL}/create-multipart`,
  UPLOAD_PART: `${WORKER_URL}/multipart/upload-part`,
  COMPLETE_MULTIPART: `${WORKER_URL}/complete-multipart`,
  ABORT_MULTIPART: `${WORKER_URL}/abort-multipart`,
} as const;

export const VJ_OPTIONS = [
  "VJ Junior",
  "VJ Emmy",
  "VJ Jingo",
  "VJ Kevo",
  "VJ Ice P",
  "VJ Muba",
  "VJ Ulio",
  "VJ HD",
  "VJ Kadaffi",
] as const;

export const GENRE_OPTIONS = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation",
  "Adventure",
  "Fantasy",
  "Crime",
  "Documentary",
] as const;

export const MOVIE_TYPES = ["Single", "Series", "Mini-Series"] as const;

export function cleanKey(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_.]/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function generateShortId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function safeId(str: string): string {
  return cleanKey(str).toLowerCase();
}

export function getR2Url(key: string): string {
  return `${R2_BASE}/${key}`;
}

export function getRawKey(urlOrKey: string): string {
  if (!urlOrKey) return "";
  if (urlOrKey.startsWith("http")) {
    try {
      const u = new URL(urlOrKey);
      return u.pathname.replace(/^\//, "").replace(/^r2\//, "");
    } catch {
      return urlOrKey;
    }
  }
  return urlOrKey;
}

export function cleanFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_. ]/g, "-").slice(0, 100);
}