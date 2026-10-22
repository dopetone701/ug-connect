"use client";

import { useEngine } from "@/components/media/engine/use-engine";
import { useEffect, useRef, useState, useCallback } from "react";

export function ReelsProgressBar({ movieId }: { movieId: string }) {
  const { videoRef } = useEngine() as any;
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const v = videoRef?.current as HTMLVideoElement;
    if (!v || !Number.isFinite(v.duration) || v.duration === 0) return;
    if (!dragging) {
      setProgress((v.currentTime / v.duration) * 100);
      setDuration(v.duration);
    }
  }, [videoRef, dragging]);

  useEffect(() => {
    const v = videoRef?.current as HTMLVideoElement;
    if (!v) return;
    const onTime = () => update();
    const onLoaded = () => { if (Number.isFinite(v.duration)) setDuration(v.duration); update(); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    const i = setInterval(onTime, 80);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      clearInterval(i);
    };
  }, [videoRef, movieId, update]);

  const seekTo = (clientX: number) => {
    const v = videoRef?.current as HTMLVideoElement;
    const bar = barRef.current;
    if (!v || !bar || !Number.isFinite(v.duration)) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const pct = x / rect.width;
    v.currentTime = pct * v.duration;
    setProgress(pct * 100);
  };

  const block = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // @ts-ignore
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation?.();
  };

  if (!duration || duration < 0.5) return null;

  return (
    <div
      onClick={block}
      onPointerDown={block}
      onPointerUp={block}
      style={{ width: '100%', touchAction: 'none', pointerEvents: 'auto', position: 'relative', zIndex: 9999, isolation: 'isolate' }}
    >
      <div
        ref={barRef}
        onClick={(e) => { block(e); seekTo(e.clientX); }}
        onPointerDown={(e) => { block(e); setDragging(true); (e.currentTarget as any).setPointerCapture?.(e.pointerId); seekTo(e.clientX); }}
        onPointerMove={(e) => { if (!dragging) return; block(e); seekTo(e.clientX); }}
        onPointerUp={(e) => { block(e); setDragging(false); try { (e.currentTarget as any).releasePointerCapture?.(e.pointerId); } catch {} }}
        style={{
          position: 'relative',
                   height: '5px',
          background: 'rgba(255,255,255,0.32)',

          borderRadius: '999px',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: '#FF0000',
            borderRadius: '999px',
            pointerEvents: 'none',
          }}
        />
        {/* invisible bigger hit area */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: -10, bottom: -10 }} />
      </div>
    </div>
  );
}
