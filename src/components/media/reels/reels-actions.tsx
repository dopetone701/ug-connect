'use client'
export function ReelsActions() {
  return (
    <div className="reel-actions">
      <button className="ra-btn">
        <span className="ra-icon-bg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        <span className="ra-label">Like</span>
      </button>
      <button className="ra-btn">
        <span className="ra-icon-bg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 10.5c0 4.7-3.4 8-8 8-1.4 0-2.7-.3-3.8-.9L4 19l1.1-3.4c-.7-1.1-1.1-2.4-1.1-3.8 0-4.7 3.4-8 8-8s7.5 3.3 7.5 7.7z" />
            <path d="M8.5 11.8h.01M12 11.8h.01M15.5 11.8h.01" strokeWidth="2.4" />
          </svg>
        </span>
        <span className="ra-label">2.4k</span>
      </button>
      <button className="ra-btn">
        <span className="ra-icon-bg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V3" /><path d="M7 8l5-5 5 5" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
          </svg>
        </span>
        <span className="ra-label">Share</span>
      </button>
      <button className="ra-btn">
        <span className="ra-icon-bg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="hsl(var(--text))">
            <circle cx="12" cy="12" r="1.8" /><circle cx="19.5" cy="12" r="1.8" /><circle cx="4.5" cy="12" r="1.8" />
          </svg>
        </span>
      </button>
    </div>
  )
}
