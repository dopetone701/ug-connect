"use client";
import { useRouter } from "next/navigation";

type Props = {
  onClick?: () => void;
  className?: string;
  fallback?: string;
};

export default function BackBtn(props: Props) {
  const extra = props.className || "";
  const fallback = props.fallback || "/movies";
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (props.onClick) return props.onClick();
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      aria-label="Back"
      className={"inline-flex items-center justify-center w-14 h-14 text-white active:scale-90 transition " + extra}
      style={{ background: "none", border: "none" }}
    >
      <svg
        width={34}
        height={34}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18L9 12L15 6" />
      </svg>
    </button>
  );
}
