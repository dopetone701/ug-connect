"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./bottom-sheet.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomSheet({ isOpen, onClose, children }: Props) {
  const startY = useRef(0);
  const drag = useRef(0);
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else if (shouldRender) {
      setIsClosing(true);
      const t = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        setOffset(0);
      }, 320);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, shouldRender]);

  if (!mounted ||!shouldRender) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 280);
  };

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
      triggerClose();
    } else {
      setOffset(0);
    }
    drag.current = 0;
  };

  return createPortal(
    <div className={`bs-backdrop ${isClosing? "is-closing" : "is-opening"}`} onClick={triggerClose}>
      <div
        className={`bs-sheet ${isClosing? "is-closing" : "is-opening"}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: offset? `translateY(${offset}px)` : undefined,
          transition: offset? "none" : undefined,
        }}
      >
        <div className="bs-handle" />
        <div className="bs-content">{children}</div>
      </div>
    </div>,
    document.body
  );
}
