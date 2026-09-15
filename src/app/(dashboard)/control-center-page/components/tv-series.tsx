"use client";

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
  seasons: SeasonDraft[],
  setSeasons: (s: SeasonDraft[]) => void,
  label?: string
}) {
  return (
    <div className="series-manager">
      <div className="series-head">
        <h4>📺 {label}s - {seasons.length}</h4>
        <button type="button" onClick={() => {
          setSeasons([...seasons, { id: crypto.randomUUID(), name: `${label} ${seasons.length+1}`, episodes: [] }])
        }} className="cc-btn primary small">+ Add {label}</button>
      </div>

      {seasons.map((season) => (
        <div key={season.id} className="season-block">
          <div className="season-header">
            <input
              value={season.name}
              onChange={e => setSeasons(seasons.map(s => s.id===season.id ? {...s, name: e.target.value} : s))}
              className="season-name-input"
            />
            <div style={{display:'flex', gap:6}}>
              <button type="button" onClick={() => setSeasons(seasons.map(s => s.id!==season.id ? s : {
                ...s, episodes: [...s.episodes, {
                  id: crypto.randomUUID(),
                  title: `Episode ${s.episodes.length+1}`,
                  file: null, url: null, previewFile: null, previewUrl: null,
                  progress: 0, status: "idle"
                }]
              }))} className="cc-btn ghost small">+ Episode</button>
              <button type="button" onClick={() => setSeasons(seasons.filter(s => s.id!==season.id))} className="cc-btn danger small">✕</button>
            </div>
          </div>

          <div className="episode-list">
            {season.episodes.map((ep, idx) => {
              const isDone = ep.status === "done";
              const isUploading = ep.status === "uploading";
              return (
                <div key={ep.id} className="episode-row" style={{
                  opacity: isDone ? 0.6 : 1,
                }}>
                  <div className="ep-num">{isDone ? "✅" : idx+1}</div>
                  <div className="ep-fields">
                    <input
                      placeholder="Episode Title"
                      value={ep.title}
                      onChange={e => setSeasons(seasons.map(s => s.id!==season.id ? s : {
                        ...s, episodes: s.episodes.map(x => x.id===ep.id ? {...x, title: e.target.value} : x)
                      }))}
                    />
                    <div className="ep-file-grid">
                      <label className="ep-file"><span>🎬 Episode *</span>
                        <input type="file" accept="video/*" onChange={e=>{
                          const f = e.target.files?.[0]; if(!f) return;
                          if(ep.url) URL.revokeObjectURL(ep.url);
                          setSeasons(seasons.map(s => s.id!==season.id ? s : {
                            ...s, episodes: s.episodes.map(x => x.id===ep.id ? {...x, file: f, url: URL.createObjectURL(f), status: "idle" as const, progress: 0} : x)
                          }))
                        }} />
                        {ep.url && <small style={{color:'#00ff88'}}>{ep.file?.name}</small>}
                      </label>
                      <label className="ep-file"><span>🎞️ Preview</span>
                        <input type="file" accept="video/*,image/*" onChange={e=>{
                          const f = e.target.files?.[0]; if(!f) return;
                          if(ep.previewUrl) URL.revokeObjectURL(ep.previewUrl);
                          setSeasons(seasons.map(s => s.id!==season.id ? s : {
                            ...s, episodes: s.episodes.map(x => x.id===ep.id ? {...x, previewFile: f, previewUrl: URL.createObjectURL(f)} : x)
                          }))
                        }} />
                      </label>
                    </div>

                    {(ep.status === "uploading" || ep.status === "done" || ep.status === "error") && (
                      <div style={{marginTop:8}}>
                        <div style={{height:6, background:"#222", borderRadius:99, overflow:"hidden"}}>
                          <div style={{
                            width: `${ep.progress || 0}%`,
                            height:"100%",
                            background: ep.status==="done" ? "#00ff88" : ep.status==="error" ? "#ff3b3b" : "#3b82f6",
                            transition: "width 0.2s"
                          }} />
                        </div>
                        <div style={{fontSize:11, marginTop:4, display:"flex", justifyContent:"space-between"}}>
                          <span>{isUploading ? `Uploading ${ep.progress}%` : isDone ? "✅ DONE" : `❌ ${ep.error || 'ERROR'}`}</span>
                          <span>{ep.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => {
                    if(ep.url) URL.revokeObjectURL(ep.url);
                    if(ep.previewUrl) URL.revokeObjectURL(ep.previewUrl);
                    setSeasons(seasons.map(s => s.id!==season.id ? s : {
                      ...s, episodes: s.episodes.filter(x => x.id!==ep.id)
                    }))
                  }} className="ep-remove">✕</button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
