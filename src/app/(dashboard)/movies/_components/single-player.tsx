 "use client"
import { createContext, useContext, useRef, useState, useEffect } from "react"

const ctx = createContext<any>({
  videoref: { current: null },
  current: null,
  playmovie: () => {},
  isplaying: false,
  setisplaying: () => {},
  progress: 0,
  setprogress: () => {}
})

export function singleplayerprovider({ children }: any){
  const videoref = useRef<HTMLVideoElement>(null)
  const [current, setcurrent] = useState<any>(null)
  const [isplaying, setisplaying] = useState(false)
  const [progress, setprogress] = useState(0)

  const playmovie = (m:any) => {
    if(!m) return
    if(videoref.current) videoref.current.pause()
    setcurrent(m)
  }

  useEffect(()=>{
    if(!current ||!videoref.current) return
    const v = videoref.current
    v.src = current.video_url
    v.poster = current.cover_url || ""
    v.load()
    v.play().then(()=> setisplaying(true)).catch(()=>{})
  },[current])

  return (
    <ctx.Provider value={{ videoref, current, setcurrent, playmovie, isplaying, setisplaying, progress, setprogress }}>
      {children}
    </ctx.Provider>
  )
}

export const usesingleplayer = () => {
  const c = useContext(ctx)
  // never crash - return fallback if provider missing
  return c || {
    videoref: { current: null },
    current: null,
    playmovie: (m:any)=> console.warn("singleplayerprovider missing"),
    isplaying: false,
    setisplaying: ()=>{},
    progress: 0,
    setprogress: ()=>{}
  }
}
