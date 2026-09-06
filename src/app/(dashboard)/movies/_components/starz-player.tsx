"use client"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./starz-player.css"

export default function StarzPlayer({ title, vj, genre, videoUrl, cover, desc }: any) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    let timer: any
    if (playing) {
      timer = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timer)
  }, [playing, showControls])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
    setPlaying(!playing)
  }

  const onTimeUpdate = () => {
    if (!videoRef.current) return
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
  }

  const onSeek = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (videoRef.current) {
      videoRef.current.currentTime = pct * duration
    }
  }

  return (
    <div className="starz-root" onMouseMove={() => setShowControls(true)}>
      {/* Header like StarzPlay */}
      <div className={`starz-header ${showControls ? 'show' : ''}`}>
        <button className="starz-back" onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK
        </button>
        <div className="starz-meta">
          <div className="starz-title">{title}</div>
          <div className="starz-sub">{genre} • {vj}</div>
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={cover}
        className="starz-video"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onClick={togglePlay}
        playsInline
      />

      {/* Center Play like StarzPlay */}
      {!playing && (
        <button className="starz-center-play" onClick={togglePlay}>
          <svg viewBox="0 0 24 24" width="42" height="42"><path d="M8 5.8 L18 12 L8 18.2 Z" fill="white"/></svg>
        </button>
      )}

      {/* Bottom controls - StarzPlay style */}
      <div className={`starz-controls ${showControls ? 'show' : ''}`}>
        <div className="starz-progress-wrap" onClick={onSeek}>
          <div className="starz-progress-bg">
            <div className="starz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="starz-controls-row">
          <div className="left">
            <button onClick={togglePlay} className="c-btn">
              {playing ? 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg> 
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5.8 L18 12 L8 18.2 Z"/></svg>
              }
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e)=> { setVolume(parseFloat(e.target.value)); if(videoRef.current) videoRef.current.volume = parseFloat(e.target.value)}} className="vol"/>
            <span className="time">{Math.floor((progress/100)*duration/60)}:{String(Math.floor((progress/100)*duration%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
          </div>
          <div className="right">
            <button className="c-btn" onClick={()=> videoRef.current?.requestFullscreen()}>⛶</button>
          </div>
        </div>
        <div className="starz-desc">{desc}</div>
      </div>
    </div>
  )
}
