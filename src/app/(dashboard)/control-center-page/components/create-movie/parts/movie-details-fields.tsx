// src/app/(dashboard)/control-center-page/components/create-movie/parts/movie-details-fields.tsx
"use client";
import React, { useEffect, useRef } from "react";
import type { MovieType, ActorDraft } from "../types";
import { MAX_ACTORS, generateShortId } from "../constants";


interface MovieDetailsFieldsProps {
  title: string;
  setTitle: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  vj: string;
  setVj: (v: string) => void;
  actors: ActorDraft[];
  setActors: (v: ActorDraft[]) => void;
  type: MovieType;
  setType: (v: MovieType) => void;
  desc: string;
  setDesc: (v: string) => void;
  onTypeChange?: (newType: MovieType) => void;
  disabled?: boolean;
}


export default function MovieDetailsFields({
  title,
  setTitle,
  year,
  setYear,
  genre,
  setGenre,
  vj,
  setVj,
  actors,
  setActors,
  type,
  setType,
  desc,
  setDesc,
  onTypeChange,
  disabled,
}: MovieDetailsFieldsProps) {
  return (
    <>
      <div className="cc-form-grid">
        <div>
          <label>TITLE *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="BATTLE OF KAMPALA"
          />
        </div>
        <div>
          <label>YEAR *</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            type="number"
          />
        </div>
        <div>
          <label>GENRE</label>
          <input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </div>
        <div>
          <label>VJ</label>
          <input value={vj} onChange={(e) => setVj(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label>TYPE *</label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as MovieType;
              setType(newType);
              onTypeChange?.(newType);
            }}
          >
            <option value="Single">Single Movie</option>
            <option value="Mini">Mini-Series</option>
            <option value="Full">TV Series</option>
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label>DESCRIPTION</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
          ></textarea>
        </div>
      </div>

      <ActorsList value={actors} onChange={setActors} disabled={disabled} />
    </>
  );
}


/* ------------------------------------------------------------------ */
/* ACTORS: up to 5 rows, each with a headshot picker and a name        */
/* Lives outside .cc-form-grid so the grid's input styles don't apply. */
/* ------------------------------------------------------------------ */

function ActorsList({
  value,
  onChange,
  disabled,
}: {
  value: ActorDraft[];
  onChange: (next: ActorDraft[]) => void;
  disabled?: boolean;
}) {
  // free preview URLs when the modal goes away
  const latest = useRef(value);
  latest.current = value;
  useEffect(
    () => () => {
      latest.current.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    },
    []
  );

  const add = () => {
    if (value.length >= MAX_ACTORS) return;
    onChange([...value, { id: generateShortId(), name: "", file: null, previewUrl: null }]);
  };

  const update = (id: string, patch: Partial<ActorDraft>) =>
    onChange(value.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id: string) => {
    const a = value.find((x) => x.id === id);
    if (a?.previewUrl) URL.revokeObjectURL(a.previewUrl);
    onChange(value.filter((x) => x.id !== id));
  };

  const pickPhoto = (id: string, file: File | null | undefined) => {
    if (!file) return;
    const cur = value.find((x) => x.id === id);
    if (cur?.previewUrl) URL.revokeObjectURL(cur.previewUrl);
    update(id, { file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <div className="act-wrap">
      <div className="act-head">
        <span className="act-title">ACTORS *</span>
        <span className="act-count">
          {value.length}/{MAX_ACTORS}
        </span>
      </div>

      {value.length === 0 && (
        <div className="act-empty">
          No actors yet. Add up to {MAX_ACTORS}, each with a headshot.
        </div>
      )}

      {value.map((a, i) => (
        <div key={a.id} className="act-row">
          <label className="act-photo" aria-label={`Headshot for actor ${i + 1}`}>
            {a.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.previewUrl} alt="" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5L15.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="12.5" r="3.2" />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(e) => {
                pickPhoto(a.id, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>

          <input
            className="act-name"
            value={a.name}
            disabled={disabled}
            maxLength={60}
            placeholder={`Actor ${i + 1} name`}
            onChange={(e) => update(a.id, { name: e.target.value })}
          />

          <button
            type="button"
            className="act-remove"
            disabled={disabled}
            onClick={() => remove(a.id)}
            aria-label="Remove actor"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="act-add"
        disabled={disabled || value.length >= MAX_ACTORS}
        onClick={add}
      >
        {value.length >= MAX_ACTORS ? "Maximum 5 actors" : "+ Add actor"}
      </button>
    </div>
  );
}


