
"use client";

import React, { useCallback, useEffect, useRef } from "react";

export default function Reverse10Icon() {
  const arrowRef = useRef<SVGGElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const rotatingRef = useRef(false);

  const handleClick = useCallback(() => {
    if (rotatingRef.current) return;

    const arrow = arrowRef.current;
    if (!arrow) return;

    rotatingRef.current = true;

    const duration = 600;
    const pivotX = 50;
    const pivotY = 55;
    const startTime = performance.now();

    const spin = (now: number) => {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const angle = -360 * progress;

      arrow.setAttribute(
        "transform",
        `rotate(${angle} ${pivotX} ${pivotY})`
      );

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(spin);
      } else {
        arrow.removeAttribute("transform");
        frameRef.current = null;
        rotatingRef.current = false;
      }
    };

    frameRef.current = requestAnimationFrame(spin);
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent<SVGSVGElement>
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!event.repeat) {
        handleClick();
      }
    }
  };

  return (
    <svg
      className="replay-icon"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={80}
      height={80}
      aria-label="Reverse 10 seconds"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        outline: "none",
      }}
    >
      {/* Rotating arrow */}
      <g ref={arrowRef} className="replay-arrow">
        <path
          d="M27 28
             C18 35 13 45 13 56
             C13 76 29 91 49 91
             C70 91 86 76 86 55
             C86 37 73 22 55 19"
          stroke="#fff"
          strokeWidth={8}
          strokeLinecap="round"
        />

        <path
          d="M58 8
             L58 28
             L37 18
             Z"
          fill="#fff"
        />
      </g>

      {/* Stationary number */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={29}
        fontWeight={700}
        pointerEvents="none"
      >
        10
      </text>
    </svg>
  );
}
