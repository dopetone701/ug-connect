"use client"
import { useEffect, useRef } from "react"

export const EMOJIS = [
  "❤️", "😂", "🔥", "😭", "😮", "👏", "😍", "💀",
  "🙏", "😅", "🥺", "🤩", "😎", "🥰", "🤣", "😢",
  "😡", "💯", "✨", "🎉", "👍", "🫶", "😳", "🥹",
  "😴", "🤔", "🫡", "😇", "🥳", "❤️‍🔥", "👌", "🤝"
]

export function EmojiPicker({ 
  myEmoji, 
  onReact,
  onClose
}: { 
  myEmoji: string | null
  onReact: (e: string) => void
  onClose?: () => void 
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outside = (e: any) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose?.()
    }
    document.addEventListener("mousedown", outside)
    document.addEventListener("touchstart", outside)
    return () => {
      document.removeEventListener("mousedown", outside)
      document.removeEventListener("touchstart", outside)
    }
  }, [onClose])

  return (
    <div ref={ref} className="reels-c-emoji-picker">
      {EMOJIS.map((emoji, i) => (
        <button 
          key={`${emoji}-${i}`} 
          onClick={() => { onReact(emoji); onClose?.() }} 
          className={myEmoji === emoji ? "active" : ""} 
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
