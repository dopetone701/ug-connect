"use client"
import "./reels-comment-body.css"
import { useState, useRef, useEffect } from "react"
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
  const deletedIdsRef = useRef<Set<string>>(new Set())

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000) }
  const { load, processQueue } = useCommentLoader(movieId, deletedIdsRef, setComments, onCountChange)
  const { send } = useSendComment({ movieId, setComments, replyTo, setReplyTo, text, setText, load })
  const { handleDelete } = useDeleteComment({ movieId, deletedIdsRef, setComments, onCountChange, showToast })

  useEffect(() => {
    deletedIdsRef.current.clear(); load(); processQueue()
    const i = setInterval(processQueue, 5000)
    return () => clearInterval(i)
  }, [movieId, load, processQueue])

  // INSTANT POST - CLICK BUNDLE = POST INSTANTLY
  const handleFactoryInstantPost = async (emoji: string) => {
    // Optimistic - add instantly to UI
    const tempId = `temp-${Date.now()}`
    const optimisticComment = {
      id: tempId,
      text: emoji,
      username: "You",
      userId: "me",
      createdAt: new Date().toISOString(),
      replyTo: replyTo?.id || null,
      likes: 0,
      liked: false,
    }

    setComments(prev => replyTo ? prev : [optimisticComment, ...prev])

    try {
      // Send via your existing send logic but with emoji directly
      const res = await fetch(`/api/movies/${movieId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: emoji,
          parentId: replyTo?.id || null,
        })
      })
      
      if (!res.ok) throw new Error("Failed")
      
      const saved = await res.json()
      
      // Replace temp with real
      setComments(prev => prev.map(c => c.id === tempId ? { ...saved, ...saved.comment || saved } : c))
      onCountChange?.(1)
      
      // Clear reply after posting
      if (replyTo) setReplyTo(null)
      
    } catch (e) {
      // Remove optimistic on fail and fallback to text insert
      setComments(prev => prev.filter(c => c.id !== tempId))
      setText((prev) => (prev ? `${prev} ${emoji}` : emoji))
      inputRef.current?.focus()
    }
  }

  // Get genre emojis
  const pack = movie ? getEmojisForMovie(movie) : null

  return (
    <div className="reels-c-body">
      <div className="reels-c-list">
        <RenderCommentList comments={comments} onReply={(cm: any) => { setReplyTo(cm); setTimeout(() => inputRef.current?.focus(), 100) }} onDelete={handleDelete} onShare={showToast} />
      </div>

      <div className="reels-c-input-bar">
        {replyTo && <div className="reels-c-replying-to"><span>Replying to <b>{replyTo.username}</b></span><button onClick={() => setReplyTo(null)} type="button">×</button></div>}
        
        {/* EMOJI BUNDLE - INSIDE INPUT AREA - CLICK = INSTANT POST */}
        {pack && (
          <div className="emoji-factory-bar-in-input">
            <div className="emoji-factory-scroll">
              {pack.emojis.map((emojiSet, idx) => (
                <button
                  key={`factory-${idx}`}
                  type="button"
                  className="emoji-factory-chip-instant"
                  onClick={() => handleFactoryInstantPost(emojiSet)}
                >
                  {emojiSet}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="reels-c-input-wrap">
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Add a comment..."} />
          <button onClick={send} disabled={!text.trim()} type="button"><SendIcon size={22} /></button>
        </div>
      </div>
      {toast && <div className="reels-c-toast">{toast}</div>}
    </div>
  )
}

export const ReelsCommentBodyFull = ReelsCommentBody
export default ReelsCommentBody

