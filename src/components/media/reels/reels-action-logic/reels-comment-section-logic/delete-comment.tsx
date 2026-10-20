"use client"
import { WORKER_URL, getDeviceId, clearLocalQueuesForId, countNested } from "./comment-helpers"

export function useDeleteComment({ movieId, deletedIdsRef, setComments, onCountChange, showToast }: any) {
  const handleDelete = async (id: string) => {
    const currentDeviceId = getDeviceId()
    deletedIdsRef.current.add(id)
    clearLocalQueuesForId(id)

    setComments((prev: any) => {
      const deepRemove = (list: any[]): any[] => {
        const filtered: any[] = []
        for (const c of list) {
          if (c.id === id) {
            const markNestedDeleted = (n: any) => {
              deletedIdsRef.current.add(n.id)
              if (n.replies) n.replies.forEach(markNestedDeleted)
            }
            markNestedDeleted(c)
            continue
          }
          if (c.replies?.length > 0) {
            filtered.push({ ...c, replies: deepRemove(c.replies) })
          } else {
            filtered.push(c)
          }
        }
        return filtered
      }
      const next = deepRemove(prev)
      onCountChange?.(countNested(next))
      return next
    })

    try {
      localStorage.setItem(`reels_comments_updated_${movieId}`, Date.now().toString())
      window.dispatchEvent(new CustomEvent(`reels_comments_updated_${movieId}`))
    } catch {}

    try {
      const res = await fetch(`${WORKER_URL}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commentId: id, 
          deviceId: currentDeviceId,
          accountId: currentDeviceId 
        })
      })
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (data.error === "not owner") {
          showToast?.(`Not owner - D1 has ${data.existing_device?.slice(0,8)}`)
          deletedIdsRef.current.delete(id)
          window.dispatchEvent(new CustomEvent(`reels_comments_updated_${movieId}`))
        } else {
          showToast?.("Delete failed")
        }
        return
      }
      
      window.dispatchEvent(new CustomEvent(`reels_comment_deleted`))
      showToast?.("Deleted")
    } catch {
      showToast?.("Delete failed offline")
    }
  }

  return { handleDelete }
}
