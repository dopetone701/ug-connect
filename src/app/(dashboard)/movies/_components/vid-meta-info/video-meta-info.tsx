"use client";

function parseCastFromMovie(movie: any): { name: string; photo: string | null }[] {
  if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
    return movie.cast.slice(0, 4).map((c: any) => {
      if (typeof c === "string") return { name: c, photo: null };
      return {
        name: c?.name || c?.actor || c?.fullName || String(c),
        photo: c?.photo || c?.image || c?.avatar || c?.profile_path || c?.headshot || null,
      };
    });
  }
  const rawActors = String(movie?.actors || movie?.cast || "").trim();
  if (!rawActors) return [];
  try {
    const parsed = JSON.parse(rawActors);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 4).map((c: any) => typeof c === "string" ? { name: c, photo: null } : { name: c?.name || String(c), photo: c?.photo || null });
    }
  } catch {}
  return rawActors.split(",").map((a: string) => a.trim()).filter(Boolean).slice(0, 4).map((name) => ({ name, photo: null }));
}

export default function VideoMetaInfo({ movie, descExpanded, setDescExpanded }: any) {
  const cast = parseCastFromMovie(movie);

  return (
    <div className="connect-desc-block">
      <h1 className="c-title">{movie.title}</h1>
      <div className="c-meta-row">
        <span className="c-pill">{movie.genre}</span>
        <span className="c-pill muted">{movie.vj}</span>
        <span className="c-pill muted">{movie.year || "2024"}</span>
        <span className="c-pill muted">{movie.rating || "HD"}</span>
      </div>
      <div className="c-desc-wrap">
        <p className={`c-desc ${!descExpanded ? "clamped" : ""}`}>{movie.description}</p>
        {movie.description?.length > 100 && (
          <button className="c-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
            {descExpanded ? "See less" : "...more"}
          </button>
        )}
      </div>

      {cast.length > 0 && (
        <div className="c-cast-row">
          <div className="c-cast-header">Cast</div>
          <div className="c-cast-list">
            {cast.map((m, i) => {
              const initial = m.name.charAt(0).toUpperCase();
              return (
                <div key={`${m.name}-${i}`} className="c-cast-item" title={m.name}>
                  <div className="c-cast-avatar">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo} alt={m.name} className="c-cast-img" />
                    ) : (
                      <span className="c-cast-fallback">{initial}</span>
                    )}
                  </div>
                  <span className="c-cast-name">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

     <style jsx>{`
  .c-cast-header {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--text));
    margin-bottom: 10px;
  }
  .c-cast-row {
    margin-top: 14px;
  }
  .c-cast-list {
    display: flex;
    flex-direction: row;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .c-cast-list::-webkit-scrollbar {
    display: none;
  }
  .c-cast-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    width: 64px;
  }
  .c-cast-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    background: hsl(var(--surface-hover));
    border: 1px solid hsl(var(--border));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .c-cast-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .c-cast-fallback {
    font-size: 20px;
    font-weight: 700;
    color: hsl(var(--text));
    line-height: 1;
    text-transform: uppercase;
  }
  .c-cast-name {
    width: 100%;
    font-size: 12px;
    line-height: 1.2;
    text-align: center;
    color: hsl(var(--text) / 0.9);
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`}</style>



    </div>
  );
}

