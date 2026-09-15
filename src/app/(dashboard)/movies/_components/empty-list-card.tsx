"use client"

import { useRef } from "react"

export default function EmptyListCard({
  onClick,
}: {
  onClick?: () => void
}) {
  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)

    if (dx > 6 || dy > 6) {
      movedRef.current = true
    }
  }

  const handlePointerUp = () => {
    // Keep the movement lock alive until after onClick fires.
    setTimeout(() => {
      movedRef.current = false
    }, 100)
  }

  const handleClick = () => {
    if (movedRef.current) return
    onClick?.()
  }

  return (
    <div
      className="latest-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
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
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{ opacity: 0.7 }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      <div className="l-card-title centered">
        create list
      </div>
    </div>
  )
}
