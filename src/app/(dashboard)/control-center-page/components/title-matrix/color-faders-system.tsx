"use client";
import "./faders.css";
import { useTitleMatrixStore, DEFAULT_STYLE } from "./title-matrix-store";

// Faders update the card instantly (local) and the store saves to D1 once, ~400ms after you stop moving.
export default function ColorFaders({ movieId }: { movieId: string }) {
  const cur = useTitleMatrixStore((s) => s.overlays[movieId]);
  const setStyle = useTitleMatrixStore((s) => s.setStyle);
  const style = { ...DEFAULT_STYLE, ...(cur?.style || {}) };

  // Pass ONLY the changed field. The store merges it onto the latest style.
  const set = (patch: Partial<typeof style>) => setStyle(movieId, patch);

  return (
    <div className="faders">
      <div className="fader-row">
        <label>Color</label>
        <input type="color" value={style.color} onChange={(e) => set({ color: e.target.value })} className="fader-colorpad" />
        <div className="fader-swatches">
          {["#ffffff", "#ffd700", "#ff3b30", "#ff0080", "#00e5ff", "#7cff00", "#ff8c00"].map(c => (
            <button key={c} className="fader-swatch" style={{ background: c }} onClick={() => set({ color: c })} />
          ))}
        </div>
      </div>

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

      <div className="fader-row">
        <label>Border {style.border.toFixed(1)}</label>
        <input type="range" min="0" max="5" step="0.5" value={style.border} onChange={(e) => set({ border: Number(e.target.value) })} className="fader-slider" />
      </div>

      <div className="fader-row">
        <label>Shadow {style.shadow}</label>
        <input type="range" min="0" max="40" step="1" value={style.shadow} onChange={(e) => set({ shadow: Number(e.target.value) })} className="fader-slider" />
      </div>

      <div className="fader-row">
        <label>Exposure {style.exposure}%</label>
        <input type="range" min="50" max="200" step="5" value={style.exposure} onChange={(e) => set({ exposure: Number(e.target.value) })} className="fader-slider" />
      </div>
    </div>
  );
}
