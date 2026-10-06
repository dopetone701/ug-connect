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

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {}
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        link
      )}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
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
    <div className="invite-sheet">

      {/* =====================================================
          SCROLL AREA
          ===================================================== */}
      <div className="invite-scroll">

        {/* ===================================================
            CONTENT
            =================================================== */}
        <div className="invite-root">

          {/* HERO */}
          <section className="invite-hero">
            <div className="invite-icon">🎁</div>

            <h2>Invite Friends, Watch Free</h2>

            <p>
              Share Ug-Connect with{" "}
              <b>5 friends who sign in</b>, and you unlock{" "}
              <b>10 movies absolutely free</b>.
            </p>
          </section>


          {/* =================================================
              PRO / REFERRAL CARD
              ================================================= */}
          <section className="invite-card pro">

            <div className="invite-badge">
              PRO REFERRAL • FREE MOVIES
            </div>

            {/* PROGRESS */}
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


            {/* INVITE LINK */}
            <div className="invite-link-box">

              <span>
                {link}
              </span>

              <button
                type="button"
                onClick={copy}
              >
                {copied ? "Copied!" : "Copy"}
              </button>

            </div>


            {/* SHARE GRID */}
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


            {/* MAIN CTA */}
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

          </section>


          {/* =================================================
              HOW IT WORKS
              ================================================= */}
          <section className="invite-card how">

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

          </section>


          {/* =================================================
              EXTRA REWARDS
              ================================================= */}
          <section className="invite-card how">

            <h3>Extra Rewards</h3>

            <p className="extra-rewards-text">
              Invite 10 friends = 1 month PRO free.
              Invite 20 = 3 months PRO free.
              Keep inviting and keep earning.
            </p>

          </section>


          {/* =================================================
              BOTTOM SPACE
              ================================================= */}
          <div className="invite-bottom-space" />

        </div>
      </div>
    </div>
  );
}
