"use client"
import "./reels-comment-body.css"
import { useState, useEffect, useRef } from "react"
import { briefNumber } from "@/stores/use-brief-numbers"
import HeartIcon from "@/modal-generator/svg-icons/heart-icon"

const WORKER_URL = "https://comment-actions-server-api.connectu89.workers.dev"
const QUEUE_KEY = "reels_comment_queue_v1"
const REACTION_QUEUE_KEY = "reels_reaction_queue_v1"

function getDeviceId() {
  if (typeof window === "undefined") return "dev"
  let id = localStorage.getItem("ugc_device_id")
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem("ugc_device_id", id)
  }
  return id
}
function getUsername() {
  if (typeof window === "undefined") return "You"
  return localStorage.getItem("ugc_username") || localStorage.getItem("username") || "You"
}
function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "now"
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    return `${d}d`
  } catch { return "" }
}

const countNested = (list: any[]): number =>
  list.reduce((acc: number, c: any) => acc + 1 + (c.replies ? countNested(c.replies) : 0), 0)

function clearLocalQueuesForId(id: string) {
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
    const filtered = rq.filter((x: any) => x.commentId !== id)
    localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(filtered))
  } catch {}
}

function TailShareIcon({ size = 16, onClick }: { size?: number, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="reels-c-tail-share" type="button">
      <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22 76 C 24 52, 38 34, 62 34 L 62 16 C 62 12, 65 10, 68 12 L 92 46 C 94 48, 94 52, 92 54 L 68 88 C 65 90, 62 88, 62 84 L 62 66 C 42 66, 28 68, 22 76 Z" />
      </svg>
    </button>
  )
}

function DotsMenuIcon({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="reels-c-dots-btn" type="button">
      <svg viewBox="0 0 100 100" width={16} height={16}>
        <circle cx="28" cy="50" r="6" fill="currentColor" opacity={0.8} />
        <circle cx="50" cy="50" r="6" fill="currentColor" opacity={0.8} />
        <circle cx="72" cy="50" r="6" fill="currentColor" opacity={0.8} />
      </svg>
    </button>
  )
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
  onDelete,
  onShare,
}: any) {
  const [liked, setLiked] = useState(false)
  const [heartCount, setHeartCount] = useState(comment.heart_count || 0)
  const [showEmoji, setShowEmoji] = useState(false)
  const [myEmoji, setMyEmoji] = useState<string | null>(comment.my_reaction || null)
  const REPLIES_PER_PAGE = 4
  const [showReplies, setShowReplies] = useState(true)
  const [visibleReplyCount, setVisibleReplyCount] = useState(REPLIES_PER_PAGE)
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isSeeding = comment.status === "seeding"
  const isOwn =
    comment.device_id === getDeviceId() ||
    comment.username === "You" ||
    comment.username === getUsername()

  const EMOJIS = ["❤️", "😂", "🔥", "😭", "😮", "👏", "😍", "💀"]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const toggleLike = async () => {
    if (isSeeding) return
    const newLiked = !liked
    setLiked(newLiked)
    setHeartCount((c: number) => (newLiked ? c + 1 : Math.max(0, c - 1)))
    try {
      const likeQueue = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
      likeQueue.push({
        commentId: comment.id,
        deviceId: getDeviceId(),
        action: newLiked ? "like" : "unlike",
        status: "seeding",
        ts: Date.now(),
      })
      localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(likeQueue))
      const res = await fetch(`${WORKER_URL}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          deviceId: getDeviceId(),
          action: newLiked ? "like" : "unlike",
        }),
      })
      if (res.ok) {
        const q = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]").filter(
          (x: any) => !(x.commentId === comment.id && x.action === (newLiked ? "like" : "unlike"))
        )
        localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(q))
      }
    } catch {}
  }

  const reactEmoji = async (emoji: string) => {
    if (isSeeding) return
    const newEmoji = myEmoji === emoji ? null : emoji
    const oldEmoji = myEmoji
    setMyEmoji(newEmoji)
    setShowEmoji(false)
    try {
      const queue = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
      queue.push({
        commentId: comment.id,
        deviceId: getDeviceId(),
        emoji: newEmoji || "",
        status: "seeding",
        ts: Date.now(),
      })
      localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(queue))
      const res = await fetch(`${WORKER_URL}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          deviceId: getDeviceId(),
          emoji: newEmoji || "",
        }),
      })
      if (res.ok) {
        const q = JSON.parse(localStorage.getItem(REACTION_QUEUE_KEY) || "[]")
        localStorage.setItem(REACTION_QUEUE_KEY, JSON.stringify(q.filter((x: any) => x.commentId !== comment.id)))
      } else {
        setMyEmoji(oldEmoji)
      }
    } catch {
      setMyEmoji(oldEmoji)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(comment.text)
        onShare?.("Comment copied")
      }
    } catch {}
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!isOwn) return
    setShowMenu(false)
    clearLocalQueuesForId(comment.id)
    setIsDeleting(true)
    onDelete?.(comment.id)

    if (isSeeding) return

    try {
      const res = await fetch(`${WORKER_URL}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          deviceId: getDeviceId(),
          username: getUsername(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === "not owner") {
          onShare?.("Can't delete - not owner")
        }
        setIsDeleting(false)
      }
    } catch {
      setIsDeleting(false)
    }
  }

  if (isDeleting) return null

  const replies = Array.isArray(comment.replies) ? comment.replies : []
  const visibleReplies = replies.slice(0, visibleReplyCount)
  const remainingReplies = Math.max(0, replies.length - visibleReplyCount)

  return (
    <div className="reels-c-item" data-depth={depth} style={{ opacity: isSeeding ? 0.7 : 1 }}>
      <div className="reels-c-bubble-wrap">
        <div className="reels-c-avatar">{comment.username?.[0]?.toUpperCase() || "U"}</div>
        <div className="reels-c-content">
          <div className="reels-c-bubble">
            <span className="reels-c-user">
              {comment.username || "You"}
              {isSeeding && <span> • seeding...</span>}
            </span>
            <p className="reels-c-text">{comment.text}</p>
            {myEmoji && <span className="reels-c-my-emoji">{myEmoji}</span>}
          </div>
          <div className="reels-c-actions">
            <span className="reels-c-time">{isSeeding ? "seeding..." : timeAgo(comment.created_at)}</span>
            <button onClick={toggleLike} className={`reels-c-like ${liked ? "liked" : ""}`} type="button">
              <HeartIcon size={14} filled={liked} style={{ color: liked ? "#ff3040" : "inherit" } as any} />
              {briefNumber(heartCount)}
            </button>
            {!isSeeding && (
              <button onClick={() => onReply(comment)} className="reels-c-reply-btn" type="button">
                Reply
              </button>
            )}
            {!isSeeding && <TailShareIcon size={14} onClick={handleShare} />}
            {!isSeeding && (
              <button onClick={() => setShowEmoji(!showEmoji)} className="reels-c-emoji-trigger" type="button">
                😊
              </button>
            )}
            <div ref={menuRef} className="reels-c-dots-wrap">
              <DotsMenuIcon onClick={() => setShowMenu(!showMenu)} />
              {showMenu && (
                <div className="reels-c-menu-dropdown">
                  <button onClick={() => { onReply(comment); setShowMenu(false) }} className="reels-c-menu-item" type="button">💬 Reply</button>
                  <button onClick={handleShare} className="reels-c-menu-item" type="button">↗️ Share</button>
                  <button onClick={() => { toggleLike(); setShowMenu(false) }} className="reels-c-menu-item" type="button">❤️ {liked ? "Unlike" : "Like"}</button>
                  {isOwn && (
                    <button onClick={handleDelete} className="reels-c-menu-item danger" type="button">🗑️ Delete</button>
                  )}
                </div>
              )}
            </div>
          </div>
          {showEmoji && (
            <div className="reels-c-emoji-picker">
              {EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => reactEmoji(emoji)} className={myEmoji === emoji ? "active" : ""} type="button">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="reels-c-thread">
          <button className="reels-c-show-replies" onClick={() => setShowReplies((previous) => !previous)} type="button" aria-expanded={showReplies}>
            {showReplies ? "Hide replies" : "Show replies"}
          </button>
          {showReplies && (
            <div className="reels-c-replies">
              {visibleReplies.map((reply: any) => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} onDelete={onDelete} onShare={onShare} />
              ))}
              {remainingReplies > 0 && (
                <button type="button" className="reels-c-show-replies" onClick={() => setVisibleReplyCount((count) => Math.min(count + REPLIES_PER_PAGE, replies.length))}>
                  Show {remainingReplies} more {remainingReplies === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ReelsCommentBody({ movieId, onCountChange }: { movieId: string, onCountChange?: (count: number) => void }) {
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [localCount, setLocalCount] = useState(0)
  const [toast, setToast] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const deletedIdsRef = useRef<Set<string>>(new Set())

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  const load = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/comments?movieId=${movieId}&deviceId=${getDeviceId()}`)
      const data = await res.json()
      let serverComments = data.comments || []

      const isDeleted = (id: string) => deletedIdsRef.current.has(id)
      const filterDeleted = (list: any[]): any[] =>
        list.filter((c: any) => !isDeleted(c.id)).map((c: any) => ({
          ...c,
          replies: c.replies ? filterDeleted(c.replies) : [],
        }))

      serverComments = filterDeleted(serverComments)

      const queue = (() => {
        try {
          return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]").filter(
            (q: any) => q.movieId === movieId && q.status === "seeding" && !isDeleted(q.id) && !isDeleted(q.parentId)
          )
        } catch { return [] }
      })()

      let merged = [...serverComments]
      for (const q of queue) {
        const pending = {
          id: q.id, username: q.username, text: q.text, created_at: q.created_at,
          heart_count: 0, parent_id: q.parentId, status: "seeding",
          device_id: q.deviceId, replies: [],
        }
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
      const total = countNested(merged)
      setLocalCount(total)
      onCountChange?.(total)
    } catch {}
  }

  const processQueue = async () => {
    try {
      const isDeleted = (id: string) => deletedIdsRef.current.has(id)
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]").filter(
        (q: any) => q.movieId === movieId && q.status === "seeding" && !isDeleted(q.id)
      )
      for (const item of queue) {
        try {
          const res = await fetch(`${WORKER_URL}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              movieId: item.movieId, text: item.text, parentId: item.parentId,
              deviceId: item.deviceId, username: item.username,
            }),
          })
          if (res.ok) {
            const all = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
            localStorage.setItem(QUEUE_KEY, JSON.stringify(all.filter((x: any) => x.id !== item.id)))
          }
        } catch {}
      }
      await load()
    } catch {}
  }

  useEffect(() => {
    deletedIdsRef.current.clear()
    load()
    processQueue()
    const i = setInterval(processQueue, 5000)
    return () => clearInterval(i)
  }, [movieId])

  const handleDelete = (id: string) => {
    deletedIdsRef.current.add(id)
    clearLocalQueuesForId(id)

    setComments(prev => {
      let removed = 0
      const deepRemove = (list: any[]): any[] => {
        const filtered: any[] = []
        for (const c of list) {
          if (c.id === id) {
            removed += countNested([c])
            const markNestedDeleted = (n: any) => {
              deletedIdsRef.current.add(n.id)
              if (n.replies) n.replies.forEach(markNestedDeleted)
            }
            markNestedDeleted(c)
            continue
          }
          if (c.replies && c.replies.length > 0) {
            const before = countNested(c.replies)
            const newReplies = deepRemove(c.replies)
            const after = countNested(newReplies)
            removed += before - after
            filtered.push({ ...c, replies: newReplies })
          } else {
            filtered.push(c)
          }
        }
        return filtered
      }
      const next = deepRemove(prev)
      setLocalCount(curr => {
        const nc = Math.max(0, curr - removed)
        onCountChange?.(nc)
        return nc
      })
      return next
    })

    try {
      localStorage.setItem(`reels_comments_updated_${movieId}`, Date.now().toString())
      window.dispatchEvent(new CustomEvent(`reels_comments_updated_${movieId}`))
      window.dispatchEvent(new CustomEvent(`reels_comment_deleted`))
    } catch {}

    showToast("Deleted")
  }

  const send = async () => {
    if (!text.trim()) return
    const currentText = text.trim()
    const parentId = replyTo?.id || null
    const deviceId = getDeviceId()
    const username = getUsername()
    const tempId = `temp_${Date.now()}`

    const optimistic = {
      id: tempId, username, text: currentText, created_at: new Date().toISOString(),
      heart_count: 0, parent_id: parentId, status: "seeding", device_id: deviceId, replies: [],
    }

    setComments((prev) => {
      if (!parentId) return [...prev, optimistic]
      const deepAdd = (list: any[]): any[] => list.map((c: any) => {
        if (c.id === parentId) return { ...c, replies: [...(c.replies || []), optimistic] }
        if (c.replies) return { ...c, replies: deepAdd(c.replies) }
        return c
      })
      return deepAdd(prev)
    })
    setLocalCount(c => {
      const nc = c + 1
      onCountChange?.(nc)
      return nc
    })
    setText("")
    setReplyTo(null)

    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
      q.push({ id: tempId, movieId, text: currentText, parentId, deviceId, username, created_at: optimistic.created_at, status: "seeding" })
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q))

      const res = await fetch(`${WORKER_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, text: currentText, parentId, deviceId, username }),
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

  return (
    <div className="reels-c-body">
      <div className="reels-c-list">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={(cm: any) => { setReplyTo(cm); setTimeout(() => inputRef.current?.focus(), 100) }} onDelete={handleDelete} onShare={showToast} />
        ))}
        {comments.length === 0 && (
          <div className="reels-c-empty">
            <div>💬</div>
            <div>No comments yet</div>
            <div>Be the first!</div>
          </div>
        )}
      </div>
      <div className="reels-c-input-bar">
        {replyTo && (
          <div className="reels-c-replying-to">
            <span>Replying to <b>{replyTo.username}</b></span>
            <button onClick={() => setReplyTo(null)} type="button">×</button>
          </div>
        )}
        <div className="reels-c-input-wrap">
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Add a comment..."} />
          <button onClick={send} disabled={!text.trim()} type="button">➤</button>
        </div>
      </div>
      {toast && <div className="reels-c-toast">{toast}</div>}
    </div>
  )
}

  