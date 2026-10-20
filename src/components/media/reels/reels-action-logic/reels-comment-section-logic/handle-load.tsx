"use client"
import { useCallback } from "react"
import { WORKER_URL, QUEUE_KEY, getDeviceId, countNested } from "./comment-helpers"

export function useCommentLoader(movieId: string, deletedIdsRef: React.MutableRefObject<Set<string>>, setComments: any, onCountChange?: (n: number) => void) {
  
  const load = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}/comments?movieId=${movieId}&deviceId=${getDeviceId()}`)
      const data = await res.json()
      let serverComments = data.comments || []
      const isDeleted = (id: string) => deletedIdsRef.current.has(id)
      const filterDeleted = (list: any[]): any[] => list.filter((c: any) => !isDeleted(c.id)).map((c: any) => ({ ...c, replies: c.replies ? filterDeleted(c.replies) : [] }))
      serverComments = filterDeleted(serverComments)
      const queue = (() => {
        try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]").filter((q: any) => q.movieId === movieId && q.status === "seeding" && !isDeleted(q.id) && !isDeleted(q.parentId)) } catch { return [] }
      })()
      let merged = [...serverComments]
      for (const q of queue) {
        const pending = { id: q.id, username: q.username, text: q.text, created_at: q.created_at, heart_count: 0, parent_id: q.parentId, status: "seeding", device_id: q.deviceId, replies: [] }
        if (!q.parentId) merged.push(pending)
        else {
          const deepAdd = (list: any[]): any[] => list.map((c: any) => {
            if (c.id === q.parentId) return { ...c, replies: [...(c.replies || []), pending] }
            if (c.replies) return { ...c, replies: deepAdd(c.replies) }
            return c
          })
          merged = deepAdd(merged)
        }
      }
      setComments(merged)
      onCountChange?.(countNested(merged))
    } catch {}
  }, [movieId, setComments, onCountChange, deletedIdsRef])

  const processQueue = useCallback(async () => {
    try {
      const isDeleted = (id: string) => deletedIdsRef.current.has(id)
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]").filter((q: any) => q.movieId === movieId && q.status === "seeding" && !isDeleted(q.id))
      for (const item of queue) {
        try {
          const res = await fetch(`${WORKER_URL}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movieId: item.movieId, text: item.text, parentId: item.parentId, deviceId: item.deviceId, username: item.username }) })
          if (res.ok) {
            const all = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
            localStorage.setItem(QUEUE_KEY, JSON.stringify(all.filter((x: any) => x.id !== item.id)))
          }
        } catch {}
      }
      await load()
    } catch {}
  }, [movieId, load, deletedIdsRef])

  return { load, processQueue }
}

