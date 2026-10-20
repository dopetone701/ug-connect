"use client"
import CommentItem from "./main-comment"

export function RenderCommentList({ comments, onReply, onDelete, onShare }: { comments: any[], onReply: any, onDelete: any, onShare: any }) {
  if (comments.length === 0) {
    return <div className="reels-c-empty"><div>💬</div><div>No comments yet</div><div>Be the first!</div></div>
  }
  return (
    <>
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onReply={onReply} onDelete={onDelete} onShare={onShare} />
      ))}
    </>
  )
}

