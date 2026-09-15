"use client";
import { useRef, useState, useEffect } from "react";
import "./create-movie-modal.css";
import { SeasonManager, type SeasonDraft } from "@/app/(dashboard)/control-center-page/components/tv-series";
import MiniSeriesManager from "@/app/(dashboard)/control-center-page/components/mini-series";

const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
const CHUNK_SIZE = 10 * 1024 * 1024;
const SINGLE_LIMIT = 90 * 1024 * 1024;

function cleanKey(str: string) {
  return str.replace(/[^a-zA-Z0-9-_.]/g, "-").replace(/-+/g, "-").slice(0, 80);
}

async function uploadToR2(file: File, key: string, onProgress: (pct: number) => void) {
  onProgress(0);
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
        } else reject(new Error(`upload failed ${xhr.status}: ${xhr.responseText}`));
      };
      xhr.onerror = () => reject(new Error('network error'));
      xhr.open('PUT', `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }

  // multipart
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  if (!createRes.ok) throw new Error('create-multipart failed: ' + await createRes.text());
  const { uploadId } = await createRes.json();

  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];
  let uploaded = 0;

  try {
    for (let i = 0; i < totalParts; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const res = await fetch(`${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i+1}`, {
        method: 'POST', body: chunk
      });
      if (!res.ok) throw new Error(`part ${i+1} failed: ${await res.text()}`);
      let etag = "";
      try {
        const data = await res.clone().json();
        etag = data.etag || data.ETag || "";
      } catch { etag = res.headers.get("etag") || ""; }
      if (!etag) throw new Error(`part ${i+1} missing etag`);
      parts.push({ partNumber: i+1, etag: etag.replaceAll('"','') });
      uploaded += chunk.size;
      onProgress(Math.round((uploaded / file.size) * 100));
    }

    const complete = await fetch(`${WORKER_URL}/complete-multipart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, parts })
    });
    if (!complete.ok) throw new Error('complete failed: ' + await complete.text());
    return key;
  } catch (err) {
    // try to abort to avoid orphaned parts
    try { await fetch(`${WORKER_URL}/abort-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, uploadId }) }) } catch {}
    throw err;
  }
}

export default function CreateMovieModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [type, setType] = useState("Single");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [actors, setActors] = useState("");
  const [desc, setDesc] = useState("");

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);
  const [coverProg, setCoverProg] = useState(0);
  const [mainProg, setMainProg] = useState(0);

  const mainRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
      if (movieUrl) URL.revokeObjectURL(movieUrl);
    }
  }, [coverUrl, movieUrl]);

  if (!open) return null;
  const isSeries = type === "Full" || type === "Mini";

  const updateEpStatus = (seasonId: string, epId: string, patch: Partial<SeasonDraft['episodes'][0]>) => {
    setSeasons(prev => prev.map(s => s.id!== seasonId? s : {
     ...s,
      episodes: s.episodes.map(e => e.id === epId? {...e,...patch } : e)
    }));
  };

  const handleUpload = async () => {
    const main = mainRef.current?.files?.[0];
    const cover = coverRef.current?.files?.[0];

    if (!title.trim() ||!cover ||!year.trim() ||!actors.trim()) return alert('Title, Year, Actors, Cover required');
    if (!isSeries &&!main) return alert('Main movie required for Single');
    if (isSeries && seasons.length === 0) return alert('Add at least 1 season');
    if (isSeries && seasons.some(s => s.episodes.some(e =>!e.file))) return alert('All episodes must have a file');

    try {
      setUploading(true);
      const uid = crypto.randomUUID().slice(0, 8);
      const safeTitle = cleanKey(title);

      const coverKey = `covers/${uid}-${safeTitle}-${cleanKey(cover.name)}`;
      const coverUploadedKey = await uploadToR2(cover, coverKey, (p) => setCoverProg(p));

      let payload: any = {
        title: title.trim(), genre: genre.trim(), vj: vj.trim(), type, year: parseInt(year), actors: actors.trim(), description: desc.trim(),
        cover_url: coverUploadedKey,
      };

      if (!isSeries) {
        const mainKey = `movies/${uid}-${safeTitle}-${cleanKey(main!.name)}`;
        const mainUploadedKey = await uploadToR2(main!, mainKey, (p) => setMainProg(p));
        const previewKeys: string[] = [];
        for (const pf of previewFiles) {
          const pk = `previews/${uid}-${cleanKey(pf.name)}`;
          const k = await uploadToR2(pf, pk, () => {});
          previewKeys.push(k);
        }
        payload.main_url = mainUploadedKey;
        payload.preview_urls = previewKeys;
      } else {
        const uploadedSeasons = [];
        for (const season of seasons) {
          const uploadedEps = [];
          for (const ep of season.episodes) {
            if (!ep.file) throw new Error(`${season.name} - ${ep.title} missing file`);
            updateEpStatus(season.id, ep.id, { status: "uploading", progress: 0 });
            try {
              const epKey = `series/${uid}-${safeTitle}/${cleanKey(season.name)}/${crypto.randomUUID()}-${cleanKey(ep.file.name)}`;
              const epUploaded = await uploadToR2(ep.file, epKey, (pct) => {
                updateEpStatus(season.id, ep.id, { progress: pct, status: "uploading" });
              });
              let previewUploaded = null;
              if (ep.previewFile) {
                const preKey = `previews/${uid}-${safeTitle}/${crypto.randomUUID()}-${cleanKey(ep.previewFile.name)}`;
                previewUploaded = await uploadToR2(ep.previewFile, preKey, () => {});
              }
              updateEpStatus(season.id, ep.id, { progress: 100, status: "done" });
              uploadedEps.push({ title: ep.title, main_url: epUploaded, preview_url: previewUploaded });
            } catch (err: any) {
              updateEpStatus(season.id, ep.id, { status: "error", error: err.message });
              throw err;
            }
          }
          uploadedSeasons.push({ name: season.name, episodes: uploadedEps });
        }
        payload.seasons = uploadedSeasons;
      }

      const saveRes = await fetch(`${WORKER_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!saveRes.ok) throw new Error(await saveRes.text());

      alert('✅ Uploaded to R2 + Saved to D1');
      onClose();
      setSeasons([]);
      setPreviewFiles([]);
    } catch (e: any) {
      alert('❌ ' + e.message);
    } finally {
      setUploading(false);
      setCoverProg(0);
      setMainProg(0);
    }
  };

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        <div className="cc-modal-head"><h3>🎬 Create Movie</h3><button onClick={onClose} className="cc-close">✕</button></div>
        <div className="cc-modal-body">
          <div className="cc-form-grid">
            <div><label>TITLE *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="BATTLE OF KAMPALA" /></div>
            <div><label>YEAR *</label><input value={year} onChange={e=>setYear(e.target.value)} type="number" /></div>
            <div><label>GENRE</label><input value={genre} onChange={e=>setGenre(e.target.value)} /></div>
            <div><label>VJ</label><input value={vj} onChange={e=>setVj(e.target.value)} /></div>
            <div><label>ACTORS *</label><input value={actors} onChange={e=>setActors(e.target.value)} /></div>
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
                <div className="prog" style={{ display: mainProg>0?'block':'none' }}><div className="prog-bar"><div className="prog-fill" style={{width: mainProg+'%'}}></div></div><span className="prog-text">{mainProg}%</span></div>
              </div>
              <div className="cc-up-box">
                <label>🖼️ COVER ART *</label>
                <input type="file" ref={coverRef} accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { if (coverUrl) URL.revokeObjectURL(coverUrl); setCoverUrl(URL.createObjectURL(f)); }
                }} />
                {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '100%', marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />}
                <div className="prog" style={{ display: coverProg>0?'block':'none' }}><div className="prog-bar"><div className="prog-fill" style={{width: coverProg+'%'}}></div></div><span className="prog-text">{coverProg}%</span></div>
              </div>
              <div className="cc-up-box" style={{gridColumn:'1/-1'}}>
                <label>🎞️ PREVIEWS (optional)</label>
                <input type="file" multiple accept="video/*,image/*" onChange={e => setPreviewFiles(Array.from(e.target.files||[]))} />
                {previewFiles.length>0 && <small>{previewFiles.length} files selected</small>}
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
              <div className="prog" style={{ display: coverProg>0?'block':'none' }}><div className="prog-bar"><div className="prog-fill" style={{width: coverProg+'%'}}></div></div><span className="prog-text">{coverProg}%</span></div>
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

          <div id="createStatus" className="cc-status">{uploading? '⏳ Uploading to R2...' : '🚀 Ready'}</div>
        </div>

        <div className="cc-modal-foot">
          <button onClick={onClose} disabled={uploading} className="cc-btn ghost">Cancel</button>
          <button disabled={uploading} onClick={handleUpload} className="cc-btn primary">{uploading? 'Uploading...' : '🚀 Upload Movie'}</button>
        </div>
      </div>
    </div>
  );
}
