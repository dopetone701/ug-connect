"use client";
import React, { useEffect, useRef, useState } from "react";
import type { CastMember, MovieType } from "../types";
import VJSlogan from "./vj-slogan";

import {
  GENRE_OPTIONS,
  MOVIE_TYPES,
  getR2Url,
  CATEGORY_OPTIONS,
  API_URL,
} from "../constants";
import type { MovieCategoryId } from "../constants";

// Actor DNA API — R2 photos + D1 actors (NOT Google Drive)
// Defined locally here (NOT imported from constants) so this file works
// even if edit-movie/constants.ts does not export ACTOR_API_BASE yet.
// If you add it to constants.ts, delete this line and import it instead — do NOT have both.
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

// Edit CastMember in types.ts is { name, photo } — we extend it at runtime
// so Edit can remember "this is an existing D1 actor" without breaking types.
export type CastMemberWithDNA = CastMember & {
  actorId?: string | null;
  photoUrl?: string | null;
  isExisting?: boolean;
  photoUploading?: boolean;
  _file?: File | null;
};

// IMAGE SYNC — call from Edit modal Save AFTER updateMovie
// 1. POST /actors/sync-movie { movieId, cast: [{name, photo}] } — merge by normalized_name,
//    reuse existing actor, create new if needed, save photoUrl if actor has no photo.
//    Needs fixed Worker (actor-dna-api.fixed.js) — old Worker ignored m.photo.
// 2. For any row with a NEW File (_file), POST /actors/:id/photo (FormData)
//    -> R2 actors/dna/<id>/timestamp.ext + D1 photo_key/photo_url updated.
// Usage in EditMovieModal:
//   await updateMovie(movieId, payload);
//   await syncActorPhotosOnSave(movieId, cast);
export async function syncActorPhotosOnSave(movieId: string, cast: CastMemberWithDNA[]) {
  const named = (cast || []).filter((c) => c?.name?.trim());
  if (!named.length || !movieId) return { success: false, actors: [] };
  const syncCast = named.map((c) => ({
    name: c.name.trim(),
    photo: c.photoUrl || (c.photo && !String(c.photo).startsWith("blob:") ? c.photo : null) || null,
    photoUrl: c.photoUrl || null,
  }));
  const syncRes = await fetch(`${ACTOR_API_BASE}/actors/sync-movie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ movieId, cast: syncCast }),
  });
  const syncData = await syncRes.json().catch(() => null);
  if (!syncRes.ok) { console.warn("sync-movie failed", syncData); return syncData; }
  const norm = (s: string) => s.trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  const byName = new Map<string, string>();
  for (const a of syncData?.actors || []) { if (a?.name && a?.id) byName.set(norm(a.name), a.id); }
  for (const c of named) {
    const f = (c as any)._file;
    if (!f || !(f instanceof File)) continue;
    const actorId = c.actorId || byName.get(norm(c.name));
    if (!actorId) continue;
    const fd = new FormData();
    fd.append("photo", f);
    try {
      const up = await fetch(`${ACTOR_API_BASE}/actors/${actorId}/photo`, { method: "POST", body: fd });
      if (!up.ok) console.warn("actor photo upload failed for", c.name, await up.text());
    } catch (e) { console.warn("actor photo upload error for", c.name, e); }
  }
  return syncData;
}

type Props = {
  title: string;
  setTitle: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  vj: string;
  setVj: (v: string) => void;
  vj_slogan: string;
  setVjSlogan: (v: string) => void;
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
  title, setTitle, genre, setGenre, vj, setVj, vj_slogan, setVjSlogan, type, setType, year, setYear,
  actors, setActors, cast, setCast, description, setDescription, category, setCategory,
}: Props) {
  const castWithDNA = cast as CastMemberWithDNA[];

  // ===== VJ LIST — TRUE IN D1, NOT HARDCODED =====
  // Source of truth is D1: distinct `vj` values in `movies`.
  // Fetch once on open, show in <datalist>. Type new VJ -> saved on Save -> appears next time.
  // VJ_OPTIONS is NOT used here anymore.
  const [vjOptions, setVjOptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        const list: any[] = Array.isArray(data) ? data : data?.movies || data?.data || [];
        const seen = new Set<string>();
        for (const m of list) {
          const v = String(m?.vj || "").trim();
          if (v) seen.add(v);
        }
        if (cancelled) return;
        setVjOptions([...seen].sort());
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const syncActorsString = (next: CastMemberWithDNA[]) => {
    setCast(next as CastMember[]);
    setActors(next.map((m) => m.name).filter(Boolean).join(", "));
  };

  const addCastMember = () => {
    if (cast.length >= 5) { alert("Max 5 cast members"); return; }
    syncActorsString([...castWithDNA, { name: "", photo: null } as CastMemberWithDNA]);
  };

  const updateCastAt = (index: number, patch: Partial<CastMemberWithDNA>) => {
    const next = castWithDNA.map((m, i) => (i === index ? { ...m, ...patch } : m));
    syncActorsString(next);
  };

  const updateCastName = (index: number, name: string) => {
    const cur = castWithDNA[index];
    if (!cur) return;
    const isSame = cur.isExisting && name.trim() === cur.name.trim();
    updateCastAt(index, {
      name,
      ...(isSame ? {} : { actorId: null, isExisting: false, photoUrl: null, photo: null, _file: null }),
    });
  };

  const updateCastPhoto = async (index: number, file: File) => {
    const cur = castWithDNA[index];
    if (!cur) return;
    if (cur.photo && String(cur.photo).startsWith("blob:")) URL.revokeObjectURL(cur.photo);
    const localPreview = URL.createObjectURL(file);
    updateCastAt(index, { photo: localPreview, photoUrl: null, _file: file, photoUploading: true } as Partial<CastMemberWithDNA>);
    if (cur.actorId) {
      try {
        const fd = new FormData();
        fd.append("photo", file);
        const res = await fetch(`${ACTOR_API_BASE}/actors/${cur.actorId}/photo`, { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        const newUrl = data?.actor?.photo || null;
        if (res.ok && newUrl) {
          URL.revokeObjectURL(localPreview);
          updateCastAt(index, { photo: newUrl, photoUrl: newUrl, _file: null, photoUploading: false } as Partial<CastMemberWithDNA>);
        } else {
          updateCastAt(index, { photoUploading: false } as Partial<CastMemberWithDNA>);
          console.warn("actor photo upload failed, will retry on Save", data);
        }
      } catch (e) {
        updateCastAt(index, { photoUploading: false } as Partial<CastMemberWithDNA>);
        console.warn("actor photo upload error, will retry on Save", e);
      }
    } else {
      updateCastAt(index, { photoUploading: false, photoUrl: null } as Partial<CastMemberWithDNA>);
    }
  };

  const removeCast = (index: number) => {
    const cur = castWithDNA[index];
    if (cur?.photo && String(cur.photo).startsWith("blob:")) URL.revokeObjectURL(cur.photo);
    syncActorsString(castWithDNA.filter((_, i) => i !== index));
  };

  const handleSelectActor = (index: number, hit: ActorSearchResult) => {
    updateCastAt(index, {
      name: hit.name,
      actorId: hit.id,
      photoUrl: hit.photo || hit.photo_url || null,
      photo: hit.photo || hit.photo_url || null,
      _file: null,
      isExisting: true,
      photoUploading: false,
    } as Partial<CastMemberWithDNA>);
  };

  const clearSelection = (index: number) => {
    updateCastAt(index, { actorId: null, isExisting: false, photoUrl: null, photo: null, _file: null } as Partial<CastMemberWithDNA>);
  };

 return (
    <div className="cc-form-grid">
      <div><label>TITLE *</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie title" /></div>
      <div><label>YEAR *</label><input value={year} onChange={(e) => setYear(e.target.value)} type="number" placeholder="2024" /></div>
      <div><label>GENRE</label><select value={genre} onChange={(e) => setGenre(e.target.value)}><option value="">Select genre</option>{GENRE_OPTIONS.map((g) => (<option key={g} value={g}>{g}</option>))}</select></div>
      <div>
        <label>VJ</label>
        <input
          value={vj}
          onChange={(e) => setVj(e.target.value)}
          list="vj-list"
          placeholder="Type or pick VJ — from D1"
          autoComplete="off"
        />
        <datalist id="vj-list">
          {vjOptions.map((v) => (<option key={v} value={v} />))}
        </datalist>
      </div>
      <VJSlogan vj={vj} slogan={vj_slogan} setSlogan={setVjSlogan} />
      <div><label>ACTORS (comma separated) *</label><input value={actors} onChange={(e) => setActors(e.target.value)} placeholder="Actor 1, Actor 2" /></div>
      <div><label>TYPE</label><select value={type} onChange={(e) => setType(e.target.value as MovieType)}>{MOVIE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}</select></div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label>CATEGORY / ORIGIN * (for ExploreMore market filter)</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as MovieCategoryId | "")} style={{ borderColor: category ? "hsl(145 65% 40%)" : "hsl(var(--border))" }}>
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((c) => (<option key={c.id} value={c.id}>{c.label} - {c.searchQuery}</option>))}
        </select>
        {!category && (<small style={{ display: "block", marginTop: 5, color: "hsl(var(--muted-foreground))" }}>Select a category or origin before saving.</small>)}
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <label>CAST WITH PHOTOS (max 5) - {cast.length}/5</label>
          <button type="button" onClick={addCastMember} disabled={cast.length >= 5} className="cc-btn ghost" style={{ fontSize: 12, opacity: cast.length >= 5 ? 0.5 : 1, cursor: cast.length >= 5 ? "not-allowed" : "pointer" }}>+ Add Cast</button>
        </div>
        {cast.length === 0 && (<small style={{ color: "#666" }}>No cast photos yet. Click Add Cast. Type a name to search existing actors — photos sync from Actor DNA.</small>)}
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {castWithDNA.map((member, idx) => (
            <CastRow
              key={`${member.actorId || member.name || "new"}-${idx}`}
              member={member}
              idx={idx}
              onNameChange={(name) => updateCastName(idx, name)}
              onPhotoPick={(file) => updateCastPhoto(idx, file)}
              onRemove={() => removeCast(idx)}
              onSelect={(hit) => handleSelectActor(idx, hit)}
              onClear={() => clearSelection(idx)}
            />
          ))}
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1" }}><label>DESCRIPTION</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Movie description..." /></div>
    </div>
  );
}

// One cast row — its own search state
function CastRow({ member, idx, onNameChange, onPhotoPick, onRemove, onSelect, onClear }: {
  member: CastMemberWithDNA; idx: number;
  onNameChange: (name: string) => void;
  onPhotoPick: (file: File) => void;
  onRemove: () => void;
  onSelect: (hit: ActorSearchResult) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ActorSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef("");

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const shownPhoto = member.photo || member.photoUrl || null;
  const shownSrc = shownPhoto
    ? (String(shownPhoto).startsWith("http") || String(shownPhoto).startsWith("blob:") ? String(shownPhoto) : getR2Url(String(shownPhoto)))
    : null;

  const searchActors = async (query: string) => {
    const q = query.trim();
    if (q.length < 1) { setResults([]); setOpen(false); setSearching(false); return; }
    if (q === lastQueryRef.current && member.isExisting) return;
    setSearching(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(`${ACTOR_API_BASE}/actors?search=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal });
      const data = await res.json().catch(() => null);
      const list: ActorSearchResult[] = Array.isArray(data) ? data : data?.actors || data?.data || [];
      setResults(list.map((r) => ({ ...r, photo: r.photo || r.photo_url || null })));
      setOpen(true);
    } catch (e: any) { if (e?.name !== "AbortError") setResults([]); }
    finally { if (!ctrl.signal.aborted) setSearching(false); }
  };

  const handleSelect = (hit: ActorSearchResult) => {
    lastQueryRef.current = hit.name;
    onSelect(hit);
    setResults([]);
    setOpen(false);
  };

  const showDropdown = open && focused && (results.length > 0 || searching);
  

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", padding: 10, borderRadius: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#222", overflow: "hidden", flexShrink: 0, position: "relative" }}>
          {shownSrc ? (<img src={shownSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={member.name || `Cast member ${idx + 1}`} />)
          : (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></div>)}
          {member.photoUploading ? (<span style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>…</span>) : null}
        </div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <input
            value={member.name}
            onChange={(e) => {
              onNameChange(e.target.value);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => searchActors(e.target.value), 200);
            }}
            onFocus={() => { setFocused(true); if (member.name.trim()) searchActors(member.name); }}
            onBlur={() => { setTimeout(() => setFocused(false), 150); }}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
            placeholder={`Cast ${idx + 1} name — type to search`}
            autoComplete="off"
            style={{ width: "100%", padding: "8px 10px", background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", borderRadius: 6, color: "hsl(var(--text))" }}
          />
          {member.isExisting && member.actorId ? (<span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, background: "#16a34a", color: "#fff", padding: "2px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>✓ Existing</span>) : null}
        </div>
        {member.isExisting ? (<button type="button" onClick={onClear} title="Clear selection — type a new name" style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 5 }}>↺</button>) : null}
        <label className="cc-btn ghost" style={{ fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>Photo<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) onPhotoPick(file); e.target.value = ""; }} /></label>
        <button type="button" onClick={onRemove} aria-label={`Remove cast member ${idx + 1}`} style={{ color: "#ff4444", background: "none", border: "none", cursor: "pointer", padding: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
        </button>
      </div>
      {showDropdown ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50, background: "#111827", border: "1px solid #374151", borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", maxHeight: 260, overflowY: "auto" }}>
          {searching && results.length === 0 ? (<div style={{ padding: "10px 12px", fontSize: 13, opacity: 0.7 }}>Searching…</div>) : null}
          {results.map((hit) => {
            const photo = hit.photo || hit.photo_url || null;
            return (
              <button key={hit.id} type="button" onMouseDown={(e) => { e.preventDefault(); handleSelect(hit); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "#fff" }}>
                {photo ? (<img src={photo} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />)
                : (<span style={{ width: 36, height: 36, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</span>)}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hit.name}</span>
                  {typeof hit.movieCount === "number" ? (<span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>{hit.movieCount} movie{hit.movieCount === 1 ? "" : "s"} • Existing actor</span>)
                  : (<span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Existing actor</span>)}
                </span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>Select →</span>
              </button>
            );
          })}
          {!searching && results.length > 0 ? (<div style={{ padding: "8px 12px", fontSize: 12, opacity: 0.6, borderTop: "1px solid #1f2937" }}>Not listed? Keep typing — it will be created on Save.</div>) : null}
        </div>
      ) : null}
      {focused && open && !searching && results.length === 0 && member.name.trim().length > 0 ? (
        <div style={{ fontSize: 12, opacity: 0.6, padding: "4px 2px 0" }}>No match — “{member.name.trim()}” will be created as a new actor on Save.</div>
      ) : null}
    </div>
  );
}