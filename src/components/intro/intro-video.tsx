"use client"
import { useEffect, useState, useRef } from "react"

export default function IntroVideo({ onFinished }: { onFinished?: () => void }) {
  const [out, setOut] = useState(false)
  const [isPc, setIsPc] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  const finish = () => {
    if (sessionStorage.getItem("ug-intro-seen")) return
    if ("vibrate" in navigator) navigator.vibrate([80,40,120])
    sessionStorage.setItem("ug-intro-seen", "1")
    setOut(true)
    setTimeout(() => onFinished?.(), 600)
  }

  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsPc(true)
      onFinished?.()
      return
    }

    // ✅ THE TRANSLUCENT TRICK: swap meta tags ONLY while intro is playing
    const themeMeta = document.querySelector('meta[name="theme-color"]')
    const oldTheme = themeMeta?.getAttribute("content")
    themeMeta?.setAttribute("content", "#000000")

    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    const oldApple = appleMeta?.getAttribute("content")
    appleMeta?.setAttribute("content", "black-translucent")

    ref.current?.play().catch(()=>{})

    return () => {
      // ✅ Restore to default when intro is gone
      if (oldTheme) themeMeta?.setAttribute("content", oldTheme)
      if (oldApple) appleMeta?.setAttribute("content", oldApple)
    }
  }, [])

  if (isPc) return null

  return (
    <div className={`intro-overlay ${out?"out":""}`} onClick={finish}>
      <video
        ref={ref}
        src="/intro-video/intro.mp4"
        poster="/intro-video/intro.jpg"
        autoPlay muted playsInline preload="auto"
        onEnded={finish}
        onError={finish}
      />
      <style>{`
       .intro-overlay{
         position:fixed;
         inset:0;
         width:100vw;
         /* ✅ Only this. No calc, no negative top, no lvh */
         height:100dvh;
         z-index:2147483647;
         background:#000;
         overflow:hidden;
         transition:opacity .6s cubic-bezier(.4,0,.2,1);
       }
       .intro-overlay.out{opacity:0;pointer-events:none}
       .intro-overlay video{
         position:absolute;
         inset:0;
         width:100%;
         height:100%;
         object-fit:cover;
         background:#000 url('/intro-video/intro.jpg') center/cover no-repeat;
       }
       @media (min-width:769px){
         .intro-overlay{display:none!important}
       }
      `}</style>
    </div>
  )
}