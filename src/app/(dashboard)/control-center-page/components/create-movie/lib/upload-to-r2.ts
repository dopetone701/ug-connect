// src/app/(dashboard)/control-center-page/components/create-movie/lib/upload-to-r2.ts
import { WORKER_URL, CHUNK_SIZE, SINGLE_LIMIT } from "../constants";
import type { ProgressCallback, MultipartPart } from "../types";

export async function uploadToR2(
  file: File,
  key: string,
  onProgress: ProgressCallback
): Promise<string> {
  onProgress(0);

  if (!file || file.size === 0) {
    throw new Error(`File is empty (size: ${file?.size || 0}) - iCloud video? Open Photos app and download original first`);
  }

  // --- SINGLE UPLOAD ( < 90MB ) - FIXED FOR iPHONE ---
  if (file.size < SINGLE_LIMIT) {
    // CRITICAL FIX: Read as ArrayBuffer first - iPhone XHR send(File) sends 0 byte for iCloud videos
    const fileBuffer = await file.arrayBuffer();

    if (fileBuffer.byteLength === 0) {
      throw new Error(`File buffer empty - iCloud video not downloaded. File.size=${file.size}. Open Photos > select video > share > save to files first.`);
    }

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve(key);
        } else {
          reject(
            new Error(`upload failed ${xhr.status}: ${xhr.responseText}`)
          );
        }
      };

      xhr.onerror = () => reject(new Error("network error"));

      xhr.open(
        "PUT",
        `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`
      );
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      // SEND ArrayBuffer, NOT File
      xhr.send(fileBuffer);
    });
  }

  // --- MULTIPART UPLOAD ( >= 90MB ) - FIXED FOR iPHONE ---
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!createRes.ok) {
    throw new Error("create-multipart failed: " + (await createRes.text()));
  }

  const { uploadId } = await createRes.json();
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: MultipartPart[] = [];
  let uploaded = 0;

  try {
    for (let i = 0; i < totalParts; i++) {
      const blobChunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      if (blobChunk.size === 0) {
        throw new Error(`part ${i + 1} empty - iPhone couldn't slice file. File size ${file.size}. Download video from iCloud first.`);
      }

      // CRITICAL FIX: Blob -> ArrayBuffer before fetch (fixes iOS empty chunk bug)
      const bufferChunk = await blobChunk.arrayBuffer();

      if (bufferChunk.byteLength === 0) {
        throw new Error(`part ${i + 1} ArrayBuffer empty - iPhone memory pressure`);
      }

      const res = await fetch(
        `${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(
          key
        )}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i + 1}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: bufferChunk,
        }
      );

      if (!res.ok) {
        throw new Error(`part ${i + 1} failed: ${await res.text()}`);
      }

      let etag = "";
      try {
        const data = await res.clone().json();
        etag = data.etag || data.ETag || "";
      } catch {
        etag = res.headers.get("etag") || "";
      }

      if (!etag) {
        throw new Error(`part ${i + 1} missing etag`);
      }

      parts.push({
        partNumber: i + 1,
        etag: etag.replaceAll('"', ""),
      });

      uploaded += blobChunk.size;
      onProgress(Math.round((uploaded / file.size) * 100));
    }

    const complete = await fetch(`${WORKER_URL}/complete-multipart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, parts }),
    });

    if (!complete.ok) {
      throw new Error("complete failed: " + (await complete.text()));
    }

    return key;
  } catch (err) {
    try {
      await fetch(`${WORKER_URL}/abort-multipart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId }),
      });
    } catch {
      // ignore abort error
    }
    throw err;
  }
}