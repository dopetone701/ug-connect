// src/app/(dashboard)/control-center-page/components/create-movie/lib/upload-movie.ts
import { cleanKey } from "../constants";
import { uploadToR2 } from "./upload-to-r2";
import type { ProgressCallback, SeasonDraft } from "../types";


interface UploadCoverParams {
  file: File;
  uid: string;
  safeTitle: string;
  onProgress: ProgressCallback;
}


export async function uploadCover({
  file,
  uid,
  safeTitle,
  onProgress,
}: UploadCoverParams): Promise<string> {
  const coverKey = `covers/${uid}-${safeTitle}-${cleanKey(file.name)}`;
  return uploadToR2(file, coverKey, onProgress);
}


interface UploadMainMovieParams {
  file: File;
  uid: string;
  safeTitle: string;
  onProgress: ProgressCallback;
}


export async function uploadMainMovie({
  file,
  uid,
  safeTitle,
  onProgress,
}: UploadMainMovieParams): Promise<string> {
  const mainKey = `movies/${uid}-${safeTitle}-${cleanKey(file.name)}`;
  return uploadToR2(file, mainKey, onProgress);
}


interface UploadPreviewsParams {
  files: File[];
  uid: string;
}


export async function uploadPreviews({
  files,
  uid,
}: UploadPreviewsParams): Promise<string[]> {
  const previewKeys: string[] = [];
  for (const pf of files) {
    const pk = `previews/${uid}-${cleanKey(pf.name)}`;
    const k = await uploadToR2(pf, pk, () => {});
    previewKeys.push(k);
  }
  return previewKeys;
}


interface UploadEpisodeParams {
  file: File;
  uid: string;
  safeTitle: string;
  seasonName: string;
  onProgress: ProgressCallback;
}


export async function uploadEpisodeFile({
  file,
  uid,
  safeTitle,
  seasonName,
  onProgress,
}: UploadEpisodeParams): Promise<string> {
  const epKey = `series/${uid}-${safeTitle}/${cleanKey(
    seasonName
  )}/${crypto.randomUUID()}-${cleanKey(file.name)}`;
  return uploadToR2(file, epKey, onProgress);
}


interface UploadEpisodePreviewParams {
  file: File;
  uid: string;
  safeTitle: string;
}


export async function uploadEpisodePreview({
  file,
  uid,
  safeTitle,
}: UploadEpisodePreviewParams): Promise<string> {
  const preKey = `previews/${uid}-${safeTitle}/${crypto.randomUUID()}-${cleanKey(
    file.name
  )}`;
  return uploadToR2(file, preKey, () => {});
}


// ---------------------------------------------------------------------------
// ACTOR HEADSHOTS
// ---------------------------------------------------------------------------

/**
 * Centre-crops an image to a square and shrinks it to a small JPEG (default 400px).
 * A phone photo is several MB; a headshot only needs ~40 KB.
 * Falls back to the original file if the browser cannot process it.
 */
export async function resizeHeadshot(file: File, size = 400): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const side = Math.min(bmp.width, bmp.height);
    const out = Math.min(size, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
    bmp.close?.();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85)
    );
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "headshot";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}


interface UploadHeadshotParams {
  file: File;
  uid: string;
}


export async function uploadHeadshot({
  file,
  uid,
}: UploadHeadshotParams): Promise<string> {
  const small = await resizeHeadshot(file);
  // random part: two phone photos are often both called "image.jpg"
  const key = `cast/${uid}-${crypto.randomUUID().slice(0, 6)}-${cleanKey(small.name)}`;
  return uploadToR2(small, key, () => {});
}


// Helper to generate safe title
export function createSafeTitle(title: string): string {
  return cleanKey(title);
}


