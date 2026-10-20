"use client"
export function TailShareIcon({ size = 16, onClick }: { size?: number, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="reels-c-tail-share" type="button">
      <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"><path d="M 22 76 C 24 52, 38 34, 62 34 L 62 16 C 62 12, 65 10, 68 12 L 92 46 C 94 48, 94 52, 92 54 L 68 88 C 65 90, 62 88, 62 84 L 62 66 C 42 66, 28 68, 22 76 Z" /></svg>
    </button>
  )
}
export async function handleShareCopy(text: string) { if (navigator.clipboard) await navigator.clipboard.writeText(text) }

