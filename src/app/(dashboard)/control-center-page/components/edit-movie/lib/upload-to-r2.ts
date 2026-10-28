// edit-movie/lib/upload-to-r2.ts - SOLID R2 uploader with progress

import { WORKER_URL, CHUNK_SIZE, SINGLE_LIMIT } from "../constants";

export async function uploadToR2(
  file: File,
  key: string,
  onProgress: (pct: number) => void
): Promise<string> {
  onProgress(0);

  // SINGLE PUT for files < 90MB
  if (file.size < SINGLE_LIMIT) {
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
      xhr.send(file);
    });
  }

  // MULTIPART for large files
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!createRes.ok)
    throw new Error("create-multipart failed: " + (await createRes.text()));
  
  const { uploadId } = await createRes.json();
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];
  let uploaded = 0;

  try {
    for (let i = 0; i < totalParts; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const res = await fetch(
        `${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(
          key
        )}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i + 1}`,
        { method: "POST", body: chunk }
      );
      if (!res.ok) throw new Error(`part ${i + 1} failed: ${await res.text()}`);
      
      let etag = "";
      try {
        const data = await res.clone().json();
        etag = data.etag || data.ETag || "";
      } catch {
        etag = res.headers.get("etag") || "";
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
    if (!complete.ok)
      throw new Error("complete failed: " + (await complete.text()));
    
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
