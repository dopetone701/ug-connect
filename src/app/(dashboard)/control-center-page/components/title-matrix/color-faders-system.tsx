"use client";
import "./faders.css";
import { useTitleMatrixStore } from "./title-matrix-store";

// Faders — all live, all real-time. No Save button, moving a fader updates the card instantly.
// Store holds style per movie: { color, gradientOn, gradientFrom, gradientTo, border, shadow }
export default function ColorFaders({ movieId }: { movieId: string }) {
  const overlays = useTitleMatrixStore(s => s.overlays);
  const setStyle = useTitleMatrixStore(s => s.setStyle);
  const cur = overlays[movieId];
  const style = cur?.style || { color: "#ffffff", gradientOn: false, gradientFrom: "#ffffff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 };

  const set = (patch: Partial<typeof style>) => setStyle(movieId, { ...style, ...patch });

  return (
    <div className="faders">
      {/* COLOR PAD — tap a color, title recolors instantly */}
      <div className="fader-row">
        <label>Color</label>
        <input type="color" value={style.color} onChange={(e) => set({ color: e.target.value })} className="fader-colorpad" />
        <div className="fader-swatches">
          {["#ffffff", "#ffd700", "#ff3b30", "#ff0080", "#00e5ff", "#7cff00", "#ff8c00"].map(c => (
            <button key={c} className="fader-swatch" style={{ background: c }} onClick={() => set({ color: c })} />
          ))}
        </div>
      </div>

      {/* GRADIENT — on/off + 2 colors, title becomes gradient */}
      <div className="fader-row">
        <label>Gradient</label>
        <button className={`fader-toggle ${style.gradientOn ? "on" : ""}`} onClick={() => set({ gradientOn: !style.gradientOn })}>{style.gradientOn ? "ON" : "OFF"}</button>
        {style.gradientOn && (
          <>
            <input type="color" value={style.gradientFrom} onChange={(e) => set({ gradientFrom: e.target.value })} className="fader-colorpad small" />
            <span>→</span>
            <input type="color" value={style.gradientTo} onChange={(e) => set({ gradientTo: e.target.value })} className="fader-colorpad small" />
          </>
        )}
      </div>

      {/* BORDER (letter stroke) — fader 0 → 5 */}
      <div className="fader-row">
        <label>Border {style.border.toFixed(1)}</label>
        <input type="range" min="0" max="5" step="0.5" value={style.border} onChange={(e) => set({ border: Number(e.target.value) })} className="fader-slider" />
      </div>

      {/* EXPOSURE — fader 50 → 200 (brightness) */}
      <div className="fader-row">
        <label>Shadow {style.shadow}</label>
        <input type="range" min="0" max="40" step="1" value={style.shadow} onChange={(e) => set({ shadow: Number(e.target.value) })} className="fader-slider" />
      </div>

      {/* EXPOSURE — brightness, 50% dark → 200% blown out */}
      <div className="fader-row">
        <label>Exposure {style.exposure}%</label>
        <input type="range" min="50" max="200" step="5" value={style.exposure} onChange={(e) => set({ exposure: Number(e.target.value) })} className="fader-slider" />
      </div>
    </div>
  );
}

