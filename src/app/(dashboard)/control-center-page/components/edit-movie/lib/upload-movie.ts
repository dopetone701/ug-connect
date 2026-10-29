// edit-movie/lib/upload-movie.ts - handles episode uploads for edit - deletes old - CUBES 72x72 unlimited
import { WORKER_URL, cleanKey } from "../constants";
import { uploadToR2 } from "./upload-to-r2";
import type { SeasonDraft, EpisodeDraft } from "../types";

type ProgressCb = (seasonId: string, epId: string, pct: number, status: NonNullable<EpisodeDraft["status"]>) => void;

async function deleteOldR2File(oldKey: string | null | undefined): Promise<void> {
  if (!oldKey) return;
  let key = oldKey;
  if (key.includes("/r2/")) key = key.split("/r2/")[1].split("?")[0];
  if (key.startsWith("http")) {
    try {
      key = decodeURIComponent(new URL(key).pathname.replace("/r2/", "").replace(/^\/+/, ""));
    } catch {}
  }
  if (!key || key.includes("blob:") || key.length < 4) return;
  try {
    await fetch(`${WORKER_URL}/r2-delete/${encodeURIComponent(key)}`, { method: "DELETE" });
  } catch {
    // ignore delete failure - don't block edit
  }
}

export async function uploadSeasonsForEdit(
  movieId: string,
  seasons: SeasonDraft[],
  onProgress: ProgressCb
): Promise<SeasonDraft[]> {
  const uploadedSeasons: SeasonDraft[] = [];

  for (const season of seasons) {
    const eps: EpisodeDraft[] = [];
    
    for (const ep of season.episodes) {
      // SUPPORT BOTH OLD (ep.file) and NEW CUBES (ep._fileMain / _file)
      const mainFile = (ep as any)._fileMain || (ep as any)._file || ep.file || null;
      const previewFile = (ep as any)._filePreview || (ep as any).previewFile || null;

      let epKey: string | null = ep.main_url || (ep as any).video_url || null;
      let previewKey: string | null = ep.preview_url || (ep as any).previewUrl || null;

      // MAIN EPISODE VIDEO
      if (mainFile) {
        const oldKey = epKey;
        const key =
          epKey && typeof epKey === "string" && !epKey.includes("blob:") && !epKey.startsWith("http")
            ? epKey
            : `series/${movieId}/s${(season as any).number || 1}-e${(ep as any).number || ep.id.slice(0,6)}-main-${Date.now()}-${cleanKey(mainFile.name)}`;

        onProgress(season.id, ep.id, 0, "uploading");
        epKey = await uploadToR2(mainFile, key, (pct) => onProgress(season.id, ep.id, pct, "uploading"));
        if (oldKey && oldKey !== epKey) await deleteOldR2File(oldKey);
        onProgress(season.id, ep.id, 100, "done");
      }

      // INDIVIDUAL EPISODE PREVIEW - tied to episode, but also shuffles in global reels
      if (previewFile) {
        const oldPreview = previewKey;
        const pKey =
          previewKey && !previewKey.includes("blob:") && !previewKey.startsWith("http")
            ? previewKey
            : `series/${movieId}/s${(season as any).number || 1}-e${(ep as any).number || ep.id.slice(0,6)}-preview-${Date.now()}-${cleanKey(previewFile.name)}`;
        
        previewKey = await uploadToR2(previewFile, pKey, () => {});
        if (oldPreview && oldPreview !== previewKey) await deleteOldR2File(oldPreview);
      }

      eps.push({
        id: ep.id,
        title: ep.title,
        file: null,
        url: null,
        previewFile: null,
        previewUrl: null,
        main_url: epKey,
        preview_url: previewKey,
        status: "done",
        progress: 100,
      } as any);
    }

    uploadedSeasons.push({
      id: season.id,
      name: season.name,
      episodes: eps,
    } as any);
  }

  return uploadedSeasons;
}

// UNLIMITED GLOBAL PREVIEWS - CUBES 72x72 - belongs to whole movie, random in reels
export async function uploadPreviewVideosForEdit(
  movieId: string,
  previewVideos: {
    id: string;
    existingKey: string | null;
    file: File | null;
  }[],
  onProgress: (id: string, pct: number) => void,
  type: "Single" | "Full" | "Mini" = "Single"
): Promise<string[]> {
  const finalKeys: string[] = [];
  // CLEAN NAMESPACES - no collision
  const prefix = type === "Single" ? "previews" : "series-previews";

  for (const pv of previewVideos) {
    if (pv.file) {
      const oldKey = pv.existingKey;
      const key =
        oldKey && !oldKey.includes("blob:") && !oldKey.startsWith("http")
          ? oldKey // keep same key when replacing
          : `${prefix}/${movieId}-${Date.now()}-${cleanKey(pv.file.name)}-${crypto.randomUUID().slice(0, 6)}`;
      
      const uploaded = await uploadToR2(pv.file, key, (pct) => onProgress(pv.id, pct));
      if (oldKey && oldKey !== uploaded) await deleteOldR2File(oldKey);
      finalKeys.push(uploaded);
    } else if (pv.existingKey) {
      finalKeys.push(pv.existingKey);
    }
  }

  return finalKeys;
}
