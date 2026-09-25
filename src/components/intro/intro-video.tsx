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
    // SURGICAL FIX: never show on PC
    if (window.innerWidth > 768) {
      setIsPc(true)
      onFinished?.()
      return
    }
    ref.current?.play().catch(()=>{})
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
         height:100vh;
         height:100dvh;
         height:100svh;
         min-height:-webkit-fill-available;
         z-index:2147483647;
         background:#000;
         display:flex;
         align-items:center;
         justify-content:center;
         padding-top:env(safe-area-inset-top);
         padding-bottom:env(safe-area-inset-bottom);
         padding-left:env(safe-area-inset-left);
         padding-right:env(safe-area-inset-right);
         transition:opacity .6s cubic-bezier(.4,0,.2,1);
       }
       .intro-overlay.out{opacity:0;pointer-events:none}
       .intro-overlay video{
         position:absolute;
         inset:0;
         width:100%;
         height:100%;
         width:100vw;
         height:100dvh;
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
