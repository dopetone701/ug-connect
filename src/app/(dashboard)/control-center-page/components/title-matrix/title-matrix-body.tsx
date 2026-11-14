"use client";
import { useMemo, useState, useEffect } from "react";
import "./t-body.css";
import "./t-card.css";
import { TITLE_FONTS, fontLink, fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore } from "./title-matrix-store";
import ColorFaders from "./color-faders-system";
import { useCoverMatrix } from "../cover-matrix/cover-matrix-controller";

export default function TitleMatrixBody() {
  const { selectedId, select, overlays, setOverlay, toggle, loadOverlays } = useTitleMatrixStore();
  const movies = useCoverMatrix((s: any) => s.movies);
  const loading = useCoverMatrix((s: any) => s.loading);
  const loadMovies = useCoverMatrix((s: any) => s.loadMovies);

  const [q, setQ] = useState("");
  const [font, setFont] = useState("cinzel");
  const [manual, setManual] = useState(""); // OPTIONAL override only
  const [syncColor, setSyncColor] = useState("#fff");

  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = fontLink(); document.head.appendChild(l); }, []);
  useEffect(() => { if (!movies.length) loadMovies?.(); }, []);
  useEffect(() => { loadOverlays?.(); }, []);

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
    setManual(cur?.text || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (previewFont.syncCover && selected) coverColor(coverOf(selected)).then(setSyncColor);
    else setSyncColor("#fff");
  }, [font, selected]);

  const draftStyle = selected ? (overlays[selected.id]?.style || { color: "#fff", gradientOn: false, gradientFrom: "#fff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 }) : null;
  const previewStyle: any = draftStyle ? {
    fontFamily: previewFont.family, letterSpacing: previewFont.spacing, fontWeight: previewFont.weight,
    WebkitTextStroke: `${draftStyle.border}px ${draftStyle.gradientOn ? draftStyle.gradientFrom : (previewFont.syncCover ? syncColor : draftStyle.color)}`,
    textShadow: `0 0 ${draftStyle.shadow}px ${(previewFont.syncCover ? syncColor : draftStyle.color)}88, 0 3px 20px rgba(0,0,0,.9)`,
    filter: `brightness(${draftStyle.exposure ?? 100}%)`,
    ...(draftStyle.gradientOn ? { background: `linear-gradient(180deg, ${draftStyle.gradientFrom}, ${draftStyle.gradientTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" } : { color: previewFont.syncCover ? syncColor : draftStyle.color }),
  } : {};

  // ON = show REAL movie title automatically, no typing needed
  function handleTurnOn() {
    if (!selected) return;
    setOverlay(selected.id, { on: true, text: manual.trim() || "", font });
  }
  function handleTurnOff() {
    if (!selected) return;
    setOverlay(selected.id, { on: false });
  }
  function handleFontChange(newFont: string) {
    setFont(newFont);
    if (!selected) return;
    const cur = overlays[selected.id];
    if (cur?.on) setOverlay(selected.id, { font: newFont });
  }
  // OPTIONAL manual override — only if you want different wording than real title
  function handleManual(v: string) {
    setManual(v);
    if (!selected) return;
    const cur = overlays[selected.id];
    if (cur?.on) setOverlay(selected.id, { text: v.trim() });
  }

  if (loading && !movies.length) return <div className="t-body"><div className="t-empty">Loading movies…</div></div>;

  if (selected) {
    const cur = overlays[selected.id];
    const cover = coverOf(selected);
    const displayText = manual.trim() || selected.title;
    const showPreview = !!cur?.on;
    return (
      <div className="t-body">
        <button className="t-body-back" onClick={() => select(null)}>← All Movies</button>
        <div className="t-body-title">{selected.title}</div>
        <div className="t-body-sub">{cur?.on ? "Overlay is ON — showing on the card" : "Cover already has its title — leave OFF unless cover has no title"}</div>
        <div className="t-cover-row">
          {cover ? <img src={cover} alt="" /> : null}
          {showPreview && <div className="t-overlay"><span style={previewStyle}>{displayText}</span></div>}
        </div>

        {/* FONT + FADERS — no big input anymore */}
        <div className="t-font-row">{TITLE_FONTS.map(f => (
          <button key={f.id} className={`t-font-chip ${font === f.id ? "active" : ""}`} onClick={() => handleFontChange(f.id)} style={{ fontFamily: f.family }}>Ag</button>
        ))}</div>
        <div className="t-font-label">{previewFont.label}</div>
        <ColorFaders movieId={selected.id} />

        {/* OPTIONAL override — leave empty = use real movie title */}
        <input className="t-input" value={manual} onChange={(e) => handleManual(e.target.value)} placeholder="Optional — different wording, else uses real title" />

        {!cur?.on
          ? <button className="t-add-btn big" onClick={handleTurnOn}>+ Show Title on Card</button>
          : <button className="t-toggle-btn" onClick={handleTurnOff}>Turn Overlay OFF — hide it</button>}
      </div>
    );
  }

  return (
    <div className="t-body">
      <div className="t-body-head"><div><div><div className="t-body-title">All Movies</div><div className="t-body-sub">Tap a cover with no title to show its title</div></div></div></div>
      <input className="t-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search movies, VJ, genre…" />
      <div className="t-count">Showing {filtered.length} of {movies.length} movies</div>
      {filtered.length === 0 ? <div className="t-empty">{movies.length === 0 ? "No movies yet." : "No matches — try another search."}</div> : (
        <div className="t-grid">{filtered.map((m: any) => {
          const cur = overlays[m.id];
          const cover = coverOf(m);
          return (
            <div key={m.id} className="t-movie-card" onClick={() => select(m.id)}>
              <div className="t-cover-row small">{cover ? <img src={cover} alt="" /> : null}{cur?.on && <div className="t-overlay"><span style={{ fontFamily: fontById(cur.font).family, letterSpacing: fontById(cur.font).spacing, fontWeight: fontById(cur.font).weight }}>{cur.text?.trim() || m.title}</span></div>}</div>
              <div className="t-movie-title">{m.title}</div>
              <div className="t-movie-meta">{cur?.on ? "Overlay ON" : "No title — tap to add"}</div>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}