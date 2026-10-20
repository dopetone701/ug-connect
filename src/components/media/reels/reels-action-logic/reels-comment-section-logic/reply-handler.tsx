"use client"
import { useState } from "react"
export function useReplyHandler(replies: any[] = []) {
  const REPLIES_PER_PAGE = 4
  const [showReplies, setShowReplies] = useState(true)
  const [visibleReplyCount, setVisibleReplyCount] = useState(REPLIES_PER_PAGE)
  const visibleReplies = replies.slice(0, visibleReplyCount)
  const remainingReplies = Math.max(0, replies.length - visibleReplyCount)
  const loadMore = () => setVisibleReplyCount((c) => Math.min(c + REPLIES_PER_PAGE, replies.length))
  return { showReplies, setShowReplies, visibleReplies, remainingReplies, loadMore, REPLIES_PER_PAGE }
}

