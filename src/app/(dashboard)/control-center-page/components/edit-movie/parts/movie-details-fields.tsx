"use client";

import type { CastMember, MovieType } from "../types";

import {
  VJ_OPTIONS,
  GENRE_OPTIONS,
  MOVIE_TYPES,
  getR2Url,
  CATEGORY_OPTIONS,
} from "../constants";

import type { MovieCategoryId } from "../constants";

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

  category: MovieCategoryId | "";
  setCategory: (v: MovieCategoryId | "") => void;
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
  category,
  setCategory,
}: Props) {
  const addCastMember = () => {
    if (cast.length >= 5) {
      alert("Max 5 cast members");
      return;
    }

    setCast([...cast, { name: "", photo: null }]);
  };

  const updateCastName = (index: number, name: string) => {
    setCast(
      cast.map((member, i) =>
        i === index ? { ...member, name } : member
      )
    );
  };

  const updateCastPhoto = (index: number, file: File) => {
    const objectUrl = URL.createObjectURL(file);

    setCast(
      cast.map((member, i) =>
        i === index
          ? {
              ...member,
              photo: objectUrl,
              _file: file,
            } as CastMember
          : member
      )
    );
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  return (
    <div className="cc-form-grid">
      {/* TITLE */}
      <div>
        <label>TITLE *</label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Movie title"
        />
      </div>

      {/* YEAR */}
      <div>
        <label>YEAR *</label>

        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          type="number"
          placeholder="2024"
        />
      </div>

      {/* GENRE */}
      <div>
        <label>GENRE</label>

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">Select genre</option>

          {GENRE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* VJ */}
      <div>
        <label>VJ</label>

        <select
          value={vj}
          onChange={(e) => setVj(e.target.value)}
        >
          {VJ_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* ACTORS */}
      <div>
        <label>ACTORS (comma separated) *</label>

        <input
          value={actors}
          onChange={(e) => setActors(e.target.value)}
          placeholder="Actor 1, Actor 2"
        />
      </div>

      {/* MOVIE TYPE */}
      <div>
        <label>TYPE</label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as MovieType)}
        >
          {MOVIE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* CATEGORY / ORIGIN */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label>
          CATEGORY / ORIGIN * (for ExploreMore market filter)
        </label>

        <select
          value={category}
          onChange={(e) => {
            const nextCategory = e.target.value as MovieCategoryId | "";
            setCategory(nextCategory);
          }}
          style={{
            borderColor: category
              ? "hsl(145 65% 40%)"
              : "hsl(var(--border))",
          }}
        >
          <option value="">Select category</option>

          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} - {c.searchQuery}
            </option>
          ))}
        </select>

        {!category && (
          <small
            style={{
              display: "block",
              marginTop: 5,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Select a category or origin before saving.
          </small>
        )}
      </div>

      {/* CAST WITH PHOTOS */}
      <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <label>CAST WITH PHOTOS (max 5) - {cast.length}/5</label>

          <button
            type="button"
            onClick={addCastMember}
            disabled={cast.length >= 5}
            className="cc-btn ghost"
            style={{
              fontSize: 12,
              opacity: cast.length >= 5 ? 0.5 : 1,
              cursor: cast.length >= 5 ? "not-allowed" : "pointer",
            }}
          >
            + Add Cast
          </button>
        </div>

        {cast.length === 0 && (
          <small style={{ color: "#666" }}>
            No cast photos yet. Click Add Cast.
          </small>
        )}

        <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 10,
          }}
        >
          {cast.map((member, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                padding: 10,
                borderRadius: 8,
              }}
            >
              {/* CAST PHOTO PREVIEW */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#222",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {member.photo ? (
                  <img
                    src={
                      member.photo.startsWith("http") ||
                      member.photo.startsWith("blob:")
                        ? member.photo
                        : getR2Url(member.photo)
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt={member.name || `Cast member ${idx + 1}`}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  </div>
                )}
              </div>

              {/* CAST NAME */}
              <input
                value={member.name}
                onChange={(e) =>
                  updateCastName(idx, e.target.value)
                }
                placeholder={`Cast ${idx + 1} name`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "8px 10px",
                  background: "hsl(var(--bg))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  color: "hsl(var(--text))",
                }}
              />

              {/* PHOTO UPLOAD */}
              <label
                className="cc-btn ghost"
                style={{
                  fontSize: 11,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Photo

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      updateCastPhoto(idx, file);
                    }

                    e.target.value = "";
                  }}
                />
              </label>

              {/* REMOVE CAST MEMBER */}
              <button
                type="button"
                onClick={() => removeCast(idx)}
                aria-label={`Remove cast member ${idx + 1}`}
                style={{
                  color: "#ff4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label>DESCRIPTION</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Movie description..."
        />
      </div>
    </div>
  );
}
