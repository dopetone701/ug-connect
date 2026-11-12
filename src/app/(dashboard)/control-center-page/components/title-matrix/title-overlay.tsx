"use client";
import { useEffect, useState } from "react";
import "./t-card.css";
import { fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore } from "./title-matrix-store";
export default function TitleOverlay({ movieId, fallbackTitle, cover = "" }: { movieId: string; fallbackTitle: string; cover?: string }) {
  const o = useTitleMatrixStore(s => s.overlays[movieId]);
  const [sync, setSync] = useState("#fff");
  useEffect(() => { if (o?.font && fontById(o.font).syncCover && cover) coverColor(cover).then(setSync); else setSync("#fff"); }, [o?.font, cover]);
  if (!o || !o.on) return null;
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
  return <div className="t-overlay"><span style={style}>{o.text || fallbackTitle}</span></div>;
}

