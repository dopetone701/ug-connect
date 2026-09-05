"use client";

import { useRef, useEffect } from "react";
import "./latest-movies.css";

type Movie = {
  id: number;
  title: string;
  genre: string;
  vj: string;
  cover: string;
  desc: string;
  video: string;
  preview: string[];
};

export default function LatestMovies({
  movies = [],
}: {
  movies?: Movie[];
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    let isDown = false;
    let isHorizontal = false;

    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;

    const DRAG_THRESHOLD = 6;

    /*
     * ---------------------------------------------------------
     * POINTER DOWN
     * ---------------------------------------------------------
     */
    const onPointerDown = (e: PointerEvent) => {
      /*
       * Buttons must behave normally.
       * Don't turn a PLAY / PRE / SEE ALL press into a drag.
       */
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }

      isDown = true;
      isHorizontal = false;

      isDraggingRef.current = false;

      startX = e.clientX;
      startY = e.clientY;

      /*
       * Save the exact scroll position when the finger
       * first touches the carousel.
       */
      startScrollLeft = mount.scrollLeft;

      /*
       * We don't disable snap yet.
       *
       * First we need to know whether the user intends
       * to scroll horizontally or vertically.
       */
      mount.classList.add("is-pressing");

      /*
       * Pointer capture makes the drag much more reliable.
       *
       * The carousel continues receiving pointer events even
       * if the finger moves slightly outside its boundaries.
       */
      try {
        mount.setPointerCapture(e.pointerId);
      } catch {
        // Ignore unsupported pointer capture situations.
      }
    };

    /*
     * ---------------------------------------------------------
     * POINTER MOVE
     * ---------------------------------------------------------
     */
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      /*
       * -------------------------------------------------------
       * DETERMINE GESTURE DIRECTION
       * -------------------------------------------------------
       *
       * We don't immediately assume horizontal dragging.
       *
       * This is important on phones because the user may be
       * trying to scroll the entire page vertically.
       */
      if (!isHorizontal) {
        /*
         * Vertical movement wins.
         *
         * Completely release the carousel and allow the
         * browser to scroll the page normally.
         */
        if (
          Math.abs(dy) > Math.abs(dx) &&
          Math.abs(dy) > DRAG_THRESHOLD
        ) {
          isDown = false;
          isHorizontal = false;

          isDraggingRef.current = false;

          mount.classList.remove("is-pressing");
          mount.classList.remove("is-dragging");

          try {
            mount.releasePointerCapture(e.pointerId);
          } catch {
            // Ignore.
          }

          return;
        }

        /*
         * Ignore tiny movements.
         *
         * This prevents accidental micro-jumps when the
         * user simply touches a card.
         */
        if (Math.abs(dx) < DRAG_THRESHOLD) {
          return;
        }

        /*
         * -----------------------------------------------------
         * HORIZONTAL DRAG CONFIRMED
         * -----------------------------------------------------
         */
        isHorizontal = true;

        isDraggingRef.current = true;

        /*
         * THIS IS THE CRITICAL FIX.
         *
         * CSS scroll snapping is disabled only after we know
         * that the gesture is actually horizontal.
         *
         * While this class exists, JavaScript has complete
         * control over scrollLeft.
         */
        mount.classList.add("is-dragging");
      }

      /*
       * -------------------------------------------------------
       * DIRECT 1:1 DRAG
       * -------------------------------------------------------
       *
       * We calculate the position from:
       *
       * original scroll position
       * +
       * original finger position
       *
       * We do NOT calculate from the previous scrollLeft.
       *
       * That prevents accumulated drift and jitter.
       */
      mount.scrollLeft = startScrollLeft - dx;
    };

    /*
     * ---------------------------------------------------------
     * FINISH DRAG
     * ---------------------------------------------------------
     */
    const finishDrag = (e?: PointerEvent) => {
      if (!isDown) return;

      isDown = false;

      /*
       * Release pointer capture.
       */
      if (e) {
        try {
          mount.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore.
        }
      }

      mount.classList.remove("is-pressing");

      /*
       * Only treat it as a real drag if horizontal movement
       * was actually confirmed.
       */
      if (isHorizontal) {
        /*
         * At this exact point scrollLeft is already sitting
         * where the user's finger released.
         *
         * Re-enable snapping AFTER the drag has finished.
         */
        mount.classList.remove("is-dragging");

        /*
         * Keep the click-blocking flag alive for a tiny amount
         * of time so releasing a drag doesn't accidentally
         * trigger a button underneath the finger.
         */
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      } else {
        isDraggingRef.current = false;
      }

      isHorizontal = false;
    };

    /*
     * ---------------------------------------------------------
     * POINTER UP
     * ---------------------------------------------------------
     */
    const onPointerUp = (e: PointerEvent) => {
      finishDrag(e);
    };

    /*
     * ---------------------------------------------------------
     * POINTER CANCEL
     * ---------------------------------------------------------
     *
     * Handles situations where the operating system/browser
     * cancels the gesture.
     */
    const onPointerCancel = (e: PointerEvent) => {
      finishDrag(e);
    };

    /*
     * ---------------------------------------------------------
     * EVENTS
     * ---------------------------------------------------------
     *
     * Pointer Events work for:
     * - iPhone touch
     * - Android touch
     * - mouse
     * - trackpads
     * - stylus
     *
     * So we don't need separate mouse/touch handlers.
     */
    mount.addEventListener(
      "pointerdown",
      onPointerDown
    );

    mount.addEventListener(
      "pointermove",
      onPointerMove
    );

    mount.addEventListener(
      "pointerup",
      onPointerUp
    );

    mount.addEventListener(
      "pointercancel",
      onPointerCancel
    );

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */
    return () => {
      mount.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      mount.removeEventListener(
        "pointermove",
        onPointerMove
      );

      mount.removeEventListener(
        "pointerup",
        onPointerUp
      );

      mount.removeEventListener(
        "pointercancel",
        onPointerCancel
      );
    };
  }, []);

  /*
   * No movies = no component.
   */
  if (!movies.length) {
    return null;
  }

  return (
    <div className="latest-root">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <div className="latest-head">
        <h3 className="latest-title">
          latest movies
        </h3>

        <button
          className="latest-see"
          onClick={() => {
            /*
             * Don't activate SEE ALL if the user just finished
             * dragging the carousel.
             */
            if (isDraggingRef.current) {
              return;
            }

            location.hash = "#/movies";
          }}
        >
          SEE ALL
        </button>
      </div>

      {/* =====================================================
          HORIZONTAL MOVIE SCROLLER
          ===================================================== */}
      <div
        ref={mountRef}
        id="latestMount"
        className="latest-track"
      >
        <div className="rp-scroll">
          {movies.map((m) => (
            <div
              key={m.id}
              className="latest-card"
            >
              {/* =================================================
                  MOVIE COVER
                  ================================================= */}
              <div className="l-card-cover">
                <img
                  src={m.cover}
                  alt={m.title}
                  loading="lazy"
                  draggable={false}
                />

                {/* Cover fade */}
                <div className="l-card-fade" />

                {/* VJ */}
                <div className="l-card-vj-on">
                  {m.vj}
                </div>

                {/* =================================================
                    ACTION BUTTONS
                    ================================================= */}
                <div className="l-card-actions">
                  {/* PLAY */}
                  <button
                    className="l-a-btn play on"
                    onClick={(e) => {
                      e.stopPropagation();

                      /*
                       * If the user dragged, don't accidentally
                       * open the movie.
                       */
                      if (isDraggingRef.current) {
                        return;
                      }

                      if (m.video) {
                        window.open(
                          m.video,
                          "_blank"
                        );
                      }
                    }}
                  >
                    PLAY
                  </button>

                  {/* PREVIEW */}
                  <button
                    className="l-a-btn prev on"
                    onClick={(e) => {
                      e.stopPropagation();

                      /*
                       * Prevent accidental preview opening
                       * after a drag.
                       */
                      if (isDraggingRef.current) {
                        return;
                      }

                      if (m.preview?.[0]) {
                        window.open(
                          m.preview[0],
                          "_blank"
                        );
                      }
                    }}
                  >
                    PRE
                  </button>
                </div>
              </div>

              {/* =================================================
                  MOVIE TITLE
                  ================================================= */}
              <div className="l-card-title centered">
                {m.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

