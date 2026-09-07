"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "./mobile-preview.css"
import { usesingleplayer } from "../../_components/single-player"

export default function MobilePreview({ movies, startIndex, currentMovie, onClose }: any){
  const router = useRouter()
  const [index, setIndex] = useState(startIndex || 0)
  const [dragY, setDragY] = useState(0)
  const [comment, setComment] = useState("")
  const [playing, setPlaying] = useState(true)
  const [showPlay, setShowPlay] = useState(false)
  const { videoref, current: playercurrent, playmovie, setplayermode, setisplaying } = usesingleplayer()

  const list = movies?.length? movies : [currentMovie]
  const current = list[index] || currentMovie

  // load current into single truth video
  useEffect(()=>{
    if(current){
      playmovie(current, 'preview')
    }
  },[index])

  useEffect(()=>{
    if(videoref.current){
      videoref.current.volume = 1
      videoref.current.muted = false
      videoref.current.play().then(()=> setPlaying(true)).catch(()=>{
        if(videoref.current){
          videoref.current.muted = false
          videoref.current.play().catch(()=>{})
        }
      })
    }
  },[index, current?.id])

  const togglePlay = () => {
    if(!videoref.current) return
    if(playing){ videoref.current.pause(); setPlaying(false); setisplaying(false) }
    else { videoref.current.play(); setPlaying(true); setisplaying(true) }
    setShowPlay(true)
    setTimeout(()=> setShowPlay(false), 800)
  }

  const nextReel = () => {
    if(index < list.length-1){
      const n = index+1
      // disarm current and load clicked
      playmovie(list[n], 'preview')
      setIndex(n)
      router.replace(`/movies/watch/${list[n].id}?t=preview`)
    }
  }
  const prevReel = () => {
    if(index > 0){
      const p = index-1
      playmovie(list[p], 'preview')
      setIndex(p)
      router.replace(`/movies/watch/${list[p].id}?t=preview`)
    }
  }

  const handlewatchfull = () => {
    // delete reel from dom + disarm + load full
    if(videoref.current){
      videoref.current.pause()
    }
    onClose() // deletes reel from dom
    playmovie(current, 'full')
    router.push(`/movies/watch/${current.id}?t=full`)
  }

  if(!current) return null

  return (
    <div className="reel-root">
      <div className="reel-top-bar">
        <button className="reel-close-v" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <button className="reel-search" onClick={()=> router.push('/search')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M21 21l-3.8-3.8"/></svg>
        </button>
      </div>

      <div
        className="reel-swiper"
        onTouchStart={(e:any)=> (e.currentTarget as any)._y = e.touches[0].clientY}
        onTouchMove={(e:any)=> {
          const diff = e.touches[0].clientY - (e.currentTarget as any)._y
          setDragY(diff)
        }}
        onTouchEnd={()=>{
          if(dragY < -60) nextReel()
          if(dragY > 60) prevReel()
          setDragY(0)
        }}
        style={{ transform:`translateY(${dragY}px)` }}
      >
        <video
          ref={videoref}
          key={current.id}
          src={current.preview_urls?.[0] || current.video_url}
          className="reel-video"
          autoPlay
          loop
          playsInline
          controls={false}
          preload="auto"
          onClick={togglePlay}
        />
        <div className="reel-gradient" />

        {showPlay && (
          <div className="apple-play-pure">
            {!playing? (
              <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,.6))"}}>
                <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,.6))"}}>
                <rect x="7" y="5" width="3.5" height="14" rx="1"/>
                <rect x="13.5" y="5" width="3.5" height="14" rx="1"/>
              </svg>
            )}
          </div>
        )}

        <div className="reel-actions">
          <button className="ra-btn">
            <span className="ra-icon-bg"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg></span>
            <span className="ra-label">Like</span>
          </button>
          <button className="ra-btn">
            <span className="ra-icon-bg"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19.5 10.5c0 4.7-3.4 8-8 8-1.4 0-2.7-.3-3.8-.9L4 19l1.1-3.4c-.7-1.1-1.1-2.4-1.1-3.8 0-4.7 3.4-8 8-8s7.5 3.3 7.5 7.7z" /><path d="M8.5 11.8h.01M12 11.8h.01M15.5 11.8h.01" strokeWidth="2.4" /></svg></span>
            <span className="ra-label">2.4k</span>
          </button>
          <button className="ra-btn">
            <span className="ra-icon-bg"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V3" /><path d="M7 8l5-5 5 5" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></svg></span>
            <span className="ra-label">Share</span>
          </button>
          <button className="ra-btn">
            <span className="ra-icon-bg"><svg viewBox="0 0 24 24" width="22" height="22" fill="hsl(var(--text))"><circle cx="12" cy="12" r="1.8"/><circle cx="19.5" cy="12" r="1.8"/><circle cx="4.5" cy="12" r="1.8"/></svg></span>
          </button>
        </div>

        <div className="reel-info">
          <h3>{current.title}</h3>
          <p className="reel-desc">{current.description?.slice(0,110)}...</p>
          <div className="reel-pills">
            <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))" }}>{current.genre}</span>
            <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))" }}>{current.vj}</span>
          </div>
          <button className="reel-watch-full" style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-text))" }} onClick={handlewatchfull}>▶ Watch Full Movie</button>
        </div>
      </div>

      <div className="reel-comment-bar" style={{ background:"hsl(var(--surface))", borderTop:"1px solid hsl(var(--border))" }}>
        <input type="text" inputMode="text" placeholder="Add a comment..." value={comment} onChange={(e)=> setComment(e.target.value)} className="reel-comment-input" style={{ background:"hsl(var(--bg))", color:"hsl(var(--text))", border:"1px solid hsl(var(--border))" }} />
        <button className="reel-comment-send" style={{ color:"hsl(var(--primary))" }} onClick={()=> { if(comment.trim()){ console.log(comment); setComment("") } }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}
