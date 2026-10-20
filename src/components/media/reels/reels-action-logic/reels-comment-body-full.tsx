
"use client"

import "./reels-comment-body.css"
import { useState, useRef, useEffect, useCallback } from "react"
import { useCommentLoader } from "./reels-comment-section-logic/handle-load"
import { useSendComment } from "./reels-comment-section-logic/send-comment"
import { useDeleteComment } from "./reels-comment-section-logic/delete-comment"
import { RenderCommentList } from "./reels-comment-section-logic/render-comment-item"
import { getEmojisForMovie } from "./reels-comment-section-logic/emoji-factory"
import { SendIcon } from "../reels-actions"

type Props = {
  movieId: string
  movie?: any
  onCountChange?: (count: number) => void
}

export function ReelsCommentBody({ movieId, movie, onCountChange }: Props) {
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [toast, setToast] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const deletedIdsRef = useRef<Set<string>>(new Set())
  const sendingRef = useRef(false)
  const mountedRef = useRef(true)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => {
      if (mountedRef.current) setToast("")
    }, 2000)
  }, [])

  const { load, processQueue } = useCommentLoader(
    movieId,
    deletedIdsRef,
    setComments,
    onCountChange
  )

  const { send: originalSend } = useSendComment({
    movieId,
    setComments,
    replyTo,
    setReplyTo,
    text,
    setText,
    load,
  })

  const { handleDelete } = useDeleteComment({
    movieId,
    deletedIdsRef,
    setComments,
    onCountChange,
    showToast,
  })

  // Scroll only when explicitly requested after sending.
  // Never scroll in response to background comment updates.
  const scrollToTopOnSend = useCallback(() => {
    requestAnimationFrame(() => {
      const list = listRef.current
      if (list) list.scrollTop = 0
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    deletedIdsRef.current.clear()

    void load()
    void processQueue()

    const interval = setInterval(() => {
      void processQueue()
    }, 5000)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [movieId, load, processQueue])

  // Send a normal comment or reply.
  const handleSendWrapper = async () => {
    if (!text.trim() || sendingRef.current) return

    sendingRef.current = true

    // Trigger scrolling only because the user pressed Send.
    scrollToTopOnSend()

    try {
      await originalSend()
      scrollToTopOnSend()
    } finally {
      sendingRef.current = false
    }
  }

  // Send an emoji instantly and put it at the top.
  const handleFactoryInstantPost = async (emoji: string) => {
    if (sendingRef.current) return

    sendingRef.current = true

    const parentId = replyTo?.id ?? replyTo?._id ?? null
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const optimisticComment = {
      id: tempId,
      text: emoji,
      username: "You",
      userId: "me",
      createdAt: new Date().toISOString(),
      replyTo: parentId,
      parentId,
      likes: 0,
      liked: false,
      replies: [],
      _optimistic: true,
    }

    // Immediately insert at the top.
    setComments(previous => [
      optimisticComment,
      ...previous.filter(comment => comment.id !== tempId),
    ])

    // Scroll only because the emoji was tapped.
    scrollToTopOnSend()

    try {
      const response = await fetch(
        `/api/movies/${encodeURIComponent(movieId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: emoji,
            parentId,
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to send comment")

      const payload = await response.json()
      const saved = payload.comment ?? payload
      const realId = String(saved.id ?? saved._id ?? tempId)

      setComments(previous => {
        const withoutDuplicate = previous.filter(
          comment =>
            comment.id !== tempId &&
            String(comment.id ?? comment._id) !== realId
        )

        // Replies belong to their parent, not the top-level list.
        if (parentId) {
          const attachReply = (items: any[]): any[] =>
            items.map(item => {
              if (String(item.id ?? item._id) === String(parentId)) {
                const replies = Array.isArray(item.replies)
                  ? item.replies
                  : []

                return {
                  ...item,
                 replies: [
  { ...optimisticComment, ...saved, id: realId },
  ...replies.filter((existingReply: any) =>
    String(existingReply.id ?? existingReply._id) !== realId
  ),
],

                }
              }

              if (Array.isArray(item.replies)) {
                return { ...item, replies: attachReply(item.replies) }
              }

              return item
            })

          return attachReply(withoutDuplicate)
        }

        // A new top-level comment always goes first.
        return [
          { ...optimisticComment, ...saved, id: realId },
          ...withoutDuplicate,
        ]
      })

      onCountChange?.(1)

      if (replyTo) setReplyTo(null)

      // No effect-based auto-scroll. Only the send action scrolls.
      scrollToTopOnSend()
    } catch {
      setComments(previous =>
        previous.filter(comment => comment.id !== tempId)
      )

      setText(previous => (previous ? `${previous} ${emoji}` : emoji))
      inputRef.current?.focus()
      showToast("Comment failed to send. Please try again.")
    } finally {
      sendingRef.current = false
    }
  }

  const pack = movie ? getEmojisForMovie(movie) : null

  return (
    <div className="reels-c-body">
      <div
        ref={listRef}
        className="reels-c-list"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <RenderCommentList
          comments={comments}
          onReply={(comment: any) => {
            setReplyTo(comment)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          onDelete={handleDelete}
          onShare={showToast}
        />
      </div>

      <div className="reels-c-input-bar">
        {replyTo && (
          <div className="reels-c-replying-to">
            <span>
              Replying to <b>{replyTo.username}</b>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {pack && (
          <div className="emoji-factory-bar-in-input">
            <div className="emoji-factory-scroll">
              {pack.emojis.map((emojiSet: string, index: number) => (
                <button
                  key={`factory-${index}`}
                  type="button"
                  className="emoji-factory-chip-instant"
                  onClick={() => void handleFactoryInstantPost(emojiSet)}
                  disabled={sendingRef.current}
                >
                  {emojiSet}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="reels-c-input-wrap">
          <input
            ref={inputRef}
            value={text}
            onChange={event => setText(event.target.value)}
            onKeyDown={event => {
              if (
                event.key === "Enter" &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                void handleSendWrapper()
              }
            }}
            placeholder={
              replyTo
                ? `Reply to ${replyTo.username}...`
                : "Add a comment..."
            }
          />

          <button
            onClick={() => void handleSendWrapper()}
            disabled={!text.trim()}
            type="button"
          >
            <SendIcon size={22} />
          </button>
        </div>
      </div>

      {toast && <div className="reels-c-toast">{toast}</div>}
    </div>
  )
}

export const ReelsCommentBodyFull = ReelsCommentBody
export default ReelsCommentBody

