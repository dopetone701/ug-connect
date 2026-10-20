
"use client"

import { useCallback } from "react"
import {
  WORKER_URL,
  QUEUE_KEY,
  getDeviceId,
  countNested,
} from "./comment-helpers"

export function useCommentLoader(
  movieId: string,
  deletedIdsRef: React.MutableRefObject<Set<string>>,
  setComments: any,
  onCountChange?: (n: number) => void
) {
  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${WORKER_URL}/comments?movieId=${encodeURIComponent(movieId)}&deviceId=${encodeURIComponent(getDeviceId())}`
      )

      if (!res.ok) return

      const data = await res.json()
      let serverComments = Array.isArray(data.comments)
        ? data.comments
        : []

      const isDeleted = (id: any) =>
        deletedIdsRef.current.has(String(id))

      const filterDeleted = (list: any[]): any[] =>
        list
          .filter((c: any) => !isDeleted(c.id))
          .map((c: any) => ({
            ...c,
            replies: filterDeleted(
              Array.isArray(c.replies) ? c.replies : []
            ),
          }))

      
const getCommentTimestamp = (comment: any): number => {
  const raw = comment?.created_at ?? comment?.createdAt

  if (raw === null || raw === undefined || raw === "") {
    return 0
  }

  if (typeof raw === "number" || /^\d+$/.test(String(raw).trim())) {
    const number = Number(raw)
    return number < 1e12 ? number * 1000 : number
  }

  const parsed = Date.parse(String(raw))
  return Number.isFinite(parsed) ? parsed : 0
}

const sortNewestFirst = (list: any[]): any[] =>
  [...list]
    .sort(
      (a: any, b: any) =>
        getCommentTimestamp(b) - getCommentTimestamp(a)
    )
    .map((c: any) => ({
      ...c,
      replies: sortNewestFirst(
        Array.isArray(c.replies) ? c.replies : []
      ),
    }))



      serverComments = filterDeleted(serverComments)

      const queue = (() => {
        try {
          const saved = JSON.parse(
            localStorage.getItem(QUEUE_KEY) || "[]"
          )

          return saved.filter(
            (q: any) =>
              q.movieId === movieId &&
              q.status === "seeding" &&
              !isDeleted(q.id) &&
              (!q.parentId || !isDeleted(q.parentId))
          )
        } catch {
          return []
        }
      })()

      let merged = [...serverComments]

      for (const q of queue) {
        const pending = {
          id: q.id,
          username: q.username,
          avatarUrl: q.avatarUrl || "",
          text: q.text,
          created_at: q.created_at,
          heart_count: 0,
          parent_id: q.parentId,
          status: "seeding",
          device_id: q.deviceId,
          account_id: q.accountId,
          replies: [],
        }

        // Avoid displaying the same comment twice.
        const alreadyExists = (list: any[]): boolean =>
          list.some(
            (c: any) =>
              String(c.id) === String(q.id) ||
              alreadyExists(
                Array.isArray(c.replies) ? c.replies : []
              )
          )

        if (alreadyExists(merged)) continue

        if (!q.parentId) {
          // New top-level queued comments are added to the list,
          // then sorted newest-first below.
          merged.push(pending)
        } else {
          const deepAdd = (list: any[]): any[] =>
            list.map((c: any) => {
              if (String(c.id) === String(q.parentId)) {
                return {
                  ...c,
                  replies: [
                    ...(Array.isArray(c.replies)
                      ? c.replies
                      : []),
                    pending,
                  ],
                }
              }

              if (Array.isArray(c.replies)) {
                return {
                  ...c,
                  replies: deepAdd(c.replies),
                }
              }

              return c
            })

          merged = deepAdd(merged)
        }
      }

      merged = sortNewestFirst(merged)

      setComments(merged)
      onCountChange?.(countNested(merged))
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }, [movieId, setComments, onCountChange, deletedIdsRef])

  const processQueue = useCallback(async () => {
    try {
      const isDeleted = (id: any) =>
        deletedIdsRef.current.has(String(id))

      const queue = JSON.parse(
        localStorage.getItem(QUEUE_KEY) || "[]"
      ).filter(
        (q: any) =>
          q.movieId === movieId &&
          q.status === "seeding" &&
          !isDeleted(q.id)
      )

      for (const item of queue) {
        try {
          const res = await fetch(`${WORKER_URL}/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              movieId: item.movieId,
              text: item.text,
              parentId: item.parentId,
              deviceId: item.deviceId,
              accountId: item.accountId,
              username: item.username,
              avatarUrl: item.avatarUrl,
            }),
          })

          if (res.ok) {
            const all = JSON.parse(
              localStorage.getItem(QUEUE_KEY) || "[]"
            )

            localStorage.setItem(
              QUEUE_KEY,
              JSON.stringify(
                all.filter((x: any) => x.id !== item.id)
              )
            )
          }
        } catch {}
      }

      await load()
    } catch (error) {
      console.error("Failed to process comment queue:", error)
    }
  }, [movieId, load, deletedIdsRef])

  return { load, processQueue }
}

