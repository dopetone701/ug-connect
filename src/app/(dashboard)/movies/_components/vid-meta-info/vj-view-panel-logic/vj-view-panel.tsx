"use client"


import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useVJViewPanel } from "./use-vj-view-panel"
import { VJViewBody } from "./vj-view-body"
import "./vj-view.css"


export function VJViewPanel() {
  const { isOpen, vjId, vj, close } = useVJViewPanel()
  const [mounted, setMounted] = useState(false)


  useEffect(() => { setMounted(true) }, [])


  // Scroll lock — preserve previous overflow, restore on close/unmount
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [isOpen])


  // Esc to close
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, close])


  if (!mounted) return null
  if (!isOpen || !vjId || !vj) return null


  return createPortal(
    <>
      <div className="vj-view-backdrop" onClick={close} />
      <div
        className="vj-view-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`About ${vj.name}`}
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* HOLD — handle stays here, outside the scroll, never scrolls away */}
        <div className="vj-view-handle" />
        {/* SCROLL — only this part scrolls, handle + topbar stay held */}
        <div
          className="vj-view-scroll"
          style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}
        >
          <VJViewBody vjId={vjId} vj={vj} onClose={close} />
        </div>
      </div>
    </>,
    document.body
  )
}

