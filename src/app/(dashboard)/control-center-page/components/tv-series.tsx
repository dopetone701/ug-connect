"use client";

export type EpisodeDraft = {
  id: string;
  title: string;
  file: File | null;
  url: string | null;
  previewFile: File | null;
  previewUrl: string | null;
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
  const addSeason = () => {
    if (seasons.length > 0) {
      const last = seasons[seasons.length - 1];
      if (last.episodes.length === 0) {
        const ok = confirm(`${last.name} has no episodes yet. Add ${label} ${seasons.length + 1} anyway?`);
        if (!ok) return;
      }
    }
    setSeasons([...seasons, {
      id: Date.now().toString(),
      name: `${label} ${seasons.length + 1}`,
      episodes: []
    }]);
  };

  const updateSeasonName = (id: string, name: string) => {
    setSeasons(seasons.map(s => s.id === id? {...s, name } : s));
  };

  const removeSeason = (id: string) => {
    if(confirm('Delete this season?')) setSeasons(seasons.filter(s => s.id!== id));
  };

  const addEpisode = (seasonId: string) => {
    setSeasons(seasons.map(s => s.id!== seasonId? s : {
     ...s,
      episodes: [...s.episodes, {
        id: Date.now().toString(),
        title: `Episode ${s.episodes.length + 1}`,
        file: null,
        url: null,
        previewFile: null,
        previewUrl: null
      }]
    }));
  };

  const updateEpisode = (seasonId: string, epId: string, patch: Partial<EpisodeDraft>) => {
    setSeasons(seasons.map(s => s.id!== seasonId? s : {
     ...s,
      episodes: s.episodes.map(e => e.id === epId? {...e,...patch } : e)
    }));
  };

  const removeEpisode = (seasonId: string, epId: string) => {
    setSeasons(seasons.map(s => s.id!== seasonId? s : {
     ...s, episodes: s.episodes.filter(e => e.id!== epId)
    }));
  };

  return (
    <div className="series-manager">
      <div className="series-head">
        <h4>📺 {label}s - {seasons.length}</h4>
        <button type="button" onClick={addSeason} className="cc-btn primary small">+ Add {label}</button>
      </div>
      {seasons.map((season) => (
        <div key={season.id} className="season-block">
          <div className="season-header">
            <input value={season.name} onChange={e => updateSeasonName(season.id, e.target.value)} className="season-name-input" />
            <div style={{display:'flex', gap:6}}>
              <button type="button" onClick={() => addEpisode(season.id)} className="cc-btn ghost small">+ Episode</button>
              <button type="button" onClick={() => removeSeason(season.id)} className="cc-btn danger small">✕</button>
            </div>
          </div>
          <div className="episode-list">
            {season.episodes.map((ep, idx) => (
              <div key={ep.id} className="episode-row">
                <div className="ep-num">{idx + 1}</div>
                <div className="ep-fields">
                  <input placeholder="Episode Title" value={ep.title} onChange={e => updateEpisode(season.id, ep.id, { title: e.target.value })} />
                  <div className="ep-file-grid">
                    <label className="ep-file">
                      <span>🎬 Episode *</span>
                      <input type="file" accept="video/*" onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (ep.url) URL.revokeObjectURL(ep.url);
                          updateEpisode(season.id, ep.id, { file: f, url: URL.createObjectURL(f) });
                        }
                      }} />
                    </label>
                    <label className="ep-file">
                      <span>🎞️ Preview Clip</span>
                      <input type="file" accept="video/*" onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (ep.previewUrl) URL.revokeObjectURL(ep.previewUrl);
                          updateEpisode(season.id, ep.id, { previewFile: f, previewUrl: URL.createObjectURL(f) });
                        }
                      }} />
                    </label>
                  </div>
                  {ep.url && <video src={ep.url} controls style={{width:'100%', height:60, borderRadius:6}} />}
                </div>
                <button type="button" onClick={() => removeEpisode(season.id, ep.id)} className="ep-remove">✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
