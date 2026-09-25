"use client";
import { useRef, useState } from "react";

export default function CastSwipeClose({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const startY = useRef(0);
  const drag = useRef(0);
  const [offset, setOffset] = useState(0);

  if (!isOpen) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      drag.current = dy;
      setOffset(dy);
    }
  };

  const onTouchEnd = () => {
    if (drag.current > 90) {
      onClose();
    }
    setOffset(0);
    drag.current = 0;
  };

  return (
    <div className="reels-backdrop cast-backdrop" onClick={onClose}>
      <div
        className="reels-sheet cast-sheet"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: offset? `translateY(${offset}px)` : undefined,
          transition: offset? "none" : "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          willChange: "transform",
        }}
      >
        <div className="reels-handle" style={{ touchAction: "none" }} />
        {children}
      </div>
    </div>
  );
}
