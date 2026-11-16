// 👇 ALL NAMED exports — hub does: import { initialOf, monthYear, timeAgo } from "../utils/format"

// Worker sends mixed formats: 1794659133153 (number),
// "1790841983413.0" (numeric string), "2026-10-01 08:06:23" (date string)
function toMs(ts: number | string | null | undefined): number {
  if (ts == null || ts === "") return 0;
  if (typeof ts === "number") return ts;
  const trimmed = ts.trim();
  // Numeric string -> parse as ms
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  // Date string -> parse as date
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function initialOf(label: string): string {
  const clean = label.trim();
  if (!clean) return "?";
  return clean[0].toUpperCase();
}

export function isActiveToday(ts: number | string | null | undefined): boolean {
  const ms = toMs(ts);
  if (!ms) return false;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function timeAgo(ts: number | string | null | undefined): string {
  const ms = toMs(ts);
  if (!ms) return "never";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// 👇 THIS ONE WAS MISSING — hub needs it for "Joined Jan 2026"
export function monthYear(ts: number | string | null | undefined): string {
  const ms = toMs(ts);
  if (!ms) return "--";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}