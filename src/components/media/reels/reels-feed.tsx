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
              onClick={e=>{ const v=e.currentTarget; v.paused? v.play().catch(()=>{}): v.pause() }}
            />
            <div className="reel-gradient" />
            <ReelsActions />
            <ReelsModal current={m} onWatchFull={()=> handleWatchFull(m)} />
          </div>
        )
      })}
    </div>
  )
}
