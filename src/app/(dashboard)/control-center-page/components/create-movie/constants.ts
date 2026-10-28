// src/app/(dashboard)/control-center-page/components/create-movie/constants.ts


export const WORKER_URL =
  "https://movie-creation-portal-api.connectu89.workers.dev";


export const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
export const SINGLE_LIMIT = 90 * 1024 * 1024; // 90MB

/** Maximum number of actors (each with an optional headshot) per movie */
export const MAX_ACTORS = 5;


export const API_ENDPOINTS = {
  MOVIES: `${WORKER_URL}/movies`,
  UPLOAD_SINGLE: `${WORKER_URL}/upload-single`,
  CREATE_MULTIPART: `${WORKER_URL}/create-multipart`,
  UPLOAD_PART: `${WORKER_URL}/multipart/upload-part`,
  COMPLETE_MULTIPART: `${WORKER_URL}/complete-multipart`,
  ABORT_MULTIPART: `${WORKER_URL}/abort-multipart`,
} as const;


/**
 * Sanitizes file keys - preserves original behavior
 * Replaces invalid chars with "-" and truncates to 80 chars
 */
export function cleanKey(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_.]/g, "-").replace(/-+/g, "-").slice(0, 80);
}


/**
 * Generates a short unique ID (8 chars) - same as original
 */
export function generateShortId(): string {
  return crypto.randomUUID().slice(0, 8);
}


