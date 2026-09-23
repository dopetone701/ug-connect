"use client";

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="movies-shell">{children}</div>;
}
