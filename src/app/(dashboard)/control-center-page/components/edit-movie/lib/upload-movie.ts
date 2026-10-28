// edit-movie/lib/upload-movie.ts - handles episode uploads for edit - deletes old

import { WORKER_URL, cleanKey } from "../constants";
import { uploadToR2 } from "./upload-to-r2";
import type { SeasonDraft, EpisodeDraft } from "../types";

type ProgressCb = (seasonId: string, epId: string, pct: number, status: NonNullable<EpisodeDraft["status"]>) => void;

async function deleteOldR2File(oldKey: string | null | undefined): Promise<void> {
  if (!oldKey) return;
  let key = oldKey;
  if (key.includes("/r2/")) key = key.split("/r2/")[1];
  if (key.startsWith("http")) {
    try {
      key = decodeURIComponent(new URL(key).pathname.replace("/r2/", "").replace(/^\/+/, ""));
    } catch {}
  }
  if (!key || key.includes("blob:")) return;
  
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
      let epKey: string | null = ep.main_url || null;
      const oldKey = ep.main_url;

      // If new file selected, upload it and delete old
      if (ep.file) {
        const key =
          ep.main_url &&
          typeof ep.main_url === "string" &&
          !ep.main_url.includes("blob:") &&
          !ep.main_url.startsWith("http")
            ? ep.main_url
            : `series/${movieId}/${cleanKey(season.name)}/${ep.id}-${cleanKey(ep.file.name)}`;

        onProgress(season.id, ep.id, 0, "uploading");
        
        epKey = await uploadToR2(ep.file, key, (pct) => {
          onProgress(season.id, ep.id, pct, "uploading");
        });
        
        // DELETE OLD if key changed
        if (oldKey && oldKey !== epKey) {
          await deleteOldR2File(oldKey);
        }
        
        onProgress(season.id, ep.id, 100, "done");
      }

      // Handle preview replacement too
      let previewKey: string | null = ep.preview_url || null;
      if (ep.previewFile) {
        const pKey = ep.preview_url && !ep.preview_url.includes("blob:") 
          ? ep.preview_url 
          : `series/${movieId}/${cleanKey(season.name)}/${ep.id}-preview-${cleanKey(ep.previewFile.name)}`;
        
        const oldPreview = ep.preview_url;
        const uploadedPreview = await uploadToR2(ep.previewFile, pKey, () => {});
        if (oldPreview && oldPreview !== uploadedPreview) {
          await deleteOldR2File(oldPreview);
        }
        previewKey = uploadedPreview;
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
      });
    }

    uploadedSeasons.push({
      id: season.id,
      name: season.name,
      episodes: eps,
    });
  }

  return uploadedSeasons;
}

export async function uploadPreviewVideosForEdit(
  movieId: string,
  previewVideos: {
    id: string;
    existingKey: string | null;
    file: File | null;
  }[],
  onProgress: (id: string, pct: number) => void
): Promise<string[]> {
  const finalKeys: string[] = [];

  for (const pv of previewVideos) {
    if (pv.file) {
      const key =
        pv.existingKey && !pv.existingKey.includes("blob:")
          ? pv.existingKey
          : `previews/${movieId}-${cleanKey(pv.file.name)}-${crypto.randomUUID()}`;
      
      const oldKey = pv.existingKey;
      const uploaded = await uploadToR2(pv.file, key, (pct) => {
        onProgress(pv.id, pct);
      });

      if (oldKey && oldKey !== uploaded) {
        await deleteOldR2File(oldKey);
      }

      finalKeys.push(uploaded);
    } else if (pv.existingKey) {
      finalKeys.push(pv.existingKey);
    }
  }

  return finalKeys;
}