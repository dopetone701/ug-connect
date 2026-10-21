"use client";
import { usePathname } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { getTopBarType } from "./bar-types";
import MoviesTopBar from "./movies-top-bar";
import UniversalTopBar from "./universal-top-bar";
import JobsTopBar from "./jobs-top-bar";
import FoodTopBar from "./food-top-bar";
import MMoneyTopBar from "./m-money-top-bar";

export default function TopBarDynamicShell(){
  const pathname = usePathname();
  const watchOpen = useWatchDrawer((s:any)=>s.open);
  const watchMinimized = useWatchDrawer((s:any)=>s.minimized);

  if (watchOpen && !watchMinimized) return null;

  const type = getTopBarType(pathname || "/");

  if (type === "universal-hidden") return <MoviesTopBar />;
  if (type === "universal") return <UniversalTopBar />;
  if (type === "movies") return <MoviesTopBar />;
  if (type === "jobs") return <JobsTopBar />;
  if (type === "food") return <FoodTopBar />;
  if (type === "mmoney") return <MMoneyTopBar />;

  return <MoviesTopBar />;
}

