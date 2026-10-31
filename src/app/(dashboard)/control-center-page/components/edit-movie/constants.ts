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

// ===== CATEGORY SYSTEM - single source of truth =====
export type MovieCategoryId =
  | "popular"
  | "western"
  | "european"
  | "west-african"
  | "east-african"
  | "south-asian"
  | "east-asian"
  | "southeast-asian"
  | "arab"
  // legacy aliases kept for ExploreMore backward compat
  | "ugandan"
  | "nigerian"
  | "indian"
  | "korean"
  | "filipino";

export type CatConfig = {
  id: MovieCategoryId;
  label: string;
  searchQuery: string;
  matchKeys: string[];
};

export const CATEGORY_OPTIONS: CatConfig[] = [
  { id: "popular", label: "POPULAR", searchQuery: "popular", matchKeys: ["popular"] },
  { id: "western", label: "WESTERN", searchQuery: "western", matchKeys: ["western", "american", "usa", "hollywood", "cowboy", "frontier"] },
  { id: "european", label: "EUROPEAN", searchQuery: "european", matchKeys: ["european", "british", "uk", "period drama", "peaky blinders", "vikings"] },
  { id: "west-african", label: "WEST AFRICAN", searchQuery: "nigerian nollywood", matchKeys: ["west-african", "west african", "nigerian", "nigeria", "nollywood", "ghana", "ghanaian"] },
  { id: "east-african", label: "EAST AFRICAN", searchQuery: "ugandan", matchKeys: ["east-african", "east african", "ugandan", "uganda", "kenyan", "kenya", "tanzania", "bongo"] },
  { id: "south-asian", label: "SOUTH ASIAN", searchQuery: "indian bollywood", matchKeys: ["south-asian", "south asian", "indian", "india", "bollywood", "hindi", "tamil", "telugu"] },
  { id: "east-asian", label: "EAST ASIAN", searchQuery: "korean kdrama", matchKeys: ["east-asian", "east asian", "korean", "korea", "kdrama", "k-drama", "japanese", "japan", "anime", "chinese", "china", "cdrama"] },
  { id: "southeast-asian", label: "SOUTHEAST ASIAN", searchQuery: "filipino", matchKeys: ["southeast-asian", "southeast asian", "filipino", "philippines", "pinoy", "thai", "thailand"] },
  { id: "arab", label: "ARAB / MENA", searchQuery: "arab turkish", matchKeys: ["arab", "arabic", "turkish", "turkey", "dizi", "mena", "egypt"] },
  // legacy ids - map to new system via matchKeys but kept so old ExploreMore CATS still resolve
  { id: "ugandan", label: "UGANDAN", searchQuery: "ugandan", matchKeys: ["ugandan", "uganda"] },
  { id: "nigerian", label: "NIGERIAN", searchQuery: "nigerian", matchKeys: ["nigerian", "nollywood"] },
  { id: "indian", label: "INDIAN", searchQuery: "indian", matchKeys: ["indian", "bollywood"] },
  { id: "korean", label: "KOREAN", searchQuery: "korean", matchKeys: ["korean", "kdrama"] },
  { id: "filipino", label: "FILIPINO", searchQuery: "filipino", matchKeys: ["filipino", "pinoy"] },
];

export function getCategoryConfig(id: string): CatConfig | undefined {
  return CATEGORY_OPTIONS.find((c) => c.id === id);
}

export function getCategoryLabel(id: string): string {
  return getCategoryConfig(id)?.label || id.toUpperCase();
}

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

