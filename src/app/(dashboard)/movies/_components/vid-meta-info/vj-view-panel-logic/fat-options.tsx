"use client"

// Tip amounts — "fat" = generous. UGX.
export const TIP_OPTIONS = [
  { amount: 1000, label: "1,000", tag: "Say thank you" },
  { amount: 2000, label: "2,000", tag: "Nice one 👏" },
  { amount: 5000, label: "5,000", tag: "You made my day" },
  { amount: 10000, label: "10,000", tag: "Legend 🔥" },
  { amount: 20000, label: "20,000", tag: "King / Queen 👑" },
] as const

export function FatOptions({
  selected, onSelect, onCustom,
}: {
  selected: number | null
  onSelect: (amount: number) => void
  onCustom: (amount: number) => void
}) {
  return (
    <div className="vj-tip-grid">
      {TIP_OPTIONS.map((o) => (
        <button
          key={o.amount}
          type="button"
          className={`vj-tip-chip ${selected === o.amount ? "selected" : ""}`}
          onClick={() => onSelect(o.amount)}
        >
          <span className="vj-tip-amount">UGX {o.label}</span>
          <span className="vj-tip-tag">{o.tag}</span>
        </button>
      ))}
      <label className="vj-tip-chip vj-tip-custom">
        <span className="vj-tip-amount">Other amount</span>
        <input
          type="number"
          inputMode="numeric"
          min={500}
          placeholder="e.g. 3000"
          onChange={(e) => onCustom(Number(e.target.value) || 0)}
          onClick={(e) => e.stopPropagation()}
        />
      </label>
    </div>
  )
}

