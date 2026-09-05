"use client"
import { useMovieStore } from "../_lib/use-movie-store"
import EmptyListCard from "./empty-list-card"
import "../latest-movies.css"

export default function UserListsRow() {
  const { lists, createList } = useMovieStore()

  const handleCreate = () => {
    const raw = prompt("List name?")
    const name = (raw || `my-list-${lists.length + 1}`).toLowerCase().trim().replace(/\s+/g, "-")
    if(!name) return
    createList(name)
  }

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">my lists</h3>
        <button className="latest-see" onClick={handleCreate}>+ NEW</button>
      </div>
      <div className="latest-track-wrap">
        <div className="latest-track">
          {lists.length === 0 ? (
            <>
              <EmptyListCard onClick={handleCreate} />
              <EmptyListCard onClick={handleCreate} />
              <EmptyListCard onClick={handleCreate} />
            </>
          ) : (
            lists.map(l => (
              <div key={l.id} className="latest-card">
                <div
                  className="l-card-cover"
                  style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    background:"hsl(var(--surface,0 0% 12%) / 1)",
                    borderRadius:10
                  }}
                >
                  <span style={{fontWeight:900, fontSize:13, textTransform:"capitalize"}}>{l.name}</span>
                </div>
                <div className="l-card-title centered">{l.movieIds.length} movies</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
