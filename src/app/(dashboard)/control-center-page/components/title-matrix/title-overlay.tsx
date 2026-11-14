"use client";
import { useEffect, useState } from "react";
import "./t-card.css";
import { fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore } from "./title-matrix-store";
export default function TitleOverlay({ movieId, fallbackTitle, cover = "" }: { movieId: string; fallbackTitle?: string; cover?: string }) {
  const o = useTitleMatrixStore(s => s.overlays[movieId]);
  const loadOverlays = useTitleMatrixStore(s => s.loadOverlays);
  const [sync, setSync] = useState("#fff");

  // FIX: Overlay itself pulls D1 — Body is NOT mounted on public /movies,
  // so if Overlay doesn't pull, user never gets admin changes.
  // Poll 3s no-store + instant on ug-title-saved. Keep last state on fail (no flicker).
  useEffect(() => {
    loadOverlays?.();
    const t = setInterval(() => loadOverlays?.(), 3000);
    const onSaved = () => loadOverlays?.();
    window.addEventListener("ug-title-saved", onSaved);
    window.addEventListener("storage", onSaved);
    return () => { clearInterval(t); window.removeEventListener("ug-title-saved", onSaved); window.removeEventListener("storage", onSaved); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  useEffect(() => { if (o?.font && fontById(o.font).syncCover && cover) coverColor(cover).then(setSync); else setSync("#fff"); }, [o?.font, cover]);
  // FIX: No fallback. No text in Store/D1 = show nothing. Never invent movie title.
  if (!o || !o.on || !o.text?.trim()) return null;
  const f = fontById(o.font);
  const st = o.style || { color: "#fff", gradientOn: false, gradientFrom: "#fff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 };
  const baseColor = f.syncCover ? sync : st.color;
  // Gradient: background-clip text. Border = stroke. Shadow = glow.
  const isGradient = st.gradientOn;
  const style: any = {
    fontFamily: f.family, letterSpacing: f.spacing, fontWeight: f.weight,
    WebkitTextStroke: `${st.border}px ${isGradient ? st.gradientFrom : baseColor}`,
    textShadow: `0 0 ${st.shadow}px ${isGradient ? st.gradientFrom : baseColor}88, 0 3px 20px rgba(0,0,0,.9)`,
    filter: `brightness(${(st as any).exposure ?? 100}%)`,
  };
  if (isGradient) {
    style.background = `linear-gradient(180deg, ${st.gradientFrom}, ${st.gradientTo})`;
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.color = "transparent";
  } else {
    style.color = baseColor;
  }
  return <div className="t-overlay"><span style={style}>{o.text}</span></div>;
}