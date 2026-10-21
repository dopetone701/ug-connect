"use client"
import { SaveMovieItem } from "./dots-body-links-logic/save-movie"
import { ViewVjItem } from "./dots-body-links-logic/view-vj"
import { FullMovieReadyItem } from "./dots-body-links-logic/watch-full-movie"
import { CopyLinkItem } from "./dots-body-links-logic/copy-link"
import { ReportProblemItem } from "./dots-body-links-logic/report-aproblem"
import { HideMovieItem } from "./dots-body-links-logic/hide-movie"
import { AutoScrollItem } from "./dots-body-links-logic/auto-scroll"

type DotsBodyProps = {
  movieId: string
  movie?: any
  onClose?: () => void
}

export function DotsBody({ movieId, movie, onClose }: DotsBodyProps) {
  return (
    <>
      <div className="dots-group">
        <SaveMovieItem movieId={movieId} movie={movie} onClose={onClose} />
        <FullMovieReadyItem movieId={movieId} movie={movie} onClose={onClose} />
        <ViewVjItem movieId={movieId} movie={movie} onClose={onClose} />
        <CopyLinkItem movieId={movieId} movie={movie} onClose={onClose} />
        <ReportProblemItem movieId={movieId} movie={movie} onClose={onClose} />
        <HideMovieItem movieId={movieId} movie={movie} onClose={onClose} />
      </div>
      <AutoScrollItem movieId={movieId} movie={movie} onClose={onClose} />
    </>
  )
}

