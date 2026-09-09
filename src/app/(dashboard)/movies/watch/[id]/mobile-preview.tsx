'use client'
import { ReelsShell } from '@/components/media/reels/reels-shell'
import { ReelsFeed } from '@/components/media/reels/reels-feed'

export default function MobilePreview(props: any) {
  return (
    <ReelsShell onClose={props.onClose}>
      <ReelsFeed movies={props.movies} startIndex={props.startIndex} currentMovie={props.currentMovie} onClose={props.onClose} />
    </ReelsShell>
  )
}
