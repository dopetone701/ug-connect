export type Movie = {
  id: any
  title: string
  genre: string
  vj: string
  cover: string
  desc?: string
  video: string
  preview: string[]
  views?: number
  likes?: number
  isEditorsPick?: boolean
  createdAt?: string
  // SURGICAL - from D1/R2 for series
  type?: string
  year?: number
  actors?: string
  seasons?: any[]
}

export type UserList = {
  id: string
  name: string
  movieIds: any[]
}

export type Section = {
  id: string
  title: string
  data: Movie[]
  hidden?: boolean
}
