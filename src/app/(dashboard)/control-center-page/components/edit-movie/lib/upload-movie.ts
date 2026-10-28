// edit-movie/lib/upload-movie.ts - handles episode uploads for edit

import { cleanKey } from "../constants";
import { uploadToR2 } from "./upload-to-r2";
import type { SeasonDraft, EpisodeDraft } from "../types";

type ProgressCb = (seasonId: string, epId: string, pct: number, status: EpisodeDraft["status"]) => void;

export async function uploadSeasonsForEdit(
  movieId: string,
  seasons: SeasonDraft[],
  onProgress: ProgressCb
): Promise<SeasonDraft[]> {
  const uploadedSeasons: SeasonDraft[] = [];

  for (const season of seasons) {
    const eps: EpisodeDraft[] = [];
    
    for (const ep of season.episodes) {
      let epKey = ep.main_url;

      // If new file selected, upload it
      if (ep.file) {
        const key =
          ep.main_url &&
          typeof ep.main_url === "string" &&
          !ep.main_url.includes("blob:")
            ? ep.main_url // keep existing key path
            : `series/${movieId}/${cleanKey(season.name)}/${ep.id}-${cleanKey(
                ep.file.name
              )}`;

        onProgress(season.id, ep.id, 0, "uploading");
        
        epKey = await uploadToR2(ep.file, key, (pct) => {
          onProgress(season.id, ep.id, pct, "uploading");
        });
        
        onProgress(season.id, ep.id, 100, "done");
      }

      eps.push({
        id: ep.id,
        title: ep.title,
        main_url: epKey,
        preview_url: ep.preview_url || null,
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
        pv.existingKey ||
        `previews/${movieId}-${cleanKey(pv.file.name)}-${crypto.randomUUID()}`;
      
      const uploaded = await uploadToR2(pv.file, key, (pct) => {
        onProgress(pv.id, pct);
      });
      finalKeys.push(uploaded);
    } else if (pv.existingKey) {
      finalKeys.push(pv.existingKey);
    }
  }

  return finalKeys;
}
