"use client"
import { useEffect, useState, useRef } from "react"

export default function IntroVideo({ onFinished }: { onFinished?: () => void }) {
  const [out, setOut] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  const finish = () => {
    if (sessionStorage.getItem("ug-intro-seen")) return
    if ("vibrate" in navigator) navigator.vibrate([80,40,120])
    sessionStorage.setItem("ug-intro-seen", "1")
    setOut(true)
    setTimeout(() => onFinished?.(), 500)
  }

  useEffect(() => {
    ref.current?.play().catch(()=>{})
  }, [])

  return (
    <div className={`intro-overlay ${out?"out":""}`} onClick={finish}>
      <video
        ref={ref}
        src="/intro-video/intro.mp4"
        poster="/intro-video/intro.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        className="intro-video"
      />
      <style>{`
       .intro-overlay{position:fixed;inset:0;z-index:999999999;background:#000;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease}
       .intro-overlay.out{opacity:0;pointer-events:none}
       .intro-video{width:100vw;height:100vh;object-fit:cover;background:#000 url('/intro-video/intro.jpg') center/cover no-repeat}
      `}</style>
    </div>
  )
}
