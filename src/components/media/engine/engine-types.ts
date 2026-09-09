// src/components/media/engine/engine-types.ts
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export type SkinKind = 'standard' | 'vertical' | 'mini' | 'living-room'

export type MediaSource = {
  id: string
  src: string
  title?: string
  poster?: string
  duration?: number
  // for reels feed
  author?: string
  authorAvatar?: string
}

export type EngineState = {
  current: MediaSource | null
  queue: MediaSource[]
  playback: PlaybackState
  isMuted: boolean
  volume: number // 0-1
  currentTime: number
  duration: number
  isMini: boolean
  activeSkin: SkinKind
  isFullscreen: boolean
  // for living-room tv navigation
  isTvMode: boolean
}

export type EngineActions = {
  play: (source?: MediaSource) => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  setQueue: (items: MediaSource[], startIndex?: number) => void
  playNext: () => void
  playPrev: () => void
  enterMini: () => void
  exitMini: () => void
  setSkin: (skin: SkinKind) => void
  setTvMode: (enabled: boolean) => void
  reset: () => void
}

export type EngineContextValue = EngineState & EngineActions & {
  videoRef: React.RefObject<HTMLVideoElement>
}
