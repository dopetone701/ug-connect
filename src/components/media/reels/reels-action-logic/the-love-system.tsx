"use client"

import { useState, useEffect, useCallback } from "react"
import HeartIcon from "@/modal-generator/svg-icons/heart-icon"
import { briefNumber } from "@/stores/use-brief-numbers"

type Props = {
  movieId: string
  initialCount?: number
  size?: number
}

const WORKER_URL = "https://movie-actions-server-api.connectu89.workers.dev/heart"

function getDeviceId() {
  if (typeof window === "undefined") return "server"
  let id = localStorage.getItem("ugc_device_id")
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem("ugc_device_id", id)
  }
  return id
}

function getLocalLike(movieId: string) {
  if (typeof window === "undefined") return false
  return localStorage.getItem(`ugc_heart_${movieId}`) === "1"
}

function setLocalLike(movieId: string, liked: boolean) {
  if (liked) localStorage.setItem(`ugc_heart_${movieId}`, "1")
  else localStorage.removeItem(`ugc_heart_${movieId}`)
}

export function TheLoveSystem({ movieId, initialCount = 1, size = 22 }: Props) {
  const [count, setCount] = useState(() => Math.max(initialCount, 1))
  const [liked, setLiked] = useState(false)
  const [pop, setPop] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLiked(getLocalLike(movieId))
  }, [movieId])

  useEffect(() => {
    setCount(Math.max(initialCount, 1))
  }, [initialCount])

  const toggle = useCallback(async () => {
    if (busy) return
    setBusy(true)
    const newLiked = !liked
    const deviceId = getDeviceId()

    // Optimistic UI
    setLiked(newLiked)
    setLocalLike(movieId, newLiked)
    setCount((c) => (newLiked ? c + 1 : Math.max(1, c - 1)))
    setPop(true)
    setTimeout(() => setPop(false), 320)

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, deviceId, action: newLiked ? "like" : "unlike" }),
      })
      const data = await res.json()
      if (data?.heart_count) {
        setCount(Math.max(data.heart_count, 1))
      }
    } catch (e) {
      console.error("heart sync failed", e)
    } finally {
      setBusy(false)
    }
  }, [liked, movieId, busy])

  return (
    <button type="button" className="ra-btn" onClick={toggle} aria-label="Like">
      <span className={`ra-icon-bg ${pop ? "ra-heart-pop" : ""}`}>
        <HeartIcon
          size={size}
          filled={liked}
          style={{
            color: liked ? "#ff3040" : "hsl(var(--text))",
            fill: liked ? "#ff3040" : "transparent",
            stroke: liked ? "#ff3040" : "hsl(var(--text))",
          }}
        />
      </span>
      <span className="ra-label">{briefNumber(count)}</span>
    </button>
  )
}

export const LoveSystem = TheLoveSystem
export default TheLoveSystem

