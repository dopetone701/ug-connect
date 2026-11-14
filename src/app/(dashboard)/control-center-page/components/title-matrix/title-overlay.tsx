"use client";
import { useEffect, useState } from "react";
import "./t-card.css";
import { fontById, coverColor } from "./title-fonts";
import { useTitleMatrixStore, startTitleSync, DEFAULT_STYLE } from "./title-matrix-store";

export default function TitleOverlay({ movieId, fallbackTitle, cover = "" }: { movieId: string; fallbackTitle: string; cover?: string }) {
  const o = useTitleMatrixStore((s) => s.overlays[movieId]);
  const [sync, setSync] = useState("#fff");

  // One shared sync for the whole app (idempotent): loads on app open + when app returns to foreground. No per-card polling.
  useEffect(() => { startTitleSync(); }, []);

  useEffect(() => {
    if (o?.font && fontById(o.font).syncCover && cover) coverColor(cover).then(setSync).catch(() => setSync("#fff"));
    else setSync("#fff");
  }, [o?.font, cover]);

  if (!o || !o.on) return null;
  const displayText = o.text?.trim() || fallbackTitle?.trim() || "";
  if (!displayText) return null;
  const f = fontById(o.font);
  const st = o.style || DEFAULT_STYLE;
  const baseColor = f.syncCover ? sync : st.color;
  const isGradient = st.gradientOn;
  const style: any = {
    fontFamily: f.family, letterSpacing: `calc(${f.spacing} + ${(st.tracking ?? 0) / 100}em)`, fontWeight: f.weight,
    WebkitTextStroke: `${st.border}px ${isGradient ? st.gradientFrom : baseColor}`,
    textShadow: `0 0 ${st.shadow}px ${isGradient ? st.gradientFrom : baseColor}88, 0 3px 20px rgba(0,0,0,.9)`,
    filter: `brightness(${st.exposure ?? 100}%)`,
  };
  if ((st.size ?? 100) !== 100) {
    style.display = "inline-block";
    style.transform = `scale(${(st.size ?? 100) / 100})`;
    style.transformOrigin = "center";
  }
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


