"use client"

export default function EmptyListCard({ onClick }: { onClick?: () => void }) {
  return (
    <div className="latest-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        className="l-card-cover"
        style={{
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: "hsl(var(--border,0 0% 20%) / 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(var(--surface,0 0% 12%) / 0.5)",
          borderRadius: 10,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ opacity: 0.7 }}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div className="l-card-title centered">create list</div>
    </div>
  )
}
