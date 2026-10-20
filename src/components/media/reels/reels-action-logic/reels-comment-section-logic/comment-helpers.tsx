
"use client"

export const WORKER_URL =
  "https://comment-actions-server-api.connectu89.workers.dev"

export const QUEUE_KEY = "reels_comment_queue_v1"
export const REACTION_QUEUE_KEY = "reels_reaction_queue_v1"

// =====================================================
// UG-CONNECT — REAL CLOCK SYNCHRONIZATION
// Uses an online UTC time source with local fallback.
// =====================================================

const CLOCK_API =
  "https://worldtimeapi.org/api/timezone/Etc/UTC"

const CLOCK_REFRESH_MS = 30 * 60 * 1000

let clockOffsetMs = 0
let lastClockSync = 0
let clockSyncPromise: Promise<void> | null = null

function getAccurateNow() {
  return Date.now() + clockOffsetMs
}

export async function syncRealClock(force = false): Promise<void> {
  if (typeof window === "undefined") return

  // Reuse an active request instead of sending duplicates.
  if (clockSyncPromise) return clockSyncPromise

  // Avoid unnecessary requests.
  if (
    !force &&
    lastClockSync &&
    Date.now() - lastClockSync < CLOCK_REFRESH_MS
  ) {
    return
  }

  clockSyncPromise = (async () => {
    const requestStarted = Date.now()
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 5000)

    try {
      const response = await fetch(CLOCK_API, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Clock service returned ${response.status}`)
      }

      const data = await response.json()
      const requestFinished = Date.now()

      // WorldTimeAPI returns unixtime in seconds.
      const serverTimeMs = Number(data.unixtime) * 1000

      if (
        !Number.isFinite(serverTimeMs) ||
        serverTimeMs <= 0
      ) {
        throw new Error("Invalid time from clock service")
      }

      // Estimate network delay using the request midpoint.
      const requestMidpoint =
        requestStarted + (requestFinished - requestStarted) / 2

      clockOffsetMs = serverTimeMs - requestMidpoint
      lastClockSync = requestFinished
    } catch (error) {
      // Keep the last good offset if synchronization fails.
      // With no successful sync, use the device clock.
      console.warn(
        "UG-Connect clock sync unavailable; using fallback clock.",
        error
      )
    } finally {
      clearTimeout(timeout)
      clockSyncPromise = null
    }
  })()

  return clockSyncPromise
}

// Start synchronization in the browser.
// The app continues working if the service is unavailable.
if (typeof window !== "undefined") {
  void syncRealClock()

  window.addEventListener("online", () => {
    void syncRealClock(true)
  })
}

// =====================================================
// DEVICE / ACCOUNT INFORMATION
// =====================================================

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
    const ugUserRaw = localStorage.getItem("ug_user")

    if (ugUserRaw) {
      const ugUser = JSON.parse(ugUserRaw)

      if (ugUser.id && !ugUser.isGuest) {
        return ugUser.id
      }
    }
  } catch {}

  return (
    localStorage.getItem("ugc_account_id") ||
    localStorage.getItem("account_id") ||
    localStorage.getItem("user_id") ||
    ""
  )
}

export function getUsername() {
  if (typeof window === "undefined") return "Anonymous"

  return (
    localStorage.getItem("ugc_username") ||
    localStorage.getItem("username") ||
    "Anonymous"
  )
}

export function getAvatarUrl() {
  if (typeof window === "undefined") return ""

  try {
    const raw = localStorage.getItem("ug_user")

    if (raw) {
      const user = JSON.parse(raw)
      return user.avatarUrl || user.avatar || ""
    }
  } catch {}

  return localStorage.getItem("ugc_avatar") || ""
}

// =====================================================
// COMMENT OWNERSHIP
// =====================================================

export function isCommentOwner(comment: any) {
  if (!comment) return false

  const currentDevice = getDeviceId()
  const currentAccount = getAccountId()

  if (
    currentAccount &&
    comment.account_id &&
    comment.account_id === currentAccount
  ) {
    return true
  }

  if (
    comment.device_id &&
    comment.device_id === currentDevice
  ) {
    return true
  }

  if (
    comment.account_id &&
    comment.account_id === currentDevice
  ) {
    return true
  }

  return false
}

// =====================================================
// COMMENT TIME — now, 1m, 1h, 1d, 1w, 1mo, 1yr
// =====================================================


export function timeAgo(dateStr: string | number | Date) {
  try {
    if (dateStr === null || dateStr === undefined || dateStr === "") {
      return ""
    }

    let timestamp: number

    if (dateStr instanceof Date) {
      timestamp = dateStr.getTime()
    } else if (typeof dateStr === "number") {
      timestamp = dateStr < 1e12 ? dateStr * 1000 : dateStr
    } else {
      const value = String(dateStr).trim()

      if (!value) return ""

      // Explicitly treat timezone-less SQL timestamps as UTC.
      const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
        ? value.replace(" ", "T") + "Z"
        : value

      timestamp = Date.parse(normalized)
    }

    if (!Number.isFinite(timestamp)) return ""

    const elapsed = Date.now() - timestamp

    // Small future differences can happen due to clock skew.
    if (elapsed <= 60_000) return "now"

    const minutes = Math.floor(elapsed / 60_000)

    if (minutes < 60) return `${minutes}m`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    if (days < 30) return `${Math.floor(days / 7)}w`
    if (days < 365) return `${Math.floor(days / 30)}mo`

    return `${Math.floor(days / 365)}yr`
  } catch {
    return ""
  }
}


// =====================================================
// NESTED COMMENT COUNT
// =====================================================

export const countNested = (list: any[]): number =>
  list.reduce(
    (total: number, comment: any) =>
      total +
      1 +
      (Array.isArray(comment.replies)
        ? countNested(comment.replies)
        : 0),
    0
  )

// =====================================================
// CLEAR COMMENT AND REACTION QUEUES
// =====================================================

export function clearLocalQueuesForId(id: string) {
  try {
    const all = JSON.parse(
      localStorage.getItem(QUEUE_KEY) || "[]"
    )

    const toDelete = new Set<string>([id])
    let changed = true

    while (changed) {
      changed = false

      for (const item of all) {
        if (
          toDelete.has(item.parentId) &&
          !toDelete.has(item.id)
        ) {
          toDelete.add(item.id)
          changed = true
        }
      }
    }

    const filtered = all.filter(
      (item: any) => !toDelete.has(item.id)
    )

    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(filtered)
    )
  } catch {}

  try {
    const reactionQueue = JSON.parse(
      localStorage.getItem(REACTION_QUEUE_KEY) || "[]"
    )

    localStorage.setItem(
      REACTION_QUEUE_KEY,
      JSON.stringify(
        reactionQueue.filter(
          (item: any) => item.commentId !== id
        )
      )
    )
  } catch {}
}

