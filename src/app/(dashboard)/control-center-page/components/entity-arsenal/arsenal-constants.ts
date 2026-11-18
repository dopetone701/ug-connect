// src/app/(dashboard)/control-center-page/components/entity-arsenal/arsenal-constants.ts
// FROM SCRATCH - Arsenal only. Same chunk shape as Create (Worker1), different bucket (R2A).

/** Arsenal Portal Worker - paste URL from Cloudflare Overview (arsenal-portal-api). */
export const ARSENAL_API_BASE =
  process.env.NEXT_PUBLIC_ARSENAL_API_URL ||
  "https://arsenal-portal-api.connectu89.workers.dev";

export const ARSENAL_ENDPOINTS = {
  requestOtp: `${ARSENAL_API_BASE}/receiver/request-otp`,
  verifyOtp: `${ARSENAL_API_BASE}/receiver/verify-otp`,
  createMultipart: `${ARSENAL_API_BASE}/arsenal/create-multipart`,
  uploadPart: `${ARSENAL_API_BASE}/arsenal/multipart/upload-part`,
  completeMultipart: `${ARSENAL_API_BASE}/arsenal/complete-multipart`,
  abortMultipart: `${ARSENAL_API_BASE}/arsenal/abort-multipart`,
  uploadSingle: `${ARSENAL_API_BASE}/arsenal/upload-single`,
  items: `${ARSENAL_API_BASE}/arsenal/items`,
  migrate: `${ARSENAL_API_BASE}/arsenal/migrate`,
  clear: `${ARSENAL_API_BASE}/arsenal/clear`,
} as const;

/** Same as Worker1 Create chunking - do not change without changing Worker. */
export const ARSENAL_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
export const ARSENAL_MAX_CONCURRENT_PARTS = 3;

/** 90 days - matches Worker NINETY_DAYS_MS. */
export const ARSENAL_AUTO_CLEAR_MS = 90 * 24 * 60 * 60 * 1000;
export const ARSENAL_OTP_EXPIRY_MS = 10 * 60 * 1000;

/** Key builders - Single source of truth for R2A keys. */
export const arsenalKeyForSingle = (uploaderId: string, uploadId: string, fileName: string) =>
  `arsenal/${sanitizeSegment(uploaderId)}/${sanitizeSegment(uploadId)}/${sanitizeFileName(fileName)}`;

export const arsenalKeyForEpisode = (
  uploaderId: string,
  uploadId: string,
  seasonNumber: number,
  episodeNumber: number,
  fileName: string
) =>
  `arsenal/${sanitizeSegment(uploaderId)}/${sanitizeSegment(uploadId)}/s${seasonNumber}-e${episodeNumber}-${sanitizeFileName(fileName)}`;

/** Live keys - same pattern Worker1 Create uses for movies/series/. */
export const liveKeyForSingle = (movieId: string, fileName: string) =>
  `movies/${movieId}/${sanitizeFileName(fileName)}`;

export const liveKeyForEpisode = (
  movieId: string,
  seasonNumber: number,
  episodeNumber: number,
  fileName: string
) =>
  `series/${movieId}/s${seasonNumber}-e${episodeNumber}-${sanitizeFileName(fileName)}`;

function sanitizeSegment(v: string) {
  return (v || "anon").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}
function sanitizeFileName(v: string) {
  const base = (v || "video.mp4").split("/").pop() || "video.mp4";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/** Days left until auto-clear. null = not published yet / no timer. */
export const arsenalDaysLeft = (autoClearAt?: number | null) => {
  if (!autoClearAt) return null;
  return Math.max(0, Math.ceil((autoClearAt - Date.now()) / (24 * 60 * 60 * 1000)));
};

// Activity = items endpoint (Worker has no separate /activity - Admin monitor reads /items)
export const ARSENAL_ACTIVITY_ENDPOINT = ARSENAL_ENDPOINTS.items;

