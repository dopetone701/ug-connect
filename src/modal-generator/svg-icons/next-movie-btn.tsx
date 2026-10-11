"use client";

type Props = {
  onClick?: () => void;
  label?: string;
  className?: string;
};

export default function NextBtn({ onClick, label = "next", className = "" }: Props) {
  return (
    <>
      <button onClick={onClick} className={`next-btn ${className}`}>
        <span>{label}</span>
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M12 2L19 8L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
          <path d="M16 2L23 8L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" opacity="0.5" />
        </svg>
      </button>

      <style>{`
        .next-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid #333;
          color: #fff;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 14px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 14px 24px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .next-btn svg {
          transition: transform 0.25s ease;
        }
        .next-btn:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
          gap: 12px;
        }
        .next-btn:hover svg {
          transform: translateX(4px);
        }
        .next-btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </>
  );
}

// USAGE:
// <NextBtn onClick={() => router.push('/next')} />
// <NextBtn label="next >>" />

