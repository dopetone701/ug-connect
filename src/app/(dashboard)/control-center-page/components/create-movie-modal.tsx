"use client";
import { useRef, useState } from "react";
import "./create-movie-modal.css";
import { SeasonManager, type SeasonDraft } from "@/app/(dashboard)/control-center-page/components/tv-series";
import MiniSeriesManager from "@/app/(dashboard)/control-center-page/components/mini-series";

const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
const CHUNK_SIZE = 10 * 1024 * 1024;
const SINGLE_LIMIT = 90 * 1024 * 1024;

async function uploadToR2(file: File, key: string, progEl: HTMLElement | null) {
  const fill = progEl?.querySelector('.prog-fill') as HTMLElement;
  const text = progEl?.querySelector('.prog-text') as HTMLElement;
  if (progEl) progEl.style.display = 'block';
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
        else reject(new Error('upload failed ' + xhr.status));
      };
      xhr.onerror = () => reject(new Error('network error'));
      xhr.open('PUT', `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }
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
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [actors, setActors] = useState(""); // <-- FIXED - ADDED
  const [desc, setDesc] = useState("");

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);

  const mainRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  if (!open) return null;
  const isSeries = type === "Full" || type === "Mini";

  const handleUpload = async () => {
    const main = mainRef.current?.files?.[0];
    const cover = coverRef.current?.files?.[0];

    if (!title ||!cover ||!year ||!actors) return alert('Title, Year, Actors, Cover required');
    if (!isSeries &&!main) return alert('Main movie required for Single');

    if (isSeries && seasons.length === 0) return alert('Add at least 1 season');
    if (isSeries) {
      for (const s of seasons) {
        if (s.episodes.length === 0) return alert(`${s.name} has no episodes`);
        for (const ep of s.episodes) {
          if (!ep.file) return alert(`${s.name} - ${ep.title} missing video file`);
        }
      }
    }

    try {
      setUploading(true);
      const coverKey = `covers/${Date.now()}-${cover.name}`;
      const progCover = document.getElementById('progCover');
      const coverUploadedKey = await uploadToR2(cover, coverKey, progCover);

      let payload: any = {
        title, genre, vj, type, year: parseInt(year), actors, description: desc,
        cover_url: coverUploadedKey,
      };

      if (!isSeries) {
        const progMain = document.getElementById('progMain');
        const mainKey = `movies/${Date.now()}-${main!.name}`;
        const mainUploadedKey = await uploadToR2(main!, mainKey, progMain);

        const previewKeys: string[] = [];
        for (const pf of previewFiles) {
          const pk = `previews/${Date.now()}-${pf.name}`;
          const k = await uploadToR2(pf, pk, null);
          previewKeys.push(k);
        }
        payload.main_url = mainUploadedKey;
        payload.preview_urls = previewKeys;
      } else {
        const uploadedSeasons = [];
        for (const season of seasons) {
          const uploadedEps = [];
          for (const ep of season.episodes) {
            const epKey = `series/${title.replace(/\s+/g,'-')}/${season.name.replace(/\s+/g,'-')}/${Date.now()}-${ep.file!.name}`;
            const epUploaded = await uploadToR2(ep.file!, epKey, null);

            let previewUploaded = null;
            if (ep.previewFile) {
              const preKey = `previews/${title.replace(/\s+/g,'-')}/${season.name}/${Date.now()}-${ep.previewFile.name}`;
              previewUploaded = await uploadToR2(ep.previewFile, preKey, null);
            }
            uploadedEps.push({
              title: ep.title,
              main_url: epUploaded,
              preview_url: previewUploaded
            });
          }
          uploadedSeasons.push({ name: season.name, episodes: uploadedEps });
        }
        payload.seasons = uploadedSeasons;
      }

      await fetch(`${WORKER_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      alert('✅ Uploaded to R2 + Saved to D1');
      onClose();
      setSeasons([]);
      setActors("");
    } catch (e: any) {
      alert('❌ ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        <div className="cc-modal-head"><h3>🎬 Create Movie</h3><button onClick={onClose} className="cc-close">✕</button></div>

        <div className="cc-modal-body">
          <div className="cc-form-grid">
            <div><label>TITLE *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="BATTLE OF KAMPALA" /></div>
            <div><label>YEAR *</label><input value={year} onChange={e=>setYear(e.target.value)} type="number" placeholder="2024" /></div>
            <div><label>GENRE</label><input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Action" /></div>
            <div><label>VJ</label><input value={vj} onChange={e=>setVj(e.target.value)} placeholder="VJ Junior" /></div>
            <div><label>ACTORS *</label><input value={actors} onChange={e=>setActors(e.target.value)} placeholder="e.g. John, Mercy, Bobi" /></div>
            <div><label>TYPE *</label>
              <select value={type} onChange={e=>{setType(e.target.value); if(e.target.value==="Single") setSeasons([])}}>
                <option value="Single">Single Movie</option>
                <option value="Mini">Mini-Series</option>
                <option value="Full">TV Series</option>
              </select>
            </div>
            <div style={{gridColumn:'1/-1'}}><label>DESCRIPTION</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2}></textarea></div>
          </div>

          {!isSeries && (
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
          )}

          {isSeries && (
            <div className="cc-up-box" style={{marginTop:14}}>
              <label>🖼️ SERIES COVER ART *</label>
              <input type="file" ref={coverRef} accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { if (coverUrl) URL.revokeObjectURL(coverUrl); setCoverUrl(URL.createObjectURL(f)); }
              }} />
              {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '100%', marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />}
              <div id="progCover" className="prog" style={{ display: 'none' }}><div className="prog-bar"><div className="prog-fill"></div></div><span className="prog-text">0%</span></div>
            </div>
          )}

          {!isSeries && (
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
                      setPreviewFiles(previewFiles.filter((_, x) => x!== i));
                      setPreviewUrls(previewUrls.filter((_, x) => x!== i));
                    }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.7)', color: '#fff', borderRadius: 99, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>✕</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSeries && (
            <div style={{marginTop:18}}>
              {type === "Full"? (
                <SeasonManager seasons={seasons} setSeasons={setSeasons} label="Season" />
              ) : (
                <MiniSeriesManager seasons={seasons} setSeasons={setSeasons} />
              )}
            </div>
          )}

          <div id="createStatus" className="cc-status">{uploading? '⏳ Uploading to R2...' : '🚀 Ready to upload to ug-connect-r2'}</div>
        </div>

        <div className="cc-modal-foot">
          <button onClick={onClose} disabled={uploading} className="cc-btn ghost">Cancel</button>
          <button disabled={uploading} onClick={handleUpload} className="cc-btn primary">{uploading? 'Uploading...' : '🚀 Upload Movie'}</button>
        </div>
      </div>
    </div>
  );
}
