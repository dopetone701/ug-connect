"use client";
import { useState, useEffect } from "react";

export type EpisodeDraft = {
  id: string;
  title: string;
  file: File | null;
  url: string | null;
  previewFile: File | null;
  previewUrl: string | null;
  progress?: number;
  status?: "idle" | "uploading" | "done" | "error";
  error?: string;
  main_url?: string | null;
  preview_url?: string | null;
};

export type SeasonDraft = {
  id: string;
  name: string;
  episodes: EpisodeDraft[];
};

export function SeasonManager({
  seasons,
  setSeasons,
  label = "Season"
}: {
  seasons: SeasonDraft[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonDraft[]>>;
  label?: string
}) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  // FIX: By default ALL episodes are minimized (true) - expand on click
  useEffect(() => {
    const newMap: Record<string, boolean> = {};
    seasons.forEach(s => {
      s.episodes.forEach(ep => {
        if (!(ep.id in collapsedMap)) {
          newMap[ep.id] = true; // minimized by default
        }
      });
    });
    if (Object.keys(newMap).length > 0) {
      setCollapsedMap(prev => ({ ...newMap, ...prev }));
    }
  }, [seasons]);

  const toggle = (id: string, v?: boolean) => setCollapsedMap(p => ({ ...p, [id]: v ?? !p[id] }));

  return (
    <div className="series-manager">
      <style>{`
        .series-manager{ display:flex; flex-direction:column; gap:12px; }
        .season-block{ border:1px solid hsl(var(--border)); border-radius:16px; padding:12px; background:hsl(var(--bg)); }
        .season-header{ display:flex; justify-content:space-between; gap:8px; align-items:center; margin-bottom:10px; }
        .season-name-input{ flex:1; height:38px; padding:0 12px; border-radius:10px; border:1px solid hsl(var(--border)); background:hsl(var(--surface)); color:hsl(var(--text)); font-weight:600; outline:none; }
        .season-name-input:focus{ border-color:hsl(var(--primary)); }
        .episode-grid{ display:flex; flex-wrap:wrap; gap:10px; }
        .ep-tile{
          width:76px; height:76px; border-radius:14px;
          border:1.5px solid hsl(var(--border));
          background:hsl(var(--surface));
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          cursor:pointer; position:relative; transition:all .15s ease; flex:0 0 76px;
          color:hsl(var(--text));
        }
        .ep-tile:hover{ border-color:hsl(var(--primary)); background:hsl(var(--surface-hover)); transform:translateY(-2px); }
        .ep-tile.has-file{ border-color:hsl(var(--primary) / 0.6); background:hsl(var(--surface)); box-shadow:0 0 0 2px hsl(var(--primary) / 0.12); }
        .ep-tile.done{ border-color:hsl(var(--primary)); background:hsl(var(--primary)); color:hsl(var(--primary-text)); }
        .ep-tile.error{ border-color:hsl(0 85% 60%); background:hsl(0 35% 12%); color:hsl(0 15% 96%); }
        .ep-tile-num{ font-size:22px; font-weight:800; line-height:1; }
        .ep-tile-title{ font-size:9px; font-weight:600; opacity:0.7; max-width:62px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; color:inherit; }
        .ep-tile-expand{ position:absolute; top:6px; right:6px; font-size:12px; opacity:0.8; }
        .ep-tile.done .ep-tile-expand{ color:hsl(var(--primary-text)); }
        .ep-tile-badge{ position:absolute; bottom:4px; right:6px; font-size:8px; }
        .episode-row{ border:1px solid hsl(var(--border)); border-radius:14px; padding:10px; background:hsl(var(--surface)); display:flex; gap:10px; width:100%; animation: slideDown .2s ease; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .ep-num{ font-weight:800; padding-top:8px; color:hsl(var(--text-muted)); min-width:18px; text-align:center; }
        .ep-fields{ flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
        .ep-fields input[type="text"]{ height:38px; border-radius:10px; border:1px solid hsl(var(--border)); background:hsl(var(--bg)); padding:0 12px; color:hsl(var(--text)); outline:none; }
        .ep-fields input[type="text"]:focus{ border-color:hsl(var(--primary)); }
        .ep-file-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .ep-file{ display:flex; flex-direction:column; gap:4px; font-size:11px; font-weight:600; border:1px dashed hsl(var(--border)); border-radius:10px; padding:8px; cursor:pointer; color:hsl(var(--text)); background:hsl(var(--bg)); }
        .ep-file.has-file{ border-style:solid; border-color:hsl(var(--primary) / 0.5); }
        .ep-remove{ width:32px; height:32px; border-radius:50%; border:1px solid hsl(var(--border)); background:hsl(var(--surface-hover)); color:hsl(var(--text)); cursor:pointer; display:grid; place-items:center; }
        .cc-btn-done{ height:36px; padding:0 16px; border-radius:10px; border:none; background:hsl(var(--primary)); color:hsl(var(--primary-text)); font-weight:700; font-size:13px; cursor:pointer; }
        .cc-btn-done:disabled{ opacity:0.4; cursor:not-allowed; background:hsl(var(--surface-hover)); color:hsl(var(--text-muted)); }
      `}</style>

      <div className="series-head" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h4 style={{color:'hsl(var(--text))', fontSize:14, fontWeight:700}}>📺 {label}s - {seasons.length}</h4>
        <button type="button" onClick={() => setSeasons(prev => [...prev, { id: crypto.randomUUID(), name: `${label} ${prev.length+1}`, episodes: [] }])} style={{background:'hsl(var(--primary))', color:'hsl(var(--primary-text))', border:'none', height:32, borderRadius:10, padding:'0 12px', fontWeight:700, cursor:'pointer'}}>+ Add {label}</button>
      </div>

      {seasons.map((season) => (
        <div key={season.id} className="season-block">
          <div className="season-header">
            <input value={season.name} onChange={e => setSeasons(prev => prev.map(s => s.id===season.id ? {...s, name: e.target.value} : s))} className="season-name-input" />
            <div style={{display:'flex', gap:6}}>
              <button type="button" onClick={() => {
                const newId = crypto.randomUUID();
                setSeasons(prev => prev.map(s => s.id!==season.id ? s : {...s, episodes:[...s.episodes, { id:newId, title:`Episode ${s.episodes.length+1}`, file:null, url:null, previewFile:null, previewUrl:null, progress:0, status:"idle" as const }]}));
                setCollapsedMap(p => ({ ...p, [newId]: false }));
              }} style={{height:32, borderRadius:10, border:'1px solid hsl(var(--border))', background:'hsl(var(--surface))', color:'hsl(var(--text))', padding:'0 10px', fontSize:12, fontWeight:700, cursor:'pointer'}}>+ Episode</button>
              <button type="button" onClick={() => setSeasons(prev => prev.filter(s => s.id!==season.id))} style={{width:32, height:32, borderRadius:10, border:'1px solid hsl(var(--border))', background:'hsl(var(--surface))', cursor:'pointer'}}>✕</button>
            </div>
          </div>

          <div className="episode-grid">
            {season.episodes.map((ep, idx) => {
              const isCollapsed = collapsedMap[ep.id] ?? true;
              const hasMain = !!ep.file || !!(ep as any).main_url;
              const isDone = ep.status === "done" || !!(ep as any).main_url;

              if (isCollapsed) {
                return (
                  <div key={ep.id} onClick={() => toggle(ep.id, false)} className={`ep-tile ${hasMain ? 'has-file' : ''} ${isDone ? 'done' : ''} ${ep.status==='error' ? 'error' : ''}`}>
                    <div className="ep-tile-expand">⤢</div>
                    <div className="ep-tile-num">{idx+1}</div>
                    <div className="ep-tile-title">{ep.title || `Ep ${idx+1}`}</div>
                    {(ep.previewFile || (ep as any).preview_url) && <div className="ep-tile-badge">🎞️</div>}
                  </div>
                )
              }

              return (
                <div key={ep.id} className="episode-row">
                  <div className="ep-num">{idx+1}</div>
                  <div className="ep-fields">
                    <input placeholder="Episode Title" value={ep.title} onChange={e => setSeasons(prev => prev.map(s => s.id!==season.id ? s : {...s, episodes:s.episodes.map(x => x.id===ep.id ? {...x, title:e.target.value} : x)}))} />
                    <div className="ep-file-grid">
                      <label className={`ep-file ${hasMain ? 'has-file' : ''}`}>
                        <span>🎬 Main * {hasMain ? '✅' : ''}</span>
                        <input type="file" accept="video/*" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; if(ep.url) URL.revokeObjectURL(ep.url); setSeasons(prev => prev.map(s => s.id!==season.id ? s : {...s, episodes:s.episodes.map(x => x.id===ep.id ? {...x, file:f, url:URL.createObjectURL(f), status:"idle" as const, progress:0} : x)})) }} />
                        {ep.file && <small style={{wordBreak:'break-all'}}>{ep.file.name}</small>}
                        {(ep as any).main_url && !ep.file && <small style={{color:'hsl(var(--primary))'}}>✅ Existing</small>}
                      </label>
                      <label className="ep-file">
                        <span>🎞️ Preview</span>
                        <input type="file" accept="video/*,image/*" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; if(ep.previewUrl) URL.revokeObjectURL(ep.previewUrl); setSeasons(prev => prev.map(s => s.id!==season.id ? s : {...s, episodes:s.episodes.map(x => x.id===ep.id ? {...x, previewFile:f, previewUrl:URL.createObjectURL(f)} : x)})) }} />
                        {ep.previewFile && <small>{ep.previewFile.name}</small>}
                      </label>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button type="button" disabled={!hasMain} onClick={() => toggle(ep.id, true)} className="cc-btn-done">{hasMain ? '✓ Done' : 'Add video'}</button>
                    </div>
                  </div>
                  <button type="button" onClick={()=>{ if(ep.url) URL.revokeObjectURL(ep.url); if(ep.previewUrl) URL.revokeObjectURL(ep.previewUrl); setSeasons(prev => prev.map(s => s.id!==season.id ? s : {...s, episodes:s.episodes.filter(x=>x.id!==ep.id)})) }} className="ep-remove">✕</button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SeasonManager;
