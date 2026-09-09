'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import "./reels.css"

export function ReelsShell({ children, onClose }: { children: React.ReactNode, onClose?: () => void }) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  return (
    <div className="reel-root">
      <div className="reel-top-bar">
        <button className="reel-close-v" onClick={onClose} aria-label="Close preview">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <button className="reel-search" onClick={()=> router.push("/search")} aria-label="Search">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6" /><path d="M21 21l-3.8-3.8" /></svg>
        </button>
      </div>
      {children}
      <div className="reel-comment-bar" style={{ background:"hsl(var(--surface))", borderTop:"1px solid hsl(var(--border))"}}>
        <input type="text" inputMode="text" placeholder="Add a comment..." value={comment} onChange={(e)=> setComment(e.target.value)} className="reel-comment-input" style={{ background:"hsl(var(--bg))", color:"hsl(var(--text))", border:"1px solid hsl(var(--border))"}}/>
        <button className="reel-comment-send" style={{ color:"hsl(var(--primary))"}} onClick={()=>{ if(comment.trim()){ console.log(comment); setComment("")}}}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  )
}
