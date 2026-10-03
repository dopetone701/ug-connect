"use client"
import { useEffect, useState, useMemo } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import "./favorites-sheet.css"
import "./subscriptions-sheet.css"
import MovieRow from "@/app/(dashboard)/movies/_components/movie-row"

const MOVIE_API = "https://movie-server-api.connectu89.workers.dev/api/movies"

const normalize = (x: any) => {
  const preview = x.preview_urls?.[0] || x.preview_url || x.trailer_url || x.video_preview_url || x.preview
  return {
   ...x,
    id: String(x.id),
    cover: x.cover || x.cover_url,
    cover_url: x.cover || x.cover_url,
    video: x.video || x.video_url,
    video_url: x.video || x.video_url,
    preview_url: preview,
    preview_urls: x.preview_urls || (preview? [preview] : []),
    trailer_url: x.trailer_url || preview,
  }
}

export default function DownloadsSheet(){
  const { lists = [], hydrated, _hydrate } = useMovieStore() as any
  const [allMovies, setAllMovies] = useState<any[]>([])
  const [isProPlus, setIsProPlus] = useState(false)

  useEffect(()=>{ if(!hydrated) _hydrate?.() }, [hydrated, _hydrate])

  // CHECK SUBSCRIPTION FIRST - like you asked
  useEffect(()=>{
    try{
      const sub = localStorage.getItem("ug_subscription") // you will set "pro_plus" when user pays
      const pro = localStorage.getItem("ug_pro_plus") // fallback
      if(sub === "pro_plus" || sub === "plus" || pro === "true"){
        setIsProPlus(true)
      }
    }catch{}
  },[])

  useEffect(()=>{
    try{
      const c = localStorage.getItem("ug-all-movies")
      if(c){ const p=JSON.parse(c); if(Array.isArray(p)&&p.length){ setAllMovies(p.map(normalize)); return } }
    }catch{}
    fetch(MOVIE_API, { cache:"no-store" }).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || []
      if(Array.isArray(list) && list.length){
        const norm = list.map(normalize)
        setAllMovies(norm)
        try{ localStorage.setItem("ug-all-movies", JSON.stringify(norm)) }catch{}
      }
    }).catch(()=>{})
  },[])

  const byId = useMemo(()=>{
    const m = new Map()
    allMovies.forEach((x:any)=>{ if(x?.id!=null){ m.set(String(x.id), x) } })
    return m
  },[allMovies])

  const getMovies = (ids:any[]) => {
    if(!Array.isArray(ids) ||!ids.length) return []
    return ids.map((id:any)=> byId.get(String(id)) || allMovies.find((a:any)=> String(a?.id)===String(id))).filter(Boolean)
  }

  // downloads list - for now using download list from store, or localStorage "ug_downloads"
  const downloadsList = lists?.find((l:any)=> l.id==="downloads" || l.id==="downloaded")
  const localDownloads = useMemo(()=>{
    try{ const raw = localStorage.getItem("ug_downloads"); if(raw) return JSON.parse(raw) }catch{}
    return []
  },[])

  const downloadedMovies = downloadsList?.movieIds?.length
   ? getMovies(downloadsList.movieIds)
    : getMovies(localDownloads)

  // STOP swipe bubbling same as favorites
  const stop = (e:any) => e.stopPropagation()

  if(!hydrated) return <div className="vault-empty">Loading...</div>

  // SALES GATE - if not PRO PLUS
  if(!isProPlus){
    return (
      <div className="vault-root" onTouchStart={stop}>
        <div className="sub-card plus" style={{width:"100%", margin:0}}>
          <div className="sub-badge gold">OFFLINE ACCESS</div>
          <h1 className="sub-title">DOWN<span style={{color:"hsl(var(--primary))"}}>LOADS</span></h1>
          <p className="sub-desc" style={{fontSize:"12px"}}>
            <b style={{color:"hsl(var(--text))"}}>Subscribe to PRO PLUS to download & watch offline.</b> No buffering, no data needed.
            Save movies with your favourite VJ voice and watch anytime - in taxi, village, or flight.
          </p>
          <div className="sub-feat"><span className="check">✓</span> Watch Without Internet</div>
          <div className="sub-feat"><span className="check">✓</span> Save Data - One Download Forever</div>
          <div className="sub-feat"><span className="check">✓</span> Auto VJ Translations Included</div>
          <button className="sub-now gold" style={{marginTop:"10px"}} onClick={()=> window.location.href="#"}>Get PRO PLUS - Download Now</button>
          <div style={{textAlign:"center", fontSize:"10px", color:"hsl(var(--text-muted))", marginTop:"6px"}}>🔒 No downloads yet - your offline vault is empty</div>
        </div>
      </div>
    )
  }

  // PRO PLUS USER - render exactly like Library
  if(downloadedMovies.length === 0){
    return (
      <div className="vault-root" onTouchStart={stop}>
        <div className="vault-empty">
          <div style={{fontSize:"28px", marginBottom:"8px"}}>↓</div>
          <b>No downloads yet</b>
          <p style={{fontSize:"11px", color:"hsl(var(--text-muted))", marginTop:"4px"}}>
            Tap <b>Download</b> on any movie to save it here for offline. Your downloaded VJ movies will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="vault-root" onTouchStart={stop}>
      <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}>
        <MovieRow title="Downloaded for Offline" movies={downloadedMovies} />
      </div>
    </div>
  )
}
