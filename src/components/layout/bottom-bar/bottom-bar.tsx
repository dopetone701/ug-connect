"use client";
import { usePathname } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useBottomBar } from "@/stores/use-bottom-bar";
import MoviesBottomBar from "./bars/movies-bottom-bar";
import UniversalBottomBar from "./bars/universal-bottom-bar";

export default function BottomBar() {
  const pathname = usePathname();
  const watchOpen = useWatchDrawer((s: any) => s.open);
  const watchMinimized = useWatchDrawer((s: any) => s.minimized);
  const getBarType = useBottomBar((s) => s.getBarType);
  const universalEnabled = useBottomBar((s) => s.universalEnabled);

  if (watchOpen && !watchMinimized) return null;

  const type = getBarType(pathname);

  if (type === "universal-hidden") return null;
  if (type === "universal" && universalEnabled) return <UniversalBottomBar />;
  if (type === "movies") return <MoviesBottomBar />;

  // launch fallback
  return <MoviesBottomBar />;
}
