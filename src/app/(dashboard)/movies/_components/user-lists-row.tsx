"use client"
import { useEffect } from "react"
import { useMovieStore } from "../_lib/use-movie-store"
import "../latest-movies.css"

type Props = {
  movies?: any[] // allMovies from API
}

export default function UserListsRow({ movies = [] }: Props) {
  const { lists, createList } = useMovieStore() as any

  // Ensure ONE default list always exists
  useEffect(() => {
    if (lists.length === 0) {
      createList("my-list")
    }
  }, [lists.length, createList])

  const mainList = lists[0]

  // If no list yet - show placeholder
  if (!mainList) {
    return (
      <div className="latest-root">
        <div className="latest-head">
          <h3 className="latest-title">my list</h3>
        </div>
        <div className="latest-track-wrap">
          <div className="latest-track">
            <div className="latest-card">
              <div className="l-card-cover" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(var(--surface))",borderRadius:6}}>
                <span style={{fontWeight:900,fontSize:13}}>MY LIST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get actual movie objects from IDs
  const myMovies = movies.filter((m: any) => mainList.movieIds?.includes(m.id))

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">my list</h3>
        <span className="latest-see">{mainList.movieIds?.length || 0} movies</span>
      </div>
      <div className="latest-track-wrap">
        <div className="latest-track">
          {myMovies.length === 0? (
            <div className="latest-card">
              <div className="l-card-cover" style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",justifyContent:"center",background:"hsl(var(--surface))",borderRadius:6}}>
                <span style={{fontWeight:900,fontSize:14}}>MY LIST</span>
                <span style={{fontSize:10,opacity:.6}}>EMPTY</span>
              </div>
            </div>
          ) : (
            myMovies.map((movie: any) => (
              <div key={movie.id} className="latest-card">
                <div className="l-card-cover" style={{borderRadius:6}}>
                  <img src={movie.cover} alt={movie.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  <div className="l-card-fade" />
                  <div className="l-card-actions" style={{borderRadius:"0 0 6px 6px"}}>
                    <button className="l-a-btn play on" style={{borderRadius:"0 0 0 6px"}}>PLAY</button>
                    <button className="l-a-btn prev on" style={{borderRadius:"0 0 6px 0"}}>{movie.genre}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
