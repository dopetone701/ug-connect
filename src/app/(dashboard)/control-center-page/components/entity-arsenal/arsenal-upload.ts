// src/app/(dashboard)/control-center-page/components/entity-arsenal/arsenal-upload.ts
// FROM SCRATCH - Receiver upload to R2A only. NEVER touches live R2.
// Pattern copied from Worker1 Create: create-multipart -> upload-part (parallel) -> complete-multipart.
// Small files use upload-single. Same 10MB chunks, same ETag flow.

import { ARSENAL_ENDPOINTS, ARSENAL_CHUNK_SIZE, ARSENAL_MAX_CONCURRENT_PARTS } from "./arsenal-constants";

export interface ArsenalUploadProgress {
  loaded: number;
  total: number;
  percent: number;
  part: number;
  totalParts: number;
}

export async function uploadToArsenalSingle(
  file: File,
  key: string,
  onProgress?: (p: ArsenalUploadProgress) => void
): Promise<string> {
  const res = await fetch(`${ARSENAL_ENDPOINTS.uploadSingle}?key=${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(`Arsenal single upload failed: ${res.status}`);
  onProgress?.({ loaded: file.size, total: file.size, percent: 100, part: 1, totalParts: 1 });
  return key;
}

export async function uploadToArsenalChunked(
  file: File,
  key: string,
  onProgress?: (p: ArsenalUploadProgress) => void
): Promise<string> {
  // 1. Create
  const createRes = await fetch(ARSENAL_ENDPOINTS.createMultipart, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!createRes.ok) throw new Error(`Arsenal create-multipart failed: ${createRes.status}`);
  const { uploadId } = await createRes.json();
  if (!uploadId) throw new Error("Arsenal create-multipart: no uploadId");

  const totalParts = Math.max(1, Math.ceil(file.size / ARSENAL_CHUNK_SIZE));
  const parts: Array<{ partNumber: number; etag: string }> = [];
  let loaded = 0;

  const uploadPart = async (partNumber: number) => {
    const start = (partNumber - 1) * ARSENAL_CHUNK_SIZE;
    const chunk = file.slice(start, start + ARSENAL_CHUNK_SIZE);
    const res = await fetch(
      `${ARSENAL_ENDPOINTS.uploadPart}?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`,
      { method: "POST", body: chunk }
    );
    if (!res.ok) throw new Error(`Arsenal part ${partNumber} failed: ${res.status}`);
    const data = await res.json();
    const etag = data.etag || data.ETag;
    if (!etag) throw new Error(`Arsenal part ${partNumber}: no etag`);
    loaded += chunk.size;
    onProgress?.({ loaded, total: file.size, percent: Math.round((loaded / file.size) * 100), part: partNumber, totalParts });
    return { partNumber, etag };
  };

  try {
    // 2. Upload parts, max 3 concurrent - same as Create
    for (let i = 0; i < totalParts; i += ARSENAL_MAX_CONCURRENT_PARTS) {
      const batch = [];
      for (let p = i + 1; p <= Math.min(i + ARSENAL_MAX_CONCURRENT_PARTS, totalParts); p++) batch.push(uploadPart(p));
      const done = await Promise.all(batch);
      parts.push(...done);
    }
    // 3. Complete - sorted by partNumber, Worker expects sorted
    const completeRes = await fetch(ARSENAL_ENDPOINTS.completeMultipart, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, parts: parts.sort((a, b) => a.partNumber - b.partNumber) }),
    });
    if (!completeRes.ok) throw new Error(`Arsenal complete failed: ${completeRes.status}`);
    return key;
  } catch (e) {
    // Abort so R2A does not keep orphan parts
    try {
      await fetch(ARSENAL_ENDPOINTS.abortMultipart, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId }),
      });
    } catch {}
    throw e;
  }
}

/** Auto-pick: small -> single PUT, big -> chunked. Same threshold logic as Create. */
export async function uploadToArsenal(
  file: File,
  key: string,
  onProgress?: (p: ArsenalUploadProgress) => void
): Promise<string> {
  if (!key.startsWith("arsenal/")) throw new Error("Arsenal key must start with arsenal/");
  if (file.size <= ARSENAL_CHUNK_SIZE) return uploadToArsenalSingle(file, key, onProgress);
  return uploadToArsenalChunked(file, key, onProgress);
}

