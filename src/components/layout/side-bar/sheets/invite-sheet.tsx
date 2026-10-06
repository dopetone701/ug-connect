"use client";

import { useState } from "react";
import "./invite-friend.css";

export default function InviteSheet() {
  const [copied, setCopied] = useState(false);

  const link = "https://ugconnect.app/invite/DOPE";

  const text =
    `Yo! Watch Ugandan movies translated by VJs - Luganda commentary, no buffering. ` +
    `Join me on Ug-Connect PRO - AED 10/mo or AED 100/year save 20. ` +
    `Or invite 5 friends & unlock 10 movies FREE! ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        link
      )}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Ug-Connect",
          text,
          url: link,
        });
      } catch {}
    } else {
      await copy();
    }
  };

  return (
    <>
      {/* =====================================================
          INVITE OVERRIDES
          IMPORTANT:
          These target the PARENT detail-card from inside
          InviteSheet so the existing side-sheet animation
          cannot push this sheet down.
          ===================================================== */}

      <style jsx global>{`

        /* ===================================================
           INVITE PARENT CARD
           =================================================== */

        .wa-mob-panel.is-menu
        .wa-card.detail-card:has(.invite-sheet) {
          position: relative !important;

          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: auto !important;

          width: 100% !important;
          height: 100% !important;

          max-height: none !important;
          min-height: 0 !important;

          margin: 0 !important;
          padding: 0 !important;

          overflow: hidden !important;

          /*
             THIS IS THE IMPORTANT FIX.
             The old side-sheet CSS has:
             transform: translateY(110%);
          */
          transform: none !important;

          animation: none !important;

          opacity: 1 !important;

          pointer-events: auto !important;

          border-radius: 0 !important;
        }


        /* Kill every animation state on the parent */

        .wa-mob-panel.is-menu
        .wa-card.detail-card:has(.invite-sheet).is-entering,

        .wa-mob-panel.is-menu
        .wa-card.detail-card:has(.invite-sheet).is-launching,

        .wa-mob-panel.is-menu
        .wa-card.detail-card:has(.invite-sheet).is-dipping {

          transform: none !important;

          animation: none !important;

          opacity: 1 !important;

          pointer-events: auto !important;
        }


        /* ===================================================
           MORPH BODY
           =================================================== */

        .wa-mob-panel.is-menu
        .wa-card.detail-card:has(.invite-sheet)
        .morph-body {

          width: 100% !important;
          height: 100% !important;

          min-height: 0 !important;

          padding: 0 !important;

          margin: 0 !important;

          overflow: hidden !important;

          display: flex !important;

          flex-direction: column !important;

          transform: none !important;
        }


        /* ===================================================
           INVITE SHEET
           =================================================== */

        .invite-sheet {

          position: relative !important;

          width: 100% !important;
          height: 100% !important;

          min-width: 0 !important;
          min-height: 0 !important;

          display: flex !important;

          flex-direction: column !important;

          overflow: hidden !important;

          margin: 0 !important;
          padding: 0 !important;

          box-sizing: border-box !important;

          background: hsl(var(--bg)) !important;
          color: hsl(var(--text)) !important;
        }


        /* ===================================================
           ONLY INVITE SCROLL CONTAINER
           =================================================== */

        .invite-scroll {

          width: 100% !important;
          height: 100% !important;

          min-width: 0 !important;
          min-height: 0 !important;

          flex: 1 1 auto !important;

          overflow-y: auto !important;
          overflow-x: hidden !important;

          -webkit-overflow-scrolling: touch !important;

          overscroll-behavior: contain !important;

          box-sizing: border-box !important;

          margin: 0 !important;
          padding: 0 !important;
        }


        /* ===================================================
           CONTENT STARTS AT THE TOP
           =================================================== */

        .invite-root {

          width: 100% !important;

          height: auto !important;

          min-height: 0 !important;

          margin: 0 !important;

          padding: 8px 4px 100px !important;

          display: flex !important;

          flex-direction: column !important;

          box-sizing: border-box !important;

          overflow: visible !important;

          background: hsl(var(--bg)) !important;
        }


        /* ===================================================
           CARDS
           =================================================== */

        .invite-root .invite-card {

          position: relative !important;

          flex: 0 0 auto !important;

          width: calc(100% - 8px) !important;

          height: auto !important;

          min-height: 0 !important;

          max-height: none !important;

          margin: 2px auto !important;

          transform: none !important;

          overflow: visible !important;
        }

      `}</style>

      <div className="invite-sheet">
        <div className="invite-scroll">

          <div className="invite-root">

            {/* HERO */}
            <div className="invite-hero">
              <div className="invite-icon">🎁</div>

              <h2>Invite Friends, Watch Free</h2>

              <p>
                Share Ug-Connect with{" "}
                <b>5 friends who sign in</b>, and you unlock{" "}
                <b>10 movies absolutely free</b>.
              </p>
            </div>


            {/* PRO CARD */}
            <div className="invite-card pro">

              <div className="invite-badge">
                PRO REFERRAL • FREE MOVIES
              </div>

              <div className="invite-progress-big">

                <div className="prog-head">
                  <span>Your Progress</span>
                  <span>0 / 5</span>
                </div>

                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: "0%" }}
                  />
                </div>

                <small>
                  0 friends invited • 0 / 10 movies unlocked
                </small>

              </div>


              {/* LINK */}
              <div className="invite-link-box">

                <span>{link}</span>

                <button
                  type="button"
                  onClick={copy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

              </div>


              {/* SHARE BUTTONS */}
              <div className="share-grid">

                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="share-btn wa"
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={shareTelegram}
                  className="share-btn tg"
                >
                  Telegram
                </button>

                <button
                  type="button"
                  onClick={shareX}
                  className="share-btn x"
                >
                  X
                </button>

                <button
                  type="button"
                  onClick={copy}
                  className="share-btn copy"
                >
                  Copy Link
                </button>

              </div>


              {/* CTA */}
              <button
                type="button"
                onClick={shareNative}
                className="invite-cta"
              >
                Share Now • Unlock 10 Free
              </button>


              <p className="invite-note">
                Pricing auto shows in your local currency (AED).
                PRO is AED 10/mo or AED 100/year - save AED 20.
              </p>

            </div>


            {/* HOW IT WORKS */}
            <div className="invite-card how">

              <h3>How it works</h3>

              <div className="step">
                <b>1</b>
                <span>Share your link with friends</span>
              </div>

              <div className="step">
                <b>2</b>
                <span>Friend signs in on Ug-Connect</span>
              </div>

              <div className="step">
                <b>3</b>
                <span>
                  After 5 friends, 10 movies unlocked free instantly
                </span>
              </div>

            </div>


            {/* EXTRA REWARDS */}
            <div className="invite-card how">

              <h3>Extra Rewards</h3>

              <p className="extra-rewards-text">
                Invite 10 friends = 1 month PRO free.
                Invite 20 = 3 months PRO free.
                Keep inviting and keep earning.
              </p>

            </div>


            {/* BOTTOM SPACE */}
            <div className="invite-bottom-space" />

          </div>

        </div>
      </div>
    </>
  );
}