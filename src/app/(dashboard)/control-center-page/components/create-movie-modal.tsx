"use client";
import { useRef, useState } from "react";
import "./create-movie-modal.css";

const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const SINGLE_LIMIT = 90 * 1024 * 1024; // 90MB

async function uploadToR2(file: File, key: string, progEl: HTMLElement | null) {
  const fill = progEl?.querySelector('.prog-fill') as HTMLElement;
  const text = progEl?.querySelector('.prog-text') as HTMLElement;
  if (progEl) progEl.style.display = 'block';

  // SMALL FILE -> single PUT
  if (file.size < SINGLE_LIMIT) {
    const xhr = new XMLHttpRequest();
    return new Promise<string>((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          if (fill) fill.style.width = pct + '%';
          if (text) text.textContent = pct + '%';
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(key);
        else reject(new Error('upload failed'));
      };
      xhr.onerror = () => reject(new Error('network error'));
      xhr.open('PUT', `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }

  // HEAVY FILE -> multipart
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  const { uploadId } = await createRes.json();

  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];
  let uploaded = 0;

  for (let i = 0; i < totalParts; i++) {
    const partNumber = i + 1;
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    
    const res = await fetch(`${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`, {
      method: 'POST',
      body: chunk
    });
    const data = await res.json();
    parts.push({ partNumber, etag: data.etag });

    uploaded += chunk.size;
    const pct = Math.round((uploaded / file.size) * 100);
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = `STREAM ${pct}%`;
  }

  await fetch(`${WORKER_URL}/complete-multipart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, uploadId, parts })
  });

  return key;
}

export default function CreateMovieModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [type, setType] = useState("Single");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const mainRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        <div className="cc-modal-head"><h3>🎬 Create Movie</h3><button onClick={onClose} className="cc-close">✕</button></div>

        <div className="cc-modal-body">
          <div className="cc-form-grid">
            <div><label>TITLE *</label><input id="movieTitle" placeholder="BATTLE OF KAMPALA" /></div>
            <div><label>GENRE</label><input id="genre" placeholder="Action" /></div>
            <div><label>VJ</label><input id="vj" placeholder="VJ Junior" /></div>
            <div><label>TYPE *</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="Single">Single Movie</option>
                <option value="Mini">Mini-Series</option>
                <option value="Full">TV Series</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}><label>DESCRIPTION</label><textarea id="desc" rows={2}></textarea></div>
          </div>

          <div className="cc-upload-grid">
            <div className="cc-up-box">
              <label>🎬 MAIN MOVIE *</label>
              <input type="file" ref={mainRef} accept="video/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { if (movieUrl) URL.revokeObjectURL(movieUrl); setMovieUrl(URL.createObjectURL(f)); }
              }} />
              {movieUrl && <video src={movieUrl} controls style={{ width: '100%', marginTop: 10, borderRadius: 8, maxHeight: 180 }} />}
              <div id="progMain" className="prog" style={{ display: 'none' }}><div className="prog-bar"><div className="prog-fill"></div></div><span className="prog-text">0%</span></div>
            </div>

            <div className="cc-up-box">
              <label>🖼️ COVER ART *</label>
              <input type="file" ref={coverRef} accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { if (coverUrl) URL.revokeObjectURL(coverUrl); setCoverUrl(URL.createObjectURL(f)); }
              }} />
              {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '100%', marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />}
              <div id="progCover" className="prog" style={{ display: 'none' }}><div className="prog-bar"><div className="prog-fill"></div></div><span className="prog-text">0%</span></div>
            </div>
          </div>

          <div className="cc-up-box" style={{ marginTop: 14 }}>
            <label>🎞️ PREVIEWS - upto 10</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <label className="cc-preview-add">
                <input type="file" accept="video/*" hidden onChange={e => {
                  const f = e.target.files?.[0];
                  if (f && previewFiles.length < 10) {
                    setPreviewFiles([...previewFiles, f]);
                    setPreviewUrls([...previewUrls, URL.createObjectURL(f)]);
                  }
                }} />
                + Preview {previewFiles.length + 1}
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              {previewUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <video src={url} controls style={{ width: '100%', borderRadius: 8, height: 90, objectFit: 'cover' }} />
                  <span onClick={() => {
                    setPreviewFiles(previewFiles.filter((_, x) => x !== i));
                    setPreviewUrls(previewUrls.filter((_, x) => x !== i));
                  }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.7)', color: '#fff', borderRadius: 99, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>✕</span>
                </div>
              ))}
            </div>
          </div>

          <div id="createStatus" className="cc-status">{uploading ? '⏳ Uploading to R2...' : '🚀 Ready to upload to ug-connect-r2'}</div>
        </div>

        <div className="cc-modal-foot">
          <button onClick={onClose} disabled={uploading} className="cc-btn ghost">Cancel</button>
          <button disabled={uploading} onClick={async () => {
            const main = mainRef.current?.files?.[0];
            const cover = coverRef.current?.files?.[0];
            const title = (document.getElementById('movieTitle') as HTMLInputElement)?.value;
            const genre = (document.getElementById('genre') as HTMLInputElement)?.value;
            const vj = (document.getElementById('vj') as HTMLInputElement)?.value;
            const desc = (document.getElementById('desc') as HTMLTextAreaElement)?.value;

            if (!title || !main || !cover) return alert('Title, Main, Cover required');

            try {
              setUploading(true);
              const mainKey = `movies/${Date.now()}-${main.name}`;
              const coverKey = `covers/${Date.now()}-${cover.name}`;

              const progMain = document.getElementById('progMain');
              const progCover = document.getElementById('progCover');

              const mainUploadedKey = await uploadToR2(main, mainKey, progMain);
              const coverUploadedKey = await uploadToR2(cover, coverKey, progCover);

              // previews
              const previewKeys: string[] = [];
              for (const pf of previewFiles) {
                const pk = `previews/${Date.now()}-${pf.name}`;
                const k = await uploadToR2(pf, pk, null);
                previewKeys.push(k);
              }

              // save to D1
              await fetch(`${WORKER_URL}/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title, genre, vj, type, description: desc,
                  main_url: mainUploadedKey,
                  cover_url: coverUploadedKey,
                  preview_urls: previewKeys
                })
              });

              alert('✅ Uploaded to R2 + Saved to D1');
              onClose();
            } catch (e: any) {
              alert('❌ ' + e.message);
            } finally {
              setUploading(false);
            }
          }} className="cc-btn primary">{uploading ? 'Uploading...' : '🚀 Upload Movie'}</button>
        </div>
      </div>
    </div>
  );
}
