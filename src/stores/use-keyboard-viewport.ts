"use client"
import { useEffect } from "react"

/**
 * Keeps the reels comment layout inside the VISIBLE area on every device.
 *
 * Why: on iOS Safari (and Chrome Android by default) the on-screen keyboard does not
 * resize the page. It shrinks the *visual viewport* and may scroll the page up, so fixed
 * elements slide off screen. This hook publishes the visual viewport as CSS variables:
 *   --vvh     height of the visible area (above the keyboard)
 *   --vv-top  how far the visible area is scrolled from the top of the page
 * and toggles `reels-kb-open` on <body> while the keyboard is up.
 * reels-keyboard.css uses these to size the video, the comment panel and the input bar.
 */
export function useKeyboardViewport(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return

    const vv = window.visualViewport
    const root = document.documentElement
    let baseline = window.innerHeight // tallest height seen = keyboard closed
    let raf = 0
    let wasKb = false

    const apply = () => {
      raf = 0
      const h = vv ? vv.height : window.innerHeight
      const top = vv ? vv.offsetTop : 0
      baseline = Math.max(baseline, window.innerHeight, h)
      const kb = baseline - h > 120

      root.style.setProperty("--vvh", `${h}px`)
      root.style.setProperty("--vv-top", `${top}px`)
      document.body.classList.toggle("reels-kb-open", kb)

      // keyboard just closed: make sure the page is back at the top
      if (wasKb && !kb) window.scrollTo(0, 0)
      wasKb = kb
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply) }

    const onOrientation = () => {
      // a new orientation has a new "full" height
      setTimeout(() => { baseline = window.innerHeight; schedule() }, 350)
    }

    apply()
    vv?.addEventListener("resize", schedule)
    vv?.addEventListener("scroll", schedule)
    window.addEventListener("resize", schedule)
    window.addEventListener("orientationchange", onOrientation)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      vv?.removeEventListener("resize", schedule)
      vv?.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("orientationchange", onOrientation)
      root.style.removeProperty("--vvh")
      root.style.removeProperty("--vv-top")
      document.body.classList.remove("reels-kb-open")
    }
  }, [active])
}

