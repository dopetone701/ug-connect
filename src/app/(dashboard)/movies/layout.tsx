export const runtime = 'edge';

import WatchDrawer from "./_components/watch-drawer";

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
      <WatchDrawer />
    </div>
  );
}
