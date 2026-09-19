"use client";
export default function VideoMetaInfo({ movie, descExpanded, setDescExpanded }: any) {
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
        <p className={`c-desc ${!descExpanded? 'clamped' : ''}`}>{movie.description}</p>
        {movie.description?.length > 100 && (
          <button className="c-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
            {descExpanded? "See less" : "...more"}
          </button>
        )}
      </div>
    </div>
  );
}
