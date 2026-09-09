export type ReelMovie = {
  id: string | number
  title: string
  description?: string
  genre?: string
  vj?: string
  preview_urls?: string[]
  preview_url?: string
  video_url?: string
  cover_url?: string
}

export type ReelsFeedProps = {
  movies: ReelMovie[]
  startIndex?: number
  currentMovie?: ReelMovie
  onClose?: () => void
}

export type ReelItem = ReelMovie & { src: string }
