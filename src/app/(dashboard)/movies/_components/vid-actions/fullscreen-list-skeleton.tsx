"use client"

import { useEffect, useState } from "react"

// SKELETON = FACE OF REAL CARD. Same 16:9 thumb, same text positions, same gap.
// Shimmer = moving light sweeping left -> right, like data is being fetched — not a blink.

function useThumbWidth() {
  const [w, setW] = useState(160)
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isLandscape = vw > vh
      const isPhone = Math.min(vw, vh) <= 430
      if (isPhone && isLandscape) setW(160)
      else if (isPhone) setW(150)
      else if (vw <= 768) setW(150)
      else setW(168)
    }
    calc()
    window.addEventListener("resize", calc)
    window.addEventListener("orientationchange", calc)
    return () => {
      window.removeEventListener("resize", calc)
      window.removeEventListener("orientationchange", calc)
    }
  }, [])
  return w
}

export function FullscreenListSkeletonRow() {
  const thumbW = useThumbWidth()
  const thumbH = Math.round(thumbW * 9 / 16)
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 12, width: "100%", flexShrink: 0, boxSizing: "border-box" }}>
      <div className="fls-shimmer" style={{ width: thumbW, minWidth: thumbW, maxWidth: thumbW, flexGrow: 0, flexShrink: 0, flexBasis: thumbW, height: thumbH, borderRadius: 10, overflow: "hidden", boxSizing: "border-box" }} />
      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: 0, width: 0, paddingTop: 2, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div className="fls-shimmer" style={{ height: 14, width: "92%", borderRadius: 6 }} />
        <div className="fls-shimmer" style={{ height: 14, width: "64%", borderRadius: 6, marginTop: 6 }} />
        <div className="fls-shimmer" style={{ height: 12, width: "44%", borderRadius: 6, marginTop: 8 }} />
        <div className="fls-shimmer" style={{ height: 12, width: "34%", borderRadius: 6, marginTop: 6 }} />
      </div>
    </div>
  )
}

export default function FullscreenListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes fls-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .fls-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.10) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.10) 75%);
          background-size: 200% 100%;
          animation: fls-sweep 1.2s linear infinite;
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        {Array.from({ length: count }).map((_, i) => (
          <FullscreenListSkeletonRow key={i} />
        ))}
      </div>
    </>
  )
}

