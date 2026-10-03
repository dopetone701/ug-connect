"use client"

import { useEffect, useRef, useState } from "react"
import "./alerts-sheet.css"

type User = {
  name?: string
}

export default function AlertsSheet() {
  const [user, setUser] = useState<User | null>(null)

  const [open, setOpen] = useState(false)

  const [prefs, setPrefs] = useState({
    mute: false,
    ug: true,
    updates: true,
    drops: true,
  })

  const wrapRef = useRef<HTMLDivElement>(null)

  /* =========================================================
     LOAD USER + ALERT PREFERENCES
     ========================================================= */

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ug_user")
      const token = localStorage.getItem("ug_token")

      if (raw && token) {
        setUser(JSON.parse(raw))
      }

      const saved = localStorage.getItem("ug_alert_prefs")

      if (saved) {
        setPrefs(JSON.parse(saved))
      }
    } catch {}
  }, [])

  /* =========================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {
    if (!open) return

    const close = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null

      if (!target) return

      if (
        wrapRef.current &&
        !wrapRef.current.contains(target) &&
        !target.closest(".a-dots")
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", close, true)

    return () => {
      document.removeEventListener("pointerdown", close, true)
    }
  }, [open])

  /* =========================================================
     TOGGLE PREFERENCE
     ========================================================= */

  const tog = (
    key: keyof typeof prefs,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation()

    const next = {
      ...prefs,
      [key]: !prefs[key],
    }

    setPrefs(next)

    try {
      localStorage.setItem(
        "ug_alert_prefs",
        JSON.stringify(next)
      )
    } catch {}
  }

  /* =========================================================
     KEEP MENU INTERACTION INSIDE MENU
     ========================================================= */

  const stopMenuEvent = (
    e: React.PointerEvent | React.TouchEvent
  ) => {
    e.stopPropagation()
  }

  /* =========================================================
     SIGN IN
     ========================================================= */

  const openSignin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    window.dispatchEvent(
      new CustomEvent("ug-open-signin")
    )
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="a-root">

      {/* =====================================================
          TRANSPARENT BACKDROP
          ===================================================== */}

      {open && (
        <div
          className="a-overlay"
          onPointerDown={() => setOpen(false)}
          onTouchStart={() => setOpen(false)}
        />
      )}

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="a-top">

        <b>
          Inbox
          <span className="dot" />
        </b>

        <div
          className="a-wrap"
          ref={wrapRef}
        >

          <button
            type="button"
            className="a-dots"
            aria-label="Alert settings"
            aria-expanded={open}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((value) => !value)
            }}
          >
            ⋮
          </button>

          {/* =================================================
              ALERT SETTINGS MENU
              ================================================= */}

          {open && (
            <div
              className="a-menu"
              onPointerDown={stopMenuEvent}
              onTouchStart={stopMenuEvent}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="a-head">
                Alerts
              </div>

              <div
                className="a-row"
                onClick={(e) => tog("mute", e)}
              >
                <div>
                  <b>Mute</b>
                  <small>Silence all</small>
                </div>

                <div
                  className={`a-pill ${
                    prefs.mute ? "on" : ""
                  }`}
                >
                  <i />
                </div>
              </div>

              <div
                className="a-row"
                onClick={(e) => tog("ug", e)}
              >
                <div>
                  <b>UG Connect</b>
                  <small>News &amp; tips</small>
                </div>

                <div
                  className={`a-pill ${
                    prefs.ug ? "on" : ""
                  }`}
                >
                  <i />
                </div>
              </div>

              <div
                className="a-row"
                onClick={(e) => tog("updates", e)}
              >
                <div>
                  <b>Updates</b>
                  <small>System &amp; PRO</small>
                </div>

                <div
                  className={`a-pill ${
                    prefs.updates ? "on" : ""
                  }`}
                >
                  <i />
                </div>
              </div>

              <div
                className="a-row"
                onClick={(e) => tog("drops", e)}
              >
                <div>
                  <b>Drops</b>
                  <small>New movies</small>
                </div>

                <div
                  className={`a-pill ${
                    prefs.drops ? "on" : ""
                  }`}
                >
                  <i />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          LOGGED OUT
          ===================================================== */}

      {!user ? (

        <div className="a-body">

          <div className="a-bell">
            ◍
          </div>

          <h2>
            Never miss a thing
          </h2>

          <p>
            Sign in to activate your inbox -
            PRO receipts, downloads &amp; VJ drops.
          </p>

          <button
            type="button"
            className="a-cta"
            onClick={openSignin}
          >
            Sign in to Start
          </button>

        </div>

      ) : (

        /* ===================================================
           LOGGED IN
           =================================================== */

        <>

          <div className="a-body">

            <div className="a-bell faded">
              🔔
            </div>

            <h2>
              Inbox empty
            </h2>

            <p>
              All caught up. New alerts will land here.
            </p>

          </div>

          <div className="a-actions">

            <button
              type="button"
              className="a-mini"
            >
              Get PRO
            </button>

            <button
              type="button"
              className="a-mini ghost"
            >
              Drops
            </button>

            <button
              type="button"
              className="a-mini ghost"
            >
              Receipts
            </button>

          </div>

        </>

      )}

    </div>
  )
}
