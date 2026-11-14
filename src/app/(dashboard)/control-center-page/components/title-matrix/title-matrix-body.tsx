"use client";
import { useMemo, useState, useEffect } from "react";
import "./t-body.css";
import "./t-card.css";
import { TITLE_FONTS, fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore, startTitleSync, DEFAULT_STYLE } from "./title-matrix-store";
import ColorFaders from "./color-faders-system";
import { useCoverMatrix } from "../cover-matrix/cover-matrix-controller";

export default function TitleMatrixBody() {
  const { selectedId, select, overlays, setOverlay, toggle, saveError } = useTitleMatrixStore();
  const movies = useCoverMatrix((s: any) => s.movies);
  const loading = useCoverMatrix((s: any) => s.loading);
  const loadMovies = useCoverMatrix((s: any) => s.loadMovies);

  const [q, setQ] = useState("");
  const [font, setFont] = useState("cinzel");
  const [text, setText] = useState("");
  const [syncColor, setSyncColor] = useState("#fff");
  const [added, setAdded] = useState(false);

  // Fonts are already loaded globally in the root layout, so no <link> injection here anymore.
  useEffect(() => { if (!movies.length) loadMovies?.(); }, []);
  useEffect(() => { setAdded(false); }, [selectedId]);
  useEffect(() => { startTitleSync(); }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = query ? movies.filter((m: any) => `${m.title} ${m.vj || ""} ${m.genre || ""}`.toLowerCase().includes(query)) : movies;
    return list.slice(0, 20);
  }, [movies, q]);

  const selected = useMemo(() => movies.find((m: any) => m.id === selectedId), [movies, selectedId]);
  const previewFont = fontById(font);
  const coverOf = (m: any) => m.cover_url || m.covers?.[m.cover_schedule?.activeIndex || 0] || m.covers?.[0] || "";

  useEffect(() => {
    if (!selected) return;
    const cur = overlays[selected.id];
    setFont(cur?.font || "cinzel");
    setText(cur?.text || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (previewFont.syncCover && selected) coverColor(coverOf(selected)).then(setSyncColor);
    else setSyncColor("#fff");
  }, [font, selected]);

  const draftStyle = selected ? { ...DEFAULT_STYLE, ...(overlays[selected.id]?.style || {}) } : null;
  const previewStyle: any = draftStyle ? {
    fontFamily: previewFont.family, letterSpacing: previewFont.spacing, fontWeight: previewFont.weight,
    WebkitTextStroke: `${draftStyle.border}px ${draftStyle.gradientOn ? draftStyle.gradientFrom : (previewFont.syncCover ? syncColor : draftStyle.color)}`,
    textShadow: `0 0 ${draftStyle.shadow}px ${(previewFont.syncCover ? syncColor : draftStyle.color)}88, 0 3px 20px rgba(0,0,0,.9)`,
    filter: `brightness(${draftStyle.exposure ?? 100}%)`,
    ...(draftStyle.gradientOn ? { background: `linear-gradient(180deg, ${draftStyle.gradientFrom}, ${draftStyle.gradientTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" } : { color: previewFont.syncCover ? syncColor : draftStyle.color }),
  } : {};

  // Typing saves the text (debounced by the store). It does NOT flip the overlay ON — only "Add" / the toggle do that.
  function handleTextChange(v: string) {
    setText(v);
    if (!selected) return;
    if (!v.trim()) return; // empty = don't wipe D1
    setOverlay(selected.id, { text: v.trim(), font });
  }

  function handleAdd() {
    if (!selected) return;
    const actual = text.trim() || overlays[selected.id]?.text?.trim() || "";
    if (!actual) return;
    setOverlay(selected.id, { on: true, text: actual, font });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  // Changing font never turns the overlay ON/OFF.
  function handleFontChange(newFont: string) {
    setFont(newFont);
    if (!selected) return;
    const t = text.trim() || overlays[selected.id]?.text?.trim() || "";
    if (t || overlays[selected.id]) setOverlay(selected.id, { text: t, font: newFont });
  }

  if (loading && !movies.length) return <div className="t-body"><div className="t-empty">Loading movies…</div></div>;

  const errorBanner = saveError ? <div className="t-empty" style={{ color: "#ff6b6b" }}>{saveError}</div> : null;

  if (selected) {
    const cur = overlays[selected.id];
    const cover = coverOf(selected);
    const showPreview = !!(text.trim() || cur?.text?.trim());
    return (
      <div className="t-body">
        <button className="t-body-back" onClick={() => select(null)}>← All Movies</button>
        <div className="t-body-title">{selected.title}</div>
        <div className="t-body-sub">{cur?.on ? "Overlay is ON — showing on the card" : "Cover has no visible title — add our generated overlay"}</div>
        {errorBanner}
        <div className="t-cover-row">
          {cover ? <img src={cover} alt="" /> : null}
          {showPreview && <div className="t-overlay"><span style={previewStyle}>{text.trim() || cur?.text}</span></div>}
        </div>
        <input className="t-input" value={text} onChange={(e) => handleTextChange(e.target.value)} placeholder="Type actual title — empty will not save" />
        <div className="t-font-row">{TITLE_FONTS.map(f => (
          <button key={f.id} className={`t-font-chip ${font === f.id ? "active" : ""}`} onClick={() => handleFontChange(f.id)} style={{ fontFamily: f.family }}>Ag</button>
        ))}</div>
        <div className="t-font-label">{previewFont.label}</div>
        <ColorFaders movieId={selected.id} />
        <button className={`t-add-btn big ${added ? "added" : ""}`} disabled={added} onClick={handleAdd}>{added ? "✓ Added! Showing on card" : "+ Add Title Overlay"}</button>
        {cur && <button className="t-toggle-btn" onClick={() => toggle(selected.id)}>{cur.on ? "Turn Overlay OFF" : "Turn Overlay ON"}</button>}
      </div>
    );
  }

  return (
    <div className="t-body">
      <div className="t-body-head"><div><div><div className="t-body-title">All Movies</div><div className="t-body-sub">Tap a movie with no visible title to add our generated overlay</div></div></div></div>
      {errorBanner}
      <input className="t-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search movies, VJ, genre…" />
      <div className="t-count">Showing {filtered.length} of {movies.length} movies</div>
      {filtered.length === 0 ? <div className="t-empty">{movies.length === 0 ? "No movies yet." : "No matches — try another search."}</div> : (
        <div className="t-grid">{filtered.map((m: any) => {
          const cur = overlays[m.id];
          const cover = coverOf(m);
          return (
            <div key={m.id} className="t-movie-card" onClick={() => select(m.id)}>
              <div className="t-cover-row small">{cover ? <img src={cover} alt="" /> : null}{cur?.on && cur?.text && <div className="t-overlay"><span style={{ fontFamily: fontById(cur.font).family, letterSpacing: fontById(cur.font).spacing, fontWeight: fontById(cur.font).weight }}>{cur.text}</span></div>}</div>
              <div className="t-movie-title">{m.title}</div>
              <div className="t-movie-meta">{cur?.on ? "Overlay ON" : "No title — tap to add"}</div>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
