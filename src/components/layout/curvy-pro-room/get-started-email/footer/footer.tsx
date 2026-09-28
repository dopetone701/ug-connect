"use client";

import "./footer.css";

const links = [
  { label: "Contact us", href: "/contact" },
  { label: "Help", href: "/help" },
  { label: "Faq", href: "/faq" },
  { label: "Terms", href: "/terms" },
  { label: "Signup", href: "/signup" },
  { label: "Movies", href: "/movies" },
  { label: "Previews", href: "/previews" },
  { label: "Accounts", href: "/account" },
  { label: "Report a problem", href: "/report" },
  { label: "About", href: "/about" },
];

export default function FooterFree() {
  return (
    <footer className="ft-root">
      <div className="ft-links">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="ft-link">
            {l.label}
          </a>
        ))}
      </div>

      <div className="ft-bottom">
        <div className="ft-social">
          {/* X */}
          <a
            href="https://x.com"
            aria-label="X"
            className="ft-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.9 2H22.3L14.7 10.6L23.9 22H17L11.3 14.5L4.8 22H1.4L9.5 12.7L0.7 2H7.7L12.8 8.8L18.9 2ZM16.6 20.1H18.5L6.2 3.8H4.1L16.6 20.1Z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            aria-label="Facebook"
            className="ft-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5v1.8H16l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            aria-label="Instagram"
            className="ft-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="6" />
              <circle cx="12" cy="12" r="4.5" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1.2"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
        </div>

        <p className="ft-powered">
          Powered by <span>dopetone</span>
        </p>
      </div>
    </footer>
  );
}
