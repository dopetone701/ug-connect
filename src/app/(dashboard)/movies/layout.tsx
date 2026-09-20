export default function MoviesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="movies-shell">
      {children}
      {modal}
    </div>
  );
}
