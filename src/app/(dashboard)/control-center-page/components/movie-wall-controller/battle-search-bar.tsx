"use client"
// Battle search — searches ONLY battles in this Controller.
// Matches movie title OR any VJ name inside the battle. No global search, no Wall search.
export default function BattleSearchBar({ value, onChange, total, shown }: { value: string; onChange: (v: string) => void; total: number; shown: number }) {
  return (
    <div className="mwcp-search">
      <span className="mwcp-search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search battles… title or VJ"
        aria-label="Search battles"
      />
      {value && <button type="button" className="mwcp-search-clear" onClick={() => onChange("")}>✕</button>}
      <span className="mwcp-search-count">{shown}/{total}</span>
    </div>
  )
}

