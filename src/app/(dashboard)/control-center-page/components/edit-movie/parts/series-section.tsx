// edit-movie/parts/series-section.tsx - FULL LENGTH router for Full vs Mini

"use client";
import type { SeasonDraft } from "../types";
import SeasonManager from "../../tv-series";
import MiniSeriesManager from "../../mini-series";

type Props = {
  type: "Single" | "Mini" | "Full";
  seasons: SeasonDraft[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonDraft[]>>;
};

export default function SeriesSection({ type, seasons, setSeasons }: Props) {
  if (type === "Single") return null;

  const isFull = type === "Full";
  const label = isFull ? "Season" : "Part";

  return (
    <div style={{ marginTop: 20 }}>
      {/* Header with count + Add button - stays in series-section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "hsl(var(--text))", fontSize: 14, fontWeight: 700 }}>
          📺 {isFull ? "Seasons & Episodes" : "Parts & Episodes"} - {seasons.length} {isFull ? "season(s)" : "part(s)"}
        </h4>
        <button
          type="button"
          onClick={() =>
            setSeasons([
              ...seasons,
              {
                id: crypto.randomUUID(),
                name: isFull ? `Season ${seasons.length + 1}` : `Part ${seasons.length + 1}`,
                episodes: [],
              } as any,
            ])
          }
          className="cc-btn ghost"
          style={{ 
            fontSize: 12, 
            background: "hsl(var(--surface))", 
            border: "1px solid hsl(var(--border))", 
            color: "hsl(var(--text))",
            padding: "6px 12px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          ➕ Add {isFull ? "Season" : "Part"}
        </button>
      </div>

      {/* Reuse your SOLID managers from old folder - they have 72x72 tiles + DNA theme */}
      <div className="series-manager-wrapper">
        {isFull ? (
          <SeasonManager 
            seasons={seasons as any} 
            setSeasons={setSeasons as any} 
            label={label as any}
          />
        ) : (
          <MiniSeriesManager 
            seasons={seasons as any} 
            setSeasons={setSeasons as any} 
          />
        )}
      </div>
    </div>
  );
}
