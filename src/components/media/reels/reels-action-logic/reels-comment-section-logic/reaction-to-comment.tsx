"use client"
import { useState } from "react"
import { WORKER_URL, REACTION_QUEUE_KEY, getDeviceId } from "./comment-helpers"

export function useCommentReaction(comment: any) {
  const [liked, setLiked] = useState(false)
  const [heartCount, setHeartCount] = useState(comment.heart_count || 0)
  const [myEmoji, setMyEmoji] = useState<string | null>(comment.my_reaction || null)
  const [showEmoji, setShowEmoji] = useState(false)
  const toggleLike = async () => {
    if (comment.status === "seeding") return
    const newLiked = !liked
    setLiked(newLiked); setHeartCount((c: number) => (newLiked ? c + 1 : Math.max(0, c - 1)))
    try {
      const likeQueue = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
      likeQueue.push({ commentId: comment.id, deviceId: getDeviceId(), action: newLiked ? "like" : "unlike", status: "seeding", ts: Date.now() })
      localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(likeQueue))
      const res = await fetch(`${WORKER_URL}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commentId: comment.id, deviceId: getDeviceId(), action: newLiked ? "like" : "unlike" }) })
      if (res.ok) {
        const q = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]").filter((x: any) => !(x.commentId === comment.id && x.action === (newLiked ? "like" : "unlike")))
        localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(q))
      }
    } catch {}
  }
  const reactEmoji = async (emoji: string) => {
    if (comment.status === "seeding") return
    const newEmoji = myEmoji === emoji ? null : emoji
    const oldEmoji = myEmoji; setMyEmoji(newEmoji); setShowEmoji(false)
    try {
      const queue = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
      queue.push({ commentId: comment.id, deviceId: getDeviceId(), emoji: newEmoji || "", status: "seeding", ts: Date.now() })
      localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(queue))
      const res = await fetch(`${WORKER_URL}/reaction`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commentId: comment.id, deviceId: getDeviceId(), emoji: newEmoji || "" }) })
      if (res.ok) localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]").filter((x: any) => x.commentId !== comment.id)))
      else setMyEmoji(oldEmoji)
    } catch { setMyEmoji(oldEmoji) }
  }
  return { liked, heartCount, myEmoji, showEmoji, setShowEmoji, toggleLike, reactEmoji }
}

