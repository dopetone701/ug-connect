// src/app/(dashboard)/control-center-page/components/entity-arsenal/migrate-live.ts
// FROM SCRATCH - Admin publish: R2A (arsenal) -> R2 (live). NO re-upload from browser.
// Worker does the copy server-side. If copy fails, Worker rolls back copied live keys.
// Front-end NEVER calls R2 directly here - only POST /arsenal/migrate + POST /arsenal/clear.

import { ARSENAL_ENDPOINTS, liveKeyForSingle, liveKeyForEpisode } from "./arsenal-constants";
import type { ArsenalItem, ArsenalMigrateResponse } from "./arsenal-types";

/** Build live keys from Arsenal item + final movieId. Same pattern Worker1 Create uses. */
export function buildLiveKeys(item: ArsenalItem, movieId: string) {
  if (item.type === "Single") {
    const fileName = item.arsenalKey.split("/").pop() || "video.mp4";
    return { liveKey: liveKeyForSingle(movieId, fileName), liveEpisodes: [] as Array<{ arsenalKey: string; liveKey: string }> };
  }
  const liveEpisodes = (item.episodes || []).map((ep) => {
    // seasonNumber: parse s{n}-e{m} from key if present, else 1. Title fallback keeps order stable.
    const m = ep.arsenalKey.match(/\/s(\d+)-e(\d+)-/);
    const seasonNumber = m ? parseInt(m[1], 10) : 1;
    const fileName = ep.arsenalKey.split("/").pop() || `e${ep.episodeNumber}.mp4`;
    return { arsenalKey: ep.arsenalKey, liveKey: liveKeyForEpisode(movieId, seasonNumber, ep.episodeNumber, fileName) };
  });
  return { liveKey: "", liveEpisodes };
}

/**
 * Migrate an Arsenal item to live.
 * @param item - staged Arsenal item from listArsenalItems()
 * @param liveMovieId - the id Create just got from POST /movies (or crypto.randomUUID if migrating standalone)
 * Call AFTER cover/previews/details are saved to live D1, so liveMovieId exists.
 * If item already published, Worker returns alreadyPublished:true and does NOT copy again.
 */
export async function migrateArsenalToLive(
  item: ArsenalItem,
  liveMovieId: string
): Promise<ArsenalMigrateResponse> {
  const { liveKey, liveEpisodes } = buildLiveKeys(item, liveMovieId);
  const res = await fetch(ARSENAL_ENDPOINTS.migrate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: item.id,
      liveMovieId,
      ...(item.type === "Single" ? { liveKey } : { liveEpisodes }),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Migrate failed: ${res.status}`);
  return data as ArsenalMigrateResponse;
}

/**
 * Admin instant clear - deletes R2A objects + marks cleared.
 * Does NOT touch live R2. Live movie stays live even after Arsenal is cleared.
 */
export async function clearArsenalItem(id: string): Promise<{ success: boolean; cleared: string[] }> {
  const res = await fetch(ARSENAL_ENDPOINTS.clear, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Clear failed: ${res.status}`);
  return data;
}

/** Cron / manual sweep - clears all published items past 90 days. */
export async function clearExpiredArsenal(): Promise<{ success: boolean; cleared: string[] }> {
  const res = await fetch(ARSENAL_ENDPOINTS.clear, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Clear expired failed: ${res.status}`);
  return data;
}

/** Hard delete - removes R2A objects + D1 row. Use only for bad uploads / spam. */
export async function deleteArsenalItem(id: string): Promise<{ success: boolean; deleted: string }> {
  const res = await fetch(`${ARSENAL_ENDPOINTS.items}/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Delete failed: ${res.status}`);
  return data;
}

