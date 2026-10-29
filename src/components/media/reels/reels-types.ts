export type ReelMovie = {
  id: string | number
  title: string
  description?: string
  genre?: string
  vj?: string
  main_url?: string
  video_url?: string
  cover_url?: string
  cover?: string
  preview_urls?: string[] | string
  preview_url?: string
  trailer_url?: string
  video_preview_url?: string
  seasons?: {
    name?: string
    episodes?: {
      title?: string
      main_url?: string
      video_url?: string
      preview_url?: string
      previewUrl?: string
      cover_url?: string
    }[]
  }[] | string
}

export type ReelsFeedProps = {
  movies?: ReelMovie[]
  startIndex?: number
  currentMovie?: ReelMovie
  onClose?: () => void
}

export type ReelItem = ReelMovie & { src: string }
