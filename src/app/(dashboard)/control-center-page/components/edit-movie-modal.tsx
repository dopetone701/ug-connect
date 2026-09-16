"use client";
import { useRef, useState, useEffect } from "react";
import "./create-movie-modal.css";

const WORKER_URL = "https://movie-creation-portal-api.connectu89.workers.dev";
const API_BASE = "https://movie-server-api.connectu89.workers.dev";
const API_URL = `${API_BASE}/api/movies`;
const R2_BASE = `${API_BASE}/r2`;
const FALLBACK = "/movie.jpg";

const CHUNK_SIZE = 10 * 1024 * 1024;
const SINGLE_LIMIT = 90 * 1024 * 1024;

function cleanKey(str: string) {
  return str.replace(/[^a-zA-Z0-9-_.]/g, "-").replace(/-+/g, "-").slice(0, 80);
}
function getR2Url(k?: string | null){ if(!k) return ""; if(k.startsWith("http")) return k; return `${R2_BASE}/${k.replace(/^\//,'')}`; }
function getRawKey(m:any, field:string){
  let v = m[`${field}_raw`] || m[field] || m.main_url || m.video_url || null;
  if(v && v.includes("/r2/")) v = v.split("/r2/")[1];
  if(v && v.startsWith("http")) { try{ v = decodeURIComponent(new URL(v).pathname.replace("/r2/","").replace(/^\/+/,"")); }catch{} }
  return v;
}
function safeId(id:any){ return String(id||"").slice(0,8); }

async function uploadToR2(file: File, key: string, onProgress: (pct: number) => void) {
  onProgress(0);
  if (file.size < SINGLE_LIMIT) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) { onProgress(100); resolve(key); }
        else reject(new Error(`upload failed ${xhr.status}: ${xhr.responseText}`));
      };
      xhr.onerror = () => reject(new Error('network error'));
      xhr.open('PUT', `${WORKER_URL}/upload-single?key=${encodeURIComponent(key)}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }
  const createRes = await fetch(`${WORKER_URL}/create-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
  if (!createRes.ok) throw new Error('create-multipart failed: ' + await createRes.text());
  const { uploadId } = await createRes.json();
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];
  let uploaded = 0;
  try {
    for (let i = 0; i < totalParts; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const res = await fetch(`${WORKER_URL}/multipart/upload-part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i+1}`, { method: 'POST', body: chunk });
      if (!res.ok) throw new Error(`part ${i+1} failed: ${await res.text()}`);
      let etag = ""; try { const data = await res.clone().json(); etag = data.etag || data.ETag || ""; } catch { etag = res.headers.get("etag") || ""; }
      if (!etag) throw new Error(`part ${i+1} missing etag`);
      parts.push({ partNumber: i+1, etag: etag.replaceAll('"','') });
      uploaded += chunk.size;
      onProgress(Math.round((uploaded / file.size) * 100));
    }
    const complete = await fetch(`${WORKER_URL}/complete-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, uploadId, parts }) });
    if (!complete.ok) throw new Error('complete failed: ' + await complete.text());
    return key;
  } catch (err) {
    try { await fetch(`${WORKER_URL}/abort-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, uploadId }) }) } catch {}
    throw err;
  }
}

export default function EditMovieModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [search,setSearch]=useState(""); const [allMovies,setAllMovies]=useState<any[]>([]); const [filtered,setFiltered]=useState<any[]>([]);
  const [selected,setSelected]=useState<any>(null);
  const [type,setType]=useState("Single"); const [title,setTitle]=useState(""); const [genre,setGenre]=useState(""); const [vj,setVj]=useState("VJ Junior"); const [year,setYear]=useState(""); const [actors,setActors]=useState(""); const [desc,setDesc]=useState("");
  const [coverPreview,setCoverPreview]=useState<string>(""); const [moviePreview,setMoviePreview]=useState<string>("");
  const [currentCoverKey,setCurrentCoverKey]=useState<string|null>(null); const [currentMainKey,setCurrentMainKey]=useState<string|null>(null);
  const [seasons,setSeasons]=useState<any[]>([]);
  const [previewVideos,setPreviewVideos]=useState<any[]>([]);
  const [uploading,setUploading]=useState(false);
  const [coverProg,setCoverProg]=useState(0); const [mainProg,setMainProg]=useState(0);
  const mainRef=useRef<HTMLInputElement>(null); const coverRef=useRef<HTMLInputElement>(null);

  const fetchMovies=async()=>{
    const res=await fetch(`${API_URL}?t=${Date.now()}`,{cache:'no-store'}); const d=await res.json(); const list=Array.isArray(d)?d:d.movies||d.data||[]; setAllMovies(list); setFiltered(list.slice(0,4));
  };
  useEffect(()=>{ if(open) fetchMovies(); },[open]);
  useEffect(()=>{ if(!search) setFiltered(allMovies.slice(0,4)); else setFiltered(allMovies.filter((m:any)=>m.title?.toLowerCase().includes(search.toLowerCase())).slice(0,12)); },[search,allMovies]);

  const updateEpStatus = (seasonId: string, epId: string, patch: any) => {
    setSeasons(prev => prev.map(s => s.id!== seasonId? s : {...s, episodes: s.episodes.map((e:any) => e.id === epId? {...e,...patch } : e)}));
  };

  const loadMovie=async(m:any)=>{
    setSelected(m); setTitle(m.title || ""); setGenre(m.genre || ""); setVj(m.vj || "VJ Junior"); setYear(String(m.year || "")); setActors(m.actors || ""); setDesc(m.description || ""); setType(m.type || "Single");
    setCurrentCoverKey(getRawKey(m,'cover_url')); setCurrentMainKey(getRawKey(m,'main_url')||getRawKey(m,'video_url'));
    setCoverPreview(getR2Url(m.cover_url||m.cover_url_raw)); setMoviePreview(getR2Url(m.main_url||m.video_url||m.main_url_raw)); setCoverProg(0); setMainProg(0);

    let previews:any[] = [];
    try{
      let raw = m.preview_urls || m.previewUrls || [];
      if(typeof raw==='string') raw = JSON.parse(raw);
      previews = raw.map((k:any)=>({ id: crypto.randomUUID(), existingKey: typeof k==='string'? (k.includes('/r2/')?k.split('/r2/')[1]:k) : k, file: null, objectUrl: null, progress:0, status:"done" }));
    }catch{ previews=[]; }
    setPreviewVideos(previews);

    try{
      const res=await fetch(`${API_URL}/${m.id}?t=${Date.now()}`,{cache:'no-store'});
      if(res.ok){
        const full=await res.json(); const movie=full.movie||full.data||full;
        if(movie.preview_urls && movie.preview_urls.length>0 && previews.length===0){
          let raw = movie.preview_urls; if(typeof raw==='string') try{raw=JSON.parse(raw)}catch{}
          setPreviewVideos(raw.map((k:any)=>({ id: crypto.randomUUID(), existingKey: k, file: null, objectUrl: null, progress:0, status:"done" })));
        }
        if(movie.seasons?.length){
          let sd=movie.seasons; if(typeof sd==='string'){ try{sd=JSON.parse(sd);}catch{} }
          const mapped=sd.map((s:any)=>({ id: s.id||crypto.randomUUID(), name: s.name||`Season ${sd.indexOf(s)+1}`, episodes: (s.episodes||[]).map((ep:any)=>({ id: ep.id||crypto.randomUUID(), title: ep.title, file: null, objectUrl: null, main_url: ep.main_url||ep.video_url||ep.main_url_raw, preview_url: ep.preview_url, progress:0, status:"done" })) }));
          setSeasons(mapped);
        } else { setSeasons([]); }
      }
    }catch{ setSeasons([]); }
  };

  const handleUpdate=async()=>{
    if(!selected) return; setUploading(true);
    try{
      let coverKey=currentCoverKey; let mainKey=currentMainKey;
      const nc=coverRef.current?.files?.[0]; if(nc){ const k=currentCoverKey||`covers/${selected.id}-${cleanKey(title)}-${cleanKey(nc.name)}`; coverKey=await uploadToR2(nc,k,(p)=>setCoverProg(p)); }
      const nm=mainRef.current?.files?.[0]; if(nm && type==="Single"){ const k=currentMainKey||`movies/${selected.id}-${cleanKey(title)}-${cleanKey(nm.name)}`; mainKey=await uploadToR2(nm,k,(p)=>setMainProg(p)); }

      const finalPreviewKeys:string[] = [];
      for(const pv of previewVideos){
        if(pv.file){
          const k = pv.existingKey || `previews/${selected.id}-${cleanKey(title)}-${crypto.randomUUID()}-${cleanKey(pv.file.name)}`;
          const uploaded = await uploadToR2(pv.file, k, (pct)=>{
            setPreviewVideos(prev=>prev.map(x=>x.id===pv.id?{...x, progress:pct, status:"uploading"}:x));
          });
          finalPreviewKeys.push(uploaded);
          setPreviewVideos(prev=>prev.map(x=>x.id===pv.id?{...x, progress:100, status:"done", existingKey: uploaded}:x));
        } else if(pv.existingKey){
          finalPreviewKeys.push(pv.existingKey);
        }
      }

      let payload:any={ title: title.trim(), genre: genre.trim(), vj: vj.trim(), type, year: parseInt(year)||null, actors: actors.trim(), description: desc.trim(), cover_url: coverKey, main_url: mainKey, video_url: mainKey, preview_urls: finalPreviewKeys };
      if(type!=="Single"){
        const uploadedSeasons=[];
        for(const season of seasons){
          const eps=[];
          for(const ep of season.episodes as any){
            let epKey=(ep as any).main_url;
            if((ep as any).file){
              const k=(ep as any).main_url && typeof (ep as any).main_url==='string' &&!(ep as any).main_url.includes("blob:")? (ep as any).main_url : `series/${selected.id}/${cleanKey(season.name)}/${ep.id}-${cleanKey((ep as any).file.name)}`;
              epKey=await uploadToR2((ep as any).file,k,(pct)=>{ updateEpStatus(season.id, ep.id, { progress: pct, status: "uploading" }); });
              updateEpStatus(season.id, ep.id, { progress: 100, status: "done" });
            }
            eps.push({ id: ep.id, title: ep.title, main_url: epKey });
          }
          uploadedSeasons.push({ id: season.id, name: season.name, episodes: eps });
        }
        payload.seasons=uploadedSeasons;
      }
      const res=await fetch(`${API_URL}/${selected.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error(await res.text());
      alert(`✅ Updated - Same ID ${safeId(selected.id)}`); onClose(); fetchMovies();
    }catch(e:any){ alert('❌ '+e.message); } finally{ setUploading(false); setCoverProg(0); setMainProg(0); }
  };

  if(!open) return null;
  const isSeries=type==="Full"||type==="Mini";

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div className="cc-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:960, maxHeight:'92vh', display:'flex', flexDirection:'column'}}>
        <div className="cc-modal-head"><h3>✏️ Edit Movie {selected?`- ${safeId(selected.id)} - ${selected.title}`:'- 4 movies'}</h3><button onClick={onClose} className="cc-close">✕</button></div>

        {!selected? (
          <div className="cc-modal-body">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:'100%',padding:'12px',borderRadius:10,border:'1px solid #333',background:'#111',color:'#fff'}} />
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:12,maxHeight:420,overflowY:'auto'}}>
              {filtered.map(m=>(
                <div key={m.id} onClick={()=>loadMovie(m)} style={{display:'flex',gap:10,padding:10,background:'#151515',borderRadius:10,cursor:'pointer',border:'1px solid #222'}}>
                  <img src={getR2Url(m.cover_url)} onError={(e)=>{(e.currentTarget as HTMLImageElement).src=FALLBACK}} style={{width:64,height:84,objectFit:'cover',borderRadius:6}} />
                  <div><div style={{fontWeight:700,fontSize:13}}>{m.title}</div><small style={{color:'#888'}}>{m.type} • {m.year} • {m.genre} • {m.vj}</small></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cc-modal-body" style={{overflowY:'auto'}}>
            <button onClick={()=>setSelected(null)} style={{marginBottom:10,background:'#222',color:'#fff',padding:'6px 12px',borderRadius:8,border:'none'}}>← Back to 4</button>
            <div className="cc-form-grid">
              <div><label>TITLE * - {selected.title}</label><input value={title} onChange={e=>setTitle(e.target.value)} /></div>
              <div><label>YEAR * - {selected.year}</label><input value={year} onChange={e=>setYear(e.target.value)} type="number" /></div>
              <div><label>GENRE - {selected.genre}</label><input value={genre} onChange={e=>setGenre(e.target.value)} /></div>
              <div><label>VJ - {selected.vj}</label><input value={vj} onChange={e=>setVj(e.target.value)} /></div>
              <div><label>ACTORS * - {selected.actors}</label><input value={actors} onChange={e=>setActors(e.target.value)} /></div>
              <div><label>TYPE - {selected.type}</label><select value={type} onChange={e=>{setType(e.target.value); if(e.target.value==="Single") setSeasons([])}}><option value="Single">Single</option><option value="Mini">Mini</option><option value="Full">Full</option></select></div>
              <div style={{gridColumn:'1/-1'}}><label>DESCRIPTION - {selected.description?.slice(0,60)}</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2}></textarea></div>
            </div>

            {!isSeries? (
              <div className="cc-upload-grid">
                <div className="cc-up-box">
                  <label>🎬 MAIN VIDEO - {currentMainKey?'exists':'no video'}</label>
                  {currentMainKey && <button onClick={()=>window.open(getR2Url(currentMainKey)+'?download=1','_blank')} className="cc-btn ghost" style={{fontSize:12,marginBottom:6}}>⬇️ Download Current Video</button>}
                  <input type="file" ref={mainRef} accept="video/*" onChange={e=>{const f=e.target.files?.[0]; if(f){ setMoviePreview(URL.createObjectURL(f)); setMainProg(0); }}} />
                  <div className="prog" style={{ display: mainProg>0?'block':'none', marginTop:10 }}><div className="prog-bar"><div className="prog-fill" style={{width: mainProg+'%'}}></div></div><span className="prog-text">{mainProg}%</span></div>
                  {moviePreview && <video src={moviePreview} controls style={{width:'100%',marginTop:10,borderRadius:8,maxHeight:180,background:'#000'}} />}
                </div>
                <div className="cc-up-box">
                  <label>🖼️ COVER - {currentCoverKey?'exists':'no cover'}</label>
                  {currentCoverKey && <button onClick={()=>window.open(getR2Url(currentCoverKey)+'?download=1','_blank')} className="cc-btn ghost" style={{fontSize:12,marginBottom:6}}>⬇️ Download Cover</button>}
                  <input type="file" ref={coverRef} accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){ setCoverPreview(URL.createObjectURL(f)); setCoverProg(0); }}} />
                  <div className="prog" style={{ display: coverProg>0?'block':'none', marginTop:10 }}><div className="prog-bar"><div className="prog-fill" style={{width: coverProg+'%'}}></div></div><span className="prog-text">{coverProg}%</span></div>
                  {coverPreview && <img src={coverPreview} onError={(e)=>{(e.currentTarget as HTMLImageElement).src=FALLBACK}} style={{width:'100%',marginTop:10,borderRadius:8,maxHeight:180,objectFit:'cover'}} />}
                </div>
              </div>
            ) : (
              <div className="cc-up-box" style={{marginTop:14}}>
                <label>🖼️ SERIES COVER</label>
                {currentCoverKey && <button onClick={()=>window.open(getR2Url(currentCoverKey)+'?download=1','_blank')} className="cc-btn ghost" style={{fontSize:12}}>⬇️ Download Cover</button>}
                <input type="file" ref={coverRef} accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){ setCoverPreview(URL.createObjectURL(f)); setCoverProg(0); }}} />
                <div className="prog" style={{ display: coverProg>0?'block':'none', marginTop:10 }}><div className="prog-bar"><div className="prog-fill" style={{width: coverProg+'%'}}></div></div><span className="prog-text">{coverProg}%</span></div>
                {coverPreview && <img src={coverPreview} onError={(e)=>{(e.currentTarget as HTMLImageElement).src=FALLBACK}} style={{width:'100%',marginTop:10,borderRadius:8,maxHeight:180,objectFit:'cover'}} />}
              </div>
            )}

            {/* UNLIMITED PREVIEW VIDEOS */}
            <div style={{marginTop:20, background:'#0f0f0f', border:'1px solid #222', borderRadius:10, padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                <h4 style={{margin:0}}>🎞️ Preview Videos - {previewVideos.length} {isSeries?'(Series)' : ''}</h4>
                <button onClick={()=>setPreviewVideos([...previewVideos, { id: crypto.randomUUID(), existingKey: null, file: null, objectUrl: null, progress:0, status:"idle" }])} className="cc-btn ghost" style={{fontSize:12}}>➕ Add Preview</button>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                {previewVideos.map((pv:any)=>(
                  <div key={pv.id} style={{background:'#151515', border:'1px solid #2a2a2a', borderRadius:8, padding:8}}>
                    {pv.existingKey &&!pv.file && <video src={getR2Url(pv.existingKey)} controls style={{width:'100%', maxHeight:120, borderRadius:6, background:'#000'}} />}
                    {pv.file && pv.objectUrl && <video src={pv.objectUrl} controls style={{width:'100%', maxHeight:120, borderRadius:6, background:'#000'}} />}
                    {!pv.existingKey &&!pv.file && <div style={{padding:10, background:'#222', borderRadius:6, fontSize:12, color:'#888'}}>No preview yet - click Add File</div>}

                    {pv.progress>0 && pv.progress<100 && <div className="prog" style={{display:'block', marginTop:6}}><div className="prog-bar"><div className="prog-fill" style={{width: pv.progress+'%'}}></div></div><span className="prog-text">{pv.progress}%</span></div>}

                    <div style={{display:'flex', gap:6, marginTop:8}}>
                      {pv.existingKey && <button onClick={()=>window.open(getR2Url(pv.existingKey)+'?download=1','_blank')} className="cc-btn ghost" style={{fontSize:10, flex:1}}>⬇️ Download</button>}
                      <label className="cc-btn ghost" style={{fontSize:10, flex:1, cursor:'pointer', textAlign:'center', background:'#222', borderRadius:6, padding:'6px'}}>
                        {pv.existingKey? '🔄 Replace' : '📁 Add File'}
                        <input type="file" accept="video/*" style={{display:'none'}} onChange={e=>{
                          const f=e.target.files?.[0];
                          if(f){
                            if(pv.objectUrl) URL.revokeObjectURL(pv.objectUrl);
                            const objectUrl = URL.createObjectURL(f);
                            setPreviewVideos(prev=>prev.map(x=>x.id===pv.id?{...x, file:f, objectUrl, progress:0, status:"idle"}:x));
                          }
                        }} />
                      </label>
                      <button onClick={()=>{ if(pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); if(confirm('Delete this preview video?')) setPreviewVideos(prev=>prev.filter(x=>x.id!==pv.id)); }} className="cc-btn ghost" style={{fontSize:10, color:'#ff6666'}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              {previewVideos.length===0 && <small style={{color:'#666'}}>No previews - click + Add Preview for unlimited</small>}
            </div>

            {isSeries && (
              <div style={{marginTop:20}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                  <h4 style={{margin:0}}>📺 Seasons & Episodes - {seasons.length} season(s)</h4>
                  <button onClick={()=>setSeasons([...seasons, { id: crypto.randomUUID(), name: `Season ${seasons.length+1}`, episodes: [] }])} className="cc-btn ghost" style={{fontSize:12}}>➕ Add Season</button>
                </div>

                {seasons.map((season:any)=>(
                  <div key={season.id} style={{background:'#111', border:'1px solid #222', borderRadius:10, padding:12, marginBottom:14}}>
                    <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:12}}>
                      <input value={season.name} onChange={e=>setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, name:e.target.value}:s))} style={{flex:1, padding:'8px 10px', background:'#1a1a1a', border:'1px solid #333', borderRadius:8, color:'#fff'}} />
                      <button onClick={()=>{ if(confirm(`Delete ${season.name}?`)) setSeasons(prev=>prev.filter((s:any)=>s.id!==season.id)) }} className="cc-btn ghost" style={{color:'#ff4444', fontSize:12}}>🗑️ Season</button>
                      <button onClick={()=>setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes:[...s.episodes, { id: crypto.randomUUID(), title: `Episode ${s.episodes.length+1}`, file: null, objectUrl: null, main_url: null, progress:0, status:"idle" }]}:s))} className="cc-btn ghost" style={{fontSize:12}}>➕ Episode</button>
                    </div>

                    <div style={{display:'grid', gap:12}}>
                      {season.episodes.map((ep:any)=>(
                        <div key={ep.id} style={{background:'#151515', border:'1px solid #2a2a2a', borderRadius:10, padding:10, display:'flex', gap:12}}>
                          <div style={{flex:1}}>
                            <input value={ep.title} onChange={e=>setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes: s.episodes.map((ev:any)=>ev.id===ep.id?{...ev, title:e.target.value}:ev)}:s))} placeholder="Episode title" style={{width:'100%', padding:'6px 8px', background:'#222', border:'1px solid #333', borderRadius:6, color:'#fff', fontSize:13, marginBottom:8}} />

                            {!ep.main_url &&!ep.file && (
                              <div style={{border:'1px dashed #444', borderRadius:8, padding:12, textAlign:'center'}}>
                                <small style={{color:'#888'}}>New episode - no video yet</small>
                                <div style={{marginTop:8}}>
                                  <label className="cc-btn primary" style={{fontSize:12, cursor:'pointer', padding:'6px 12px', borderRadius:6}}>
                                    📁 Select Video
                                    <input type="file" accept="video/*" style={{display:'none'}} onChange={e=>{
                                      const f=e.target.files?.[0];
                                      if(f){
                                        const objectUrl = URL.createObjectURL(f);
                                        setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes: s.episodes.map((ev:any)=>ev.id===ep.id?{...ev, file:f, objectUrl}:ev)}:s));
                                      }
                                    }} />
                                  </label>
                                </div>
                              </div>
                            )}

                            {ep.main_url &&!ep.file && (
                              <video src={getR2Url(ep.main_url)} controls style={{width:'100%', maxHeight:160, borderRadius:8, background:'#000'}} />
                            )}
                            {ep.file && ep.objectUrl && (
                              <video src={ep.objectUrl} controls style={{width:'100%', maxHeight:160, borderRadius:8, background:'#000'}} />
                            )}

                            {ep.progress>0 && ep.progress<100 && (
                              <div className="prog" style={{display:'block', marginTop:8}}><div className="prog-bar"><div className="prog-fill" style={{width: ep.progress+'%'}}></div></div><span className="prog-text">{ep.progress}% uploading...</span></div>
                            )}
                            {ep.status==="done" && ep.main_url &&!ep.file && <small style={{color:'#0f0'}}>✅ Ready in R2</small>}
                            {ep.file && <small style={{color:'#ff0'}}>🆕 New file - will upload on Save</small>}
                          </div>

                          <div style={{display:'flex', flexDirection:'column', gap:6, minWidth:110}}>
                            {ep.main_url && (
                              <>
                                <button onClick={()=>window.open(getR2Url(ep.main_url)+'?download=1','_blank')} className="cc-btn ghost" style={{fontSize:11, padding:'6px 8px'}}>⬇️ Download</button>
                                <label className="cc-btn ghost" style={{fontSize:11, padding:'6px 8px', cursor:'pointer', textAlign:'center', background:'#222', borderRadius:6}}>
                                  🔄 Replace
                                  <input type="file" accept="video/*" style={{display:'none'}} onChange={e=>{
                                    const f=e.target.files?.[0];
                                    if(f){
                                      if(ep.objectUrl) URL.revokeObjectURL(ep.objectUrl);
                                      const objectUrl = URL.createObjectURL(f);
                                      setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes: s.episodes.map((ev:any)=>ev.id===ep.id?{...ev, file:f, objectUrl, progress:0, status:"idle"}:ev)}:s));
                                    }
                                  }} />
                                </label>
                              </>
                            )}
                            {!ep.main_url && ep.file && (
                              <label className="cc-btn ghost" style={{fontSize:11, padding:'6px 8px', cursor:'pointer', textAlign:'center', background:'#222', borderRadius:6}}>
                                🔄 Change File
                                <input type="file" accept="video/*" style={{display:'none'}} onChange={e=>{
                                  const f=e.target.files?.[0];
                                  if(f){
                                    if(ep.objectUrl) URL.revokeObjectURL(ep.objectUrl);
                                    const objectUrl = URL.createObjectURL(f);
                                    setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes: s.episodes.map((ev:any)=>ev.id===ep.id?{...ev, file:f, objectUrl}:ev)}:s));
                                  }
                                }} />
                              </label>
                            )}
                            <button onClick={()=>{ if(ep.objectUrl) URL.revokeObjectURL(ep.objectUrl); if(confirm(`Delete "${ep.title}"?\nConfirm to delete`)){ setSeasons(prev=>prev.map((s:any)=>s.id===season.id?{...s, episodes: s.episodes.filter((ev:any)=>ev.id!==ep.id)}:s)); }}} className="cc-btn ghost" style={{fontSize:11, padding:'6px 8px', color:'#ff6666'}}>🗑️ Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="cc-modal-foot">
            <button onClick={async()=>{ if(confirm(`Delete ${selected.title}?`)){ await fetch(`${API_URL}/${selected.id}`,{method:'DELETE'}); setSelected(null); fetchMovies(); }}} className="cc-btn ghost" style={{color:'#ff4444',marginRight:'auto'}}>🗑️ Delete Movie</button>
            <button onClick={onClose} disabled={uploading} className="cc-btn ghost">Cancel</button>
            <button disabled={uploading} onClick={handleUpdate} className="cc-btn primary">{uploading?`Uploading...`:`💾 Save Keep ID ${safeId(selected.id)}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}
