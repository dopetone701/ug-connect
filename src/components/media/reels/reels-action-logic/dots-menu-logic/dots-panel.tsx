"use client"

import { useEffect } from "react"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { DotsBody } from "./dots-body"
import "./dots-body.css"

export function DotsPanel() {
  const { isOpen, movieId, movie, close } = useDotsPanel()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen || !movieId) return null

  return (
    <>
      <div className="dots-backdrop" onClick={close} />
      <div className="dots-panel">
        <div className="dots-handle" />
        <DotsBody movieId={movieId} movie={movie} onClose={close} />
      </div>
    </>
  )
}

