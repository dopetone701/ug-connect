'use client'
export function ReelsModal({ current, onWatchFull }: any) {
  if(!current) return null
  return (
    <div className="reel-info">
      <h3>{current.title}</h3>
      <p className="reel-desc">{current.description? `${current.description.slice(0,110)}...` : ""}</p>
      <div className="reel-pills">
        {current.genre && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>{current.genre}</span>}
        {current.vj && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>{current.vj}</span>}
      </div>
      <button className="reel-watch-full" style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-text))"}} onClick={onWatchFull}>▶ Watch Full Movie</button>
    </div>
  )
}
