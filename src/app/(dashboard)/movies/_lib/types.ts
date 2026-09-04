export type Movie = {
  id: number
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
}

export type UserList = {
  id: string
  name: string
  movieIds: number[]
}

export type Section = {
  id: string
  title: string
  data: Movie[]
  hidden?: boolean
}
