"use client"
import { WORKER_URL, QUEUE_KEY, getDeviceId, getAccountId, getUsername } from "./comment-helpers"

function getAvatarUrl() {
  if (typeof window === "undefined") return ""
  try {
    const raw = localStorage.getItem("ug_user")
    if (raw) {
      const u = JSON.parse(raw)
      return u.avatarUrl || u.avatar || ""
    }
  } catch {}
  return localStorage.getItem("ugc_avatar") || ""
}

export function useSendComment({ movieId, setComments, replyTo, setReplyTo, text, setText, load }: any) {
  const send = async () => {
    if (!text.trim()) return
    const currentText = text.trim()
    const parentId = replyTo?.id || null
    const deviceId = getDeviceId()
    const accountId = getAccountId()
    const username = getUsername()
    const avatarUrl = getAvatarUrl()
    const tempId = `temp_${Date.now()}`

    const optimistic = {
      id: tempId,
      username,
      avatarUrl,
      text: currentText,
      created_at: new Date().toISOString(),
      heart_count: 0,
      parent_id: parentId,
      status: "seeding",
      device_id: deviceId,
      account_id: accountId,
      replies: []
    }

    setComments((prev: any) => {
      if (!parentId) return [...prev, optimistic]
      const deepAdd = (list: any[]): any[] => list.map((c: any) => {
        if (c.id === parentId) return { ...c, replies: [...(c.replies || []), optimistic] }
        if (c.replies) return { ...c, replies: deepAdd(c.replies) }
        return c
      })
      return deepAdd(prev)
    })
    setText(""); setReplyTo(null)

    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
      q.push({ id: tempId, movieId, text: currentText, parentId, deviceId, accountId, username, avatarUrl, created_at: optimistic.created_at, status: "seeding" })
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q))

      const res = await fetch(`${WORKER_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, text: currentText, parentId, deviceId, accountId, username, avatarUrl })
      })

      if (res.ok) {
        const all = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
        localStorage.setItem(QUEUE_KEY, JSON.stringify(all.filter((x: any) => x.id !== tempId)))
        await load()
        try {
          localStorage.setItem(`reels_comments_updated_${movieId}`, Date.now().toString())
          window.dispatchEvent(new CustomEvent(`reels_comments_updated_${movieId}`))
        } catch {}
      }
    } catch {}
  }
  return { send }
}

