'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReelsActions } from "./reels-actions"
import { ReelsModal } from "./reels-modal"
import "./reels.css"

export function ReelsFeed({ movies, startIndex = 0, currentMovie, onClose }: any) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement|null)[]>([])
  const [active, setActive] = useState(startIndex)
  const [playing, setPlaying] = useState(true)
  const [showPlay, setShowPlay] = useState(false)

  const list = movies?.length? movies : [currentMovie]

  // Jump to start
  useEffect(() => {
    const el = containerRef.current?.children[startIndex] as HTMLElement | undefined
    el?.scrollIntoView()
  }, [startIndex])

  // Autoplay only visible video
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          const idx = Number((e.target as HTMLElement).dataset.index)
          const v = videoRefs.current[idx]
          if(!v) return
          if(e.isIntersecting && e.intersectionRatio > 0.75) {
            setActive(idx)
            setPlaying(true)
            videoRefs.current.forEach((other,i)=>{ if(other && i!==idx) try{ other.pause() }catch{} })
            v.play().catch(()=>{})
          } else {
            try{ v.pause() }catch{}
          }
        })
      },
      { threshold: 0.75 }
    )
    const con = containerRef.current
    if(con) Array.from(con.children).forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [list.length])

  const togglePlay = useCallback((idx:number) => {
    const v = videoRefs.current[idx]
    if(!v) return
    if(v.paused){ v.play().then(()=> setPlaying(true)).catch(()=>{}); }
    else { v.pause(); setPlaying(false); }
    setShowPlay(true)
    window.setTimeout(()=> setShowPlay(false), 800)
  }, [])

  const handleWatchFull = useCallback((m:any) => {
    videoRefs.current.forEach(v=>{ try{ v?.pause() }catch{} })
    onClose?.()
    router.push(`/movies/watch/${m.id}?t=full`)
  }, [onClose, router])

  return (
    <div ref={containerRef} className="reels-tiktok-container">
      {list.map((m:any,i:number)=>{
        const previewUrl = m.preview_urls?.[0] || m.preview_url || m.video_url
        return (
          <div key={m.id} data-index={i} className="reels-tiktok-item">
            <video
              ref={el => { videoRefs.current[i] = el }}
              src={previewUrl}
              className="reel-video"
              loop
              playsInline
              preload="auto"
              onClick={()=> togglePlay(i)}
            />
            <div className="reel-gradient" />

            {/* YOUR PLAY/PAUSE SVG BACK */}
            {active === i && showPlay && (
              <div className="apple-play-pure">
                {!playing? (
                  <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                    <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                    <rect x="7" y="5" width="3.5" height="14" rx="1" />
                    <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
                  </svg>
                )}
              </div>
            )}

            <ReelsActions />
            <ReelsModal current={m} onWatchFull={()=> handleWatchFull(m)} />
          </div>
        )
      })}
    </div>
  )
}
