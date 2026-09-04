"use client";
import { THEMES } from "@/lib/theme/dna";
import { setTheme } from "@/lib/theme/theme-controller";
import "./theme-grid.css";
export default function ThemeGrid(){
  return <div className="theme-grid">{THEMES.map(t=><button key={t.id} className="theme-btn" onClick={()=>setTheme(t.id)}>{t.label}</button>)}</div>
}
