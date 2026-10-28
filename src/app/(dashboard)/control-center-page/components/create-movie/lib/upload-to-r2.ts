// src/app/(dashboard)/control-center-page/components/create-movie/lib/upload-to-r2.ts
import { WORKER_URL, CHUNK_SIZE, SINGLE_LIMIT } from "../constants";
import type { ProgressCallback, MultipartPart } from "../types";

export async function uploadToR2(
  file: File,
  key: string,
  onProgress: ProgressCallback
): Promise<string> {
  onProgress(0);

  if (file.size === 0) throw new Error("File is empty - pick again on mobile");

  // --- SINGLE UPLOAD ( < 90MB ) ---
  if (file.size < SINGLE_LIMIT) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve(key);
        } else {
          reject(new Error(`upload failed ${xhr.status}: ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error("network error"));
      xhr.open("PUT", `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  }

  // --- MULTIPART UPLOAD ( >= 90MB ) ---
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!createRes.ok) throw new Error("create-multipart failed: " + (await createRes.text()));

  const { uploadId } = await createRes.json();
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: MultipartPart[] = [];
  let uploaded = 0;

  try {
    for (let i = 0; i < totalParts; i++) {
      let chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      // FIX 1: MOBILE GUARD - retry slice if 0 byte (iPhone drops handle)
      if (chunk.size === 0) {
        await new Promise(r => setTimeout(r, 300));
        chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        if (chunk.size === 0) {
          throw new Error(`part ${i+1} empty - keep screen awake, don't switch app on iPhone`);
        }
      }

      let res: Response;
      let attempt = 0;
      // FIX 2: RETRY 3 times for mobile network blip
      while (true) {
        try {
          res = await fetch(
            `${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i + 1}`,
            { method: "POST", body: chunk }
          );
          if (!res.ok) throw new Error(await res.text());
          break;
        } catch (err) {
          attempt++;
          if (attempt >= 3) throw new Error(`part ${i + 1} failed: ${err}`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }

      let etag = "";
      try {
        const data = await (res as Response).clone().json();
        etag = data.etag || data.ETag || "";
      } catch {
        etag = (res as Response).headers.get("etag") || "";
      }
      if (!etag) throw new Error(`part ${i + 1} missing etag`);

      parts.push({ partNumber: i + 1, etag: etag.replaceAll('"', "") });
      uploaded += chunk.size;
      onProgress(Math.round((uploaded / file.size) * 100));
    }

    const complete = await fetch(`${WORKER_URL}/complete-multipart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, parts }),
    });
    if (!complete.ok) throw new Error("complete failed: " + (await complete.text()));
    return key;
  } catch (err) {
    try {
      await fetch(`${WORKER_URL}/abort-multipart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId }),
      });
    } catch {}
    throw err;
  }
}