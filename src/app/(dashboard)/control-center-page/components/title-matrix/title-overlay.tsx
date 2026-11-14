"use client";
import { useEffect, useState } from "react";
import "./t-card.css";
import { fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore } from "./title-matrix-store";
export default function TitleOverlay({ movieId, fallbackTitle, cover = "" }: { movieId: string; fallbackTitle: string; cover?: string }) {
  let o: any = null;
  let loadOverlays: any = null;
  try {
    o = useTitleMatrixStore((s: any) => s.overlays?.[movieId]);
    loadOverlays = useTitleMatrixStore((s: any) => s.loadOverlays);
  } catch { o = null; }
  const [sync, setSync] = useState("#fff");
  useEffect(() => {
    try { loadOverlays?.(); } catch {}
    const t = setInterval(() => { try { loadOverlays?.(); } catch {} }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);
  useEffect(() => { if (o?.font && fontById(o.font).syncCover && cover) coverColor(cover).then(setSync).catch(() => setSync("#fff")); else setSync("#fff"); }, [o?.font, cover]);
  if (!o || !o.on) return null;
  const displayText = o.text?.trim() || fallbackTitle?.trim() || "";
  if (!displayText) return null;
  const f = fontById(o.font);
  const st = o.style || { color: "#fff", gradientOn: false, gradientFrom: "#fff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 };
  const baseColor = f.syncCover ? sync : st.color;
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
  return <div className="t-overlay"><span style={style}>{displayText}</span></div>;
}