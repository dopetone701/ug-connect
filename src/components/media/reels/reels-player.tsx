'use client'
import { useEngine } from '@/components/media/engine/use-engine'

export function ReelsPlayer({ previewUrl, currentId, playing, showPlay, onToggle }: any) {
  const { videoRef } = useEngine() as any

  return (
    <>
      <video
        ref={videoRef}
        key={`preview-${currentId}`}
        src={previewUrl || undefined}
        className="reel-video"
        autoPlay
        loop
        playsInline
        controls={false}
        preload="auto"
        onClick={onToggle}
      />
      <div className="reel-gradient" />
      {showPlay && (
        <div className="apple-play-pure">
          {!playing? (
            <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
              <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="72" height="72" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          )}
        </div>
      )}
    </>
  )
}
