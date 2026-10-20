"use client"

export const WORKER_URL = "https://comment-actions-server-api.connectu89.workers.dev"
export const QUEUE_KEY = "reels_comment_queue_v1"
export const REACTION_QUEUE_KEY = "reels_reaction_queue_v1"

export function getDeviceId() {
  if (typeof window === "undefined") return "dev"
  let id = localStorage.getItem("ugc_device_id")
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem("ugc_device_id", id)
  }
  return id
}

export function getAccountId() {
  if (typeof window === "undefined") return ""
  try {
    const ugUserRaw = localStorage.getItem("ug_user");
    if (ugUserRaw) {
      const ugUser = JSON.parse(ugUserRaw);
      if (ugUser.id && !ugUser.isGuest) return ugUser.id;
    }
  } catch {}
  return localStorage.getItem("ugc_account_id") || 
         localStorage.getItem("account_id") || 
         localStorage.getItem("user_id") || 
         ""
}


export function getUsername() {
  if (typeof window === "undefined") return "Anonymous"
  return localStorage.getItem("ugc_username") || localStorage.getItem("username") || "Anonymous"
}



export function getAvatarUrl() {
  if (typeof window === "undefined") return ""
  try {
    const raw = localStorage.getItem("ug_user");
    if (raw) {
      const u = JSON.parse(raw);
      return u.avatarUrl || u.avatar || ""
    }
  } catch {}
  return localStorage.getItem("ugc_avatar") || ""
}


export function isCommentOwner(comment: any) {
  if (!comment) return false
  const curDevice = getDeviceId()
  const curAccount = getAccountId()

  // 1. SAME ACCOUNT = owner even if device is different
  if (curAccount && comment.account_id && comment.account_id === curAccount) {
    return true
  }

  // 2. SAME DEVICE = owner (for guests / old comments without account_id)
  if (comment.device_id && comment.device_id === curDevice) {
    return true
  }

  // 3. Fallback for old data where account_id was set to device_id
  if (comment.account_id && comment.account_id === curDevice) {
    return true
  }

  return false
}

export function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "now"
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    return `${d}d`
  } catch {
    return ""
  }
}

export const countNested = (list: any[]): number =>
  list.reduce((acc: number, c: any) => acc + 1 + (c.replies ? countNested(c.replies) : 0), 0)

export function clearLocalQueuesForId(id: string) {
  try {
    const all = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
    const toDelete = new Set<string>([id])
    let changed = true
    while (changed) {
      changed = false
      for (const q of all) {
        if (toDelete.has(q.parentId) && !toDelete.has(q.id)) {
          toDelete.add(q.id)
          changed = true
        }
      }
    }
    const filtered = all.filter((x: any) => !toDelete.has(x.id))
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
  } catch {}
  try {
    const rq = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
    localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(rq.filter((x: any) => x.commentId !== id)))
  } catch {}
}

