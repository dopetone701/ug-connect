"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useActorViewPanel } from "@/stores/use-actor-view-panel"
import { ActorViewBody } from "./actor-view-body"
import "./actor-view.css"

export function ActorViewPanel() {
  const { isOpen, actorId, actor, close } = useActorViewPanel()
  const [mounted, setMounted] = useState(false)

  // Portal needs document.body — only on client, after first render
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!mounted) return null
  if (!isOpen || !actorId || !actor) return null

  // Portal out of WatchDrawer: escapes its transform / stacking context,
  // so fixed positioning is relative to the viewport again and it overlays the drawer
  return createPortal(
    <>
      <div className="actor-view-backdrop" onClick={close} />
      <div className="actor-view-panel">
        <div className="actor-view-handle" />
        <ActorViewBody actorId={actorId} actor={actor} onClose={close} />
      </div>
    </>,
    document.body
  )
}

