"use client"
import { createContext, useRef, useState, useCallback, useEffect } from "react"
export const EngineContext = createContext<any>(null)

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const [current, setCurrent] = useState<any>(null)
  const [playback, setPlayback] = useState('paused')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeSkin, setActiveSkin] = useState('standard')
  const [isMini, setIsMini] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrentTime(v.currentTime)
    const onMeta = () => setDuration(v.duration || 0)
    const onPlay = () => setPlayback('playing')
    const onPause = () => setPlayback('paused')
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  const play = useCallback(async (item: any) => {
    if (!item?.src) return
    setCurrent((prev: any) => {
      if (prev?.id === item.id && prev?.src === item.src) return prev
      return item
    })

    const v = videoRef.current
    if (!v) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const src = item.src
    const isHls = src.includes('.m3u8')

    try {
      if (isHls) {
        if (v.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari
          v.src = src
          v.load()
          await v.play()
        } else {
          // Chrome/PC + Android - needs hls.js
          const mod = await import('hls.js')
          const Hls = mod.default
          if (Hls.isSupported()) {
            const hls = new Hls()
            hlsRef.current = hls
            hls.loadSource(src)
            hls.attachMedia(v)
            hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(()=>{}))
          } else {
            v.src = src
            v.load()
            await v.play()
          }
        }
      } else {
        // your normal MP4 full movie - RESTORED WORKING LOGIC
        if (!v.src.includes(src)) {
          v.src = src
          v.load()
        }
        if (item.poster) v.poster = item.poster
        await v.play()
      }
    } catch (e) {
      console.error('play failed', e)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play().catch(()=>{}) : v.pause()
  }, [])

  const seek = useCallback((t: number) => { if (videoRef.current) videoRef.current.currentTime = t }, [])

  return (
    <EngineContext.Provider value={{ videoRef, current, activeSkin, setSkin: setActiveSkin, isMini, setIsMini, exitMini: () => setIsMini(false), playback, currentTime, duration, play, togglePlay, seek }}>
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 0 }}>
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          style={{ width: '100%', height: '100%', objectFit: activeSkin === 'vertical' ? 'cover' : 'contain', background: '#000' }}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </EngineContext.Provider>
  )
}
