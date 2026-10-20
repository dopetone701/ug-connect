"use client"
import { useState, useRef } from "react"
import { briefNumber } from "@/stores/use-brief-numbers"
import HeartIcon from "@/modal-generator/svg-icons/heart-icon"
import { isCommentOwner, timeAgo } from "./comment-helpers"
import { useCommentReaction } from "./reaction-to-comment"
import { useReplyHandler } from "./reply-handler"
import { EmojiPicker } from "./imoji-factory"
import { DotsMenuIcon, DotsDropdown, useClickOutside } from "./dots-menu"
import { TailShareIcon, handleShareCopy } from "./share-comment"

export default function CommentItem({ comment, depth = 0, onReply, onDelete, onShare }: any) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { liked, heartCount, myEmoji, showEmoji, setShowEmoji, toggleLike, reactEmoji } = useCommentReaction(comment)
  const replies = Array.isArray(comment.replies) ? comment.replies : []
  const { showReplies, setShowReplies, visibleReplies, remainingReplies, loadMore } = useReplyHandler(replies)
  useClickOutside(showMenu, menuRef as any, () => setShowMenu(false))
 
  const isSeeding = comment.status === "seeding"
  const isOwn = isCommentOwner(comment)
  const displayName = isOwn ? "You" : (comment.username || "User")
  const avatarSrc = comment.avatarUrl || comment.avatar_url || comment.avatar || ""

  const handleShare = async () => {
    try { await handleShareCopy(comment.text); onShare?.("Comment copied") } catch {}
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!isOwn) return
    setShowMenu(false)
    setIsDeleting(true)
    onDelete?.(comment.id)
  }

  if (isDeleting) return null

  return (
    <div className="reels-c-item" data-depth={depth} style={{ opacity: isSeeding ? 0.7 : 1 }}>
      <div className="reels-c-bubble-wrap">
        <div className="reels-c-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} onError={(e) => { (e.currentTarget as any).style.display = "none" }} />
          ) : (
            displayName?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div className="reels-c-content">
          <div className="reels-c-bubble">
            <span className="reels-c-user">{displayName}{isSeeding && <span> • seeding...</span>}</span>
            <p className="reels-c-text">{comment.text}</p>
            {myEmoji && <span className="reels-c-my-emoji">{myEmoji}</span>}
          </div>
          <div className="reels-c-actions">
            <span className="reels-c-time">{isSeeding ? "seeding..." : timeAgo(comment.created_at)}</span>
            <button onClick={toggleLike} className={`reels-c-like ${liked ? "liked" : ""}`} type="button">
              <HeartIcon size={14} filled={liked} style={{ color: liked ? "#ff3040" : "inherit" } as any} />
              {briefNumber(heartCount)}
            </button>
            {!isSeeding && <button onClick={() => onReply(comment)} className="reels-c-reply-btn" type="button">Reply</button>}
            {!isSeeding && <TailShareIcon size={14} onClick={handleShare} />}
            {!isSeeding && <button onClick={() => setShowEmoji(!showEmoji)} className="reels-c-emoji-trigger" type="button">😊</button>}
            <div ref={menuRef} className="reels-c-dots-wrap">
              <DotsMenuIcon onClick={() => setShowMenu(!showMenu)} />
              {showMenu && <DotsDropdown isOwn={isOwn} liked={liked} onReply={() => { onReply(comment); setShowMenu(false) }} onShare={handleShare} onLike={() => { toggleLike(); setShowMenu(false) }} onDelete={handleDelete} />}
            </div>
          </div>
{showEmoji && <EmojiPicker myEmoji={myEmoji} onReact={reactEmoji} onClose={() => setShowEmoji(false)} />}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="reels-c-thread">
          <button className="reels-c-show-replies" onClick={() => setShowReplies((p: boolean) => !p)} type="button" aria-expanded={showReplies}>{showReplies ? "Hide replies" : "Show replies"}</button>
          {showReplies && (
            <div className="reels-c-replies">
              {visibleReplies.map((reply: any) => (<CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} onDelete={onDelete} onShare={onShare} />))}
              {remainingReplies > 0 && <button type="button" className="reels-c-show-replies" onClick={loadMore}>Show {remainingReplies} more {remainingReplies === 1 ? "reply" : "replies"}</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

