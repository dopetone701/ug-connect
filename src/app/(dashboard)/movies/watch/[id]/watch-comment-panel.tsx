"use client"

import "./watch-comment-panel.css"
import { ReelsCommentBodyFull } from "@/components/media/reels/reels-action-logic/reels-comment-body-full"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useKeyboardViewport } from "@/stores/use-keyboard-viewport"

type Props = { movieId: string; movie?: any; onCountChange?: (count: number) => void }

export function WatchCommentPanel({ movieId, movie, onCountChange }: Props) {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hostInnerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isContainerInView = useRef(false)

  useKeyboardViewport(true)
  useEffect(() => setMounted(true), [])

  // FIXED LOGIC: Scope ENTIRE panel, not just title
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(
      ([e]) => {
        isContainerInView.current = e.isIntersecting
        setIsVisible(e.isIntersecting)
      },
      { 
        threshold: 0.05, 
        rootMargin: "0px 0px -10% 0px" 
      }
    )
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Inject real Reels bar into floating host - ONE BAR ONLY
  useEffect(() => {
    const inject = () => {
      const realBar = document.querySelector(".watch-comments .watch-comments-card .reels-c-input-bar") as HTMLElement
      const host = hostInnerRef.current
      if (!realBar || !host) return
      if (realBar.parentElement === host) return
      host.appendChild(realBar)
      realBar.classList.add("injected-real-bar")
      realBar.style.display = ""
    }
    const interval = setInterval(inject, 200)
    inject()
    const mutObs = new MutationObserver(inject)
    if (containerRef.current) mutObs.observe(containerRef.current, { childList: true, subtree: true })
    return () => { clearInterval(interval); mutObs.disconnect() }
  }, [mounted])


  // ===== KEYBOARD OPEN - PIN INPUT ABOVE KEYBOARD - NEVER BEHIND =====
useEffect(() => {
  const vv = window.visualViewport;
  const bar = document.querySelector('.watch-floating-bar.watch-comment-floating') as HTMLElement | null;
  if (!bar || !vv) return;

  const onVvChange = () => {
    const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
    const isKbOpen = kbHeight > 120; // keyboard open threshold

    if (isKbOpen) {
      document.body.classList.add('reels-kb-open');
      bar.style.bottom = `${kbHeight}px`;
      bar.style.transform = 'translateX(0) translateY(0)';
      // keep list padding so last comment still above input
      const list = document.querySelector('.watch-comments-card .reels-c-list') as HTMLElement | null;
      if (list) list.style.paddingBottom = `calc(90px + ${kbHeight}px)`;
    } else {
      document.body.classList.remove('reels-kb-open');
      bar.style.bottom = '';
      const list = document.querySelector('.watch-comments-card .reels-c-list') as HTMLElement | null;
      if (list) list.style.paddingBottom = '';
    }
  };

  vv.addEventListener('resize', onVvChange);
  vv.addEventListener('scroll', onVvChange);
  window.addEventListener('resize', onVvChange);

  return () => {
    vv.removeEventListener('resize', onVvChange);
    vv.removeEventListener('scroll', onVvChange);
    window.removeEventListener('resize', onVvChange);
    document.body.classList.remove('reels-kb-open');
  };
}, []);


  const floatingShell = (
    <div className={`watch-floating-bar watch-comment-floating ${isVisible ? "is-visible" : "is-hidden"}`}>
      <div ref={hostInnerRef} className="watch-floating-bar-inner watch-floating-host">
        {/* Real bar injected here - looks native */}
      </div>
    </div>
  )

  return (
    <>
      <section ref={containerRef} className="watch-comments" aria-label="Comments">
        <h2 ref={titleRef} className="watch-comments-title">Comments</h2>
        <div className="watch-comments-card">
          <ReelsCommentBodyFull movieId={movieId} movie={movie} onCountChange={onCountChange} />
        </div>
      </section>
      {mounted ? createPortal(floatingShell, document.body) : null}
    </>
  )
}
export default WatchCommentPanel
