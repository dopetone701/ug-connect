// edit-movie/parts/movie-details-fields.tsx - with cast support

"use client";
import type { CastMember, MovieType } from "../types";
import { VJ_OPTIONS, GENRE_OPTIONS, MOVIE_TYPES, getR2Url } from "../constants";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  vj: string;
  setVj: (v: string) => void;
  type: MovieType;
  setType: (v: MovieType) => void;
  year: string;
  setYear: (v: string) => void;
  actors: string;
  setActors: (v: string) => void;
  cast: CastMember[];
  setCast: (v: CastMember[]) => void;
  description: string;
  setDescription: (v: string) => void;
};

export default function MovieDetailsFields({
  title,
  setTitle,
  genre,
  setGenre,
  vj,
  setVj,
  type,
  setType,
  year,
  setYear,
  actors,
  setActors,
  cast,
  setCast,
  description,
  setDescription,
}: Props) {
  const addCastMember = () => {
    if (cast.length >= 5) {
      alert("Max 5 cast members");
      return;
    }
    setCast([...cast, { name: "", photo: null }]);
  };

  const updateCastName = (index: number, name: string) => {
    const updated = [...cast];
    updated[index] = { ...updated[index], name };
    setCast(updated);
  };

  const updateCastPhoto = (index: number, file: File) => {
    // For edit, we will upload immediately or keep file reference
    // For now store object URL, actual upload happens in main modal
    const objectUrl = URL.createObjectURL(file);
    const updated = [...cast];
    updated[index] = { ...updated[index], photo: objectUrl, _file: file } as any;
    setCast(updated);
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  return (
    <div className="cc-form-grid">
      <div>
        <label>TITLE *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie title" />
      </div>
      <div>
        <label>YEAR *</label>
        <input value={year} onChange={(e) => setYear(e.target.value)} type="number" placeholder="2024" />
      </div>
      <div>
        <label>GENRE</label>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Select genre</option>
          {GENRE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div>
        <label>VJ</label>
        <select value={vj} onChange={(e) => setVj(e.target.value)}>
          {VJ_OPTIONS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label>ACTORS (comma separated) *</label>
        <input value={actors} onChange={(e) => setActors(e.target.value)} placeholder="Actor 1, Actor 2" />
      </div>
      <div>
        <label>TYPE</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MovieType)}
        >
          {MOVIE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* CAST WITH PHOTOS - NEW SYSTEM */}
      <div style={{ gridColumn: "1/-1", marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label>🎭 CAST WITH PHOTOS (max 5) - {cast.length}/5</label>
          <button type="button" onClick={addCastMember} className="cc-btn ghost" style={{ fontSize: 12 }}>
            ➕ Add Cast
          </button>
        </div>
        
        {cast.length === 0 && (
          <small style={{ color: "#666" }}>No cast photos yet - click Add Cast. These will show on watch page.</small>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {cast.map((member, idx) => (
            <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", padding: 10, borderRadius: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "#222", overflow: "hidden", flexShrink: 0 }}>
                {member.photo ? (
                  <img src={member.photo.startsWith("http") || member.photo.startsWith("blob:") ? member.photo : getR2Url(member.photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>👤</div>
                )}
              </div>
              <input
                value={member.name}
                onChange={(e) => updateCastName(idx, e.target.value)}
                placeholder={`Cast ${idx + 1} name`}
                style={{ flex: 1, padding: "8px 10px", background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", borderRadius: 6, color: "hsl(var(--text))" }}
              />
              <label className="cc-btn ghost" style={{ fontSize: 11, cursor: "pointer" }}>
                📷 Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) updateCastPhoto(idx, f); }} />
              </label>
              <button onClick={() => removeCast(idx)} style={{ color: "#ff4444", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ gridColumn: "1/-1" }}>
        <label>DESCRIPTION</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Movie description..."></textarea>
      </div>
    </div>
  );
}
