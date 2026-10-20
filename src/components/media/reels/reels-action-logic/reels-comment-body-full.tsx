
"use client"
import "./reels-comment-body.css"
import { useState, useRef, useEffect } from "react"
import { useCommentLoader } from "./reels-comment-section-logic/handle-load"
import { useSendComment } from "./reels-comment-section-logic/send-comment"
import { useDeleteComment } from "./reels-comment-section-logic/delete-comment"
import { RenderCommentList } from "./reels-comment-section-logic/render-comment-item"

// HOST ONLY - NO LOGIC INSIDE
export function ReelsCommentBody({ movieId, onCountChange }: { movieId: string, onCountChange?: (count: number) => void }) {
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

  return (
    <div className="reels-c-body">
      <div className="reels-c-list">
        <RenderCommentList comments={comments} onReply={(cm: any) => { setReplyTo(cm); setTimeout(() => inputRef.current?.focus(), 100) }} onDelete={handleDelete} onShare={showToast} />
      </div>
      <div className="reels-c-input-bar">
        {replyTo && <div className="reels-c-replying-to"><span>Replying to <b>{replyTo.username}</b></span><button onClick={() => setReplyTo(null)} type="button">×</button></div>}
        <div className="reels-c-input-wrap">
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Add a comment..."} />
          <button onClick={send} disabled={!text.trim()} type="button">➤</button>
        </div>
      </div>
      {toast && <div className="reels-c-toast">{toast}</div>}
    </div>
  )
}

