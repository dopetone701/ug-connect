"use client";
import React, { useEffect, useRef, useState } from "react";
import type { MovieType, ActorDraft } from "../types";
import { MAX_ACTORS, generateShortId, CATEGORY_OPTIONS, type MovieCategoryId } from "../constants";

// ---------------------------------------------------------------------------
// Actor DNA API — R2 photos + D1 actors (NOT Google Drive)
// ---------------------------------------------------------------------------
const ACTOR_API_BASE = "https://actor-dna-api.connectu89.workers.dev";

type ActorSearchResult = {
  id: string;
  name: string;
  normalized_name?: string;
  photo?: string | null;
  photo_url?: string | null;
  photo_key?: string | null;
  movieCount?: number;
};

// ActorDraft in your project is { id, name, file, previewUrl }.
// We extend it at runtime with these optional fields so the modal can
// remember "this row is an existing D1 actor" without breaking your types.
export type ActorDraftWithDNA = ActorDraft & {
  actorId?: string | null;      // D1 actor id e.g. actor_xxx — null = new actor, will be created on Save
  photoUrl?: string | null;     // Existing R2 photo from D1 — reused on Save, no re-upload
  isExisting?: boolean;         // true if picked from dropdown
};

interface MovieDetailsFieldsProps {
  title: string;
  setTitle: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  vj: string;
  setVj: (v: string) => void;
  category: string;
  setCategory: (v: MovieCategoryId) => void;
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
  category,
  setCategory,
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
          <label>🌍 CATEGORY / ORIGIN *</label>
          <select
            value={category}
            disabled={disabled}
            onChange={(e) => setCategory(e.target.value as MovieCategoryId)}
          >
            <option value="">Select origin for Explore More...</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
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

// ---------------------------------------------------------------------------
// ActorsList — typing -> instant filter -> select -> photo + full name + D1 id
// ---------------------------------------------------------------------------

function ActorsList({
  value,
  onChange,
  disabled,
}: {
  value: ActorDraft[];
  onChange: (next: ActorDraft[]) => void;
  disabled?: boolean;
}) {
  const latest = useRef(value);
  latest.current = value;

  useEffect(
    () => () => {
      latest.current.forEach((a) => {
        const draft = a as ActorDraftWithDNA;
        // Only revoke blob: previews we created from a local file.
        // Never revoke an R2 http(s) photo.
        if (draft.previewUrl && draft.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(draft.previewUrl);
        }
      });
    },
    []
  );

  const add = () => {
    if (value.length >= MAX_ACTORS) return;
    onChange([
      ...value,
      { id: generateShortId(), name: "", file: null, previewUrl: null } as ActorDraft,
    ]);
  };

  const update = (id: string, patch: Partial<ActorDraftWithDNA>) =>
    onChange(value.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id: string) => {
    const a = value.find((x) => x.id === id) as ActorDraftWithDNA | undefined;
    if (a?.previewUrl && a.previewUrl.startsWith("blob:")) URL.revokeObjectURL(a.previewUrl);
    onChange(value.filter((x) => x.id !== id));
  };

  const pickPhoto = (id: string, file: File | null | undefined) => {
    if (!file) return;
    const cur = value.find((x) => x.id === id) as ActorDraftWithDNA | undefined;
    if (cur?.previewUrl && cur.previewUrl.startsWith("blob:")) URL.revokeObjectURL(cur.previewUrl);
    // User picked a NEW headshot: this overrides the existing R2 photo.
    // Keep actorId (so Save still merges to the same D1 actor), but mark
    // photoUrl as replaced — CreateMovieModal will upload this file instead.
    update(id, { file, previewUrl: URL.createObjectURL(file), photoUrl: null } as Partial<ActorDraftWithDNA>);
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
          No actors yet. Type a name to search existing actors — or type a new name to create one on Save. Add up to {MAX_ACTORS}.
        </div>
      )}

      {value.map((a, i) => (
        <ActorRow
          key={a.id}
          actor={a as ActorDraftWithDNA}
          index={i}
          disabled={disabled}
          onUpdate={(patch) => update(a.id, patch)}
          onRemove={() => remove(a.id)}
          onPickPhoto={(file) => pickPhoto(a.id, file)}
        />
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

// ---------------------------------------------------------------------------
// One actor row — its own search state so typing in row 1 doesn't affect row 2
// ---------------------------------------------------------------------------

function ActorRow({
  actor,
  index,
  disabled,
  onUpdate,
  onRemove,
  onPickPhoto,
}: {
  actor: ActorDraftWithDNA;
  index: number;
  disabled?: boolean;
  onUpdate: (patch: Partial<ActorDraftWithDNA>) => void;
  onRemove: () => void;
  onPickPhoto: (file: File | null | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ActorSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // The photo shown: local file preview (blob:) wins, otherwise existing R2 photo
  const shownPhoto = actor.previewUrl || actor.photoUrl || null;

  const searchActors = async (query: string) => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    // Don't re-search if user just selected this exact name (avoids flicker)
    if (q === lastQueryRef.current && actor.isExisting) return;

    setSearching(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(
        `${ACTOR_API_BASE}/actors?search=${encodeURIComponent(q)}&limit=8`,
        { signal: ctrl.signal }
      );
      const data = await res.json().catch(() => null);
      const list: ActorSearchResult[] = Array.isArray(data)
        ? data
        : data?.actors || data?.data || [];
      // Normalise photo field: Worker returns `photo` (photo_url || R2 url)
      const normalised = list.map((r) => ({
        ...r,
        photo: r.photo || r.photo_url || null,
      }));
      setResults(normalised);
      setOpen(true);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setResults([]);
      }
    } finally {
      if (!ctrl.signal.aborted) setSearching(false);
    }
  };

  const handleNameChange = (text: string) => {
    // User is typing a NEW / DIFFERENT name — clear the old D1 link,
    // but keep the old photo visible until they pick something new.
    // If they type the exact selected name back, isExisting stays until changed.
    const isSameAsSelected = actor.isExisting && text.trim() === actor.name.trim();
    onUpdate({
      name: text,
      // If text diverges from the selected actor, unlink it.
      // Save will then create / merge by normalized_name.
      ...(isSameAsSelected
        ? {}
        : { actorId: null, isExisting: false }),
      // Keep photoUrl if same name, otherwise keep it as preview until pick.
      // We do NOT clear photoUrl on every keystroke — dropdown still shows
      // the typed name's matches, and Save uses name + photoUrl if untouched.
    } as Partial<ActorDraftWithDNA>);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchActors(text), 200);
  };

  const handleSelect = (hit: ActorSearchResult) => {
    lastQueryRef.current = hit.name;
    // INSTANT AUTO-FILL: full name + R2 photo + D1 id, no re-fetch needed
    onUpdate({
      name: hit.name,
      actorId: hit.id,
      photoUrl: hit.photo || null,
      previewUrl: hit.photo || null, // show R2 photo instantly in the row
      file: null, // no new upload needed — reuse existing R2 photo
      isExisting: true,
    } as Partial<ActorDraftWithDNA>);
    setResults([]);
    setOpen(false);
  };

  const handleClearSelection = () => {
    // Turn an existing actor back into a free-typed new name
    onUpdate({
      actorId: null,
      isExisting: false,
      photoUrl: null,
      previewUrl: null,
      file: null,
    } as Partial<ActorDraftWithDNA>);
  };

  const showDropdown = open && focused && (results.length > 0 || searching);

  return (
    <div ref={wrapRef} className="act-row-wrap" style={{ position: "relative" }}>
      <div className="act-row">
        <label className="act-photo" aria-label={`Headshot for actor ${index + 1}`}>
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="" />
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
              onPickPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>

        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <input
            className="act-name"
            value={actor.name}
            disabled={disabled}
            maxLength={60}
            placeholder={`Actor ${index + 1} name — type to search`}
            autoComplete="off"
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (actor.name.trim()) searchActors(actor.name);
            }}
            onBlur={() => {
              // Delay so click on dropdown still registers
              setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          {actor.isExisting && actor.actorId ? (
            <span
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                background: "#16a34a",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              ✓ Existing
            </span>
          ) : null}
        </div>

        {actor.isExisting ? (
          <button
            type="button"
            className="act-clear"
            disabled={disabled}
            onClick={handleClearSelection}
            aria-label="Clear selected actor"
            title="Clear selection — type a new name"
            style={{ marginRight: 4 }}
          >
            ↺
          </button>
        ) : null}

        <button
          type="button"
          className="act-remove"
          disabled={disabled}
          onClick={onRemove}
          aria-label="Remove actor"
        >
          ✕
        </button>
      </div>

      {showDropdown ? (
        <div
          className="act-dropdown"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            zIndex: 50,
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: 10,
            marginTop: 4,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {searching && results.length === 0 ? (
            <div style={{ padding: "10px 12px", fontSize: 13, opacity: 0.7 }}>
              Searching…
            </div>
          ) : null}

          {results.map((hit) => {
            const photo = hit.photo || hit.photo_url || null;
            return (
              <button
                key={hit.id}
                type="button"
                onMouseDown={(e) => {
                  // onMouseDown so it fires before input blur closes dropdown
                  e.preventDefault();
                  handleSelect(hit);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {hit.name}
                  </span>
                  {typeof hit.movieCount === "number" ? (
                    <span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>
                      {hit.movieCount} movie{hit.movieCount === 1 ? "" : "s"} • Existing actor
                    </span>
                  ) : (
                    <span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Existing actor</span>
                  )}
                </span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>Select →</span>
              </button>
            );
          })}

          {!searching && results.length > 0 ? (
            <div style={{ padding: "8px 12px", fontSize: 12, opacity: 0.6, borderTop: "1px solid #1f2937" }}>
              Not listed? Keep typing — it will be created on Save.
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Hint when typing a new name with no matches */}
      {focused && open && !searching && results.length === 0 && actor.name.trim().length > 0 ? (
        <div style={{ fontSize: 12, opacity: 0.6, padding: "4px 2px 0" }}>
          No match — “{actor.name.trim()}” will be created as a new actor on Save.
        </div>
      ) : null}
    </div>
  );
}

