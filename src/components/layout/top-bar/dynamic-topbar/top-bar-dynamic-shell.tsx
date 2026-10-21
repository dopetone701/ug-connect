"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { getTopBarType } from "./bar-types";
import MoviesTopBar from "./movies-top-bar";
import UniversalTopBar from "./universal-top-bar";
import JobsTopBar from "./jobs-top-bar";
import FoodTopBar from "./food-top-bar";
import MMoneyTopBar from "./m-money-top-bar";
import InfoTopBar from "./info-top-bar";
import "./info-top-bar.css";

function detectMobileDevice() {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  const isPhoneUA = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
  const isTouchDevice = navigator.maxTouchPoints > 0;
  const width = window.innerWidth;
  if (isPhoneUA) return true;
  if (isTouchDevice && width <= 1024) return true;
  return false;
}

export default function TopBarDynamicShell(){
  const pathname = usePathname();
  const watchOpen = useWatchDrawer((s:any)=>s.open);
  const watchMinimized = useWatchDrawer((s:any)=>s.minimized);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const update = () => setIsMobile(detectMobileDevice());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Watch fullscreen: hide top bar ONLY mobile + mobile landscape, PC keeps it
  if (watchOpen && !watchMinimized && isMobile) return null;

  // INFO PAGE: info-top-bar ONLY mobile, PC keeps movie topbar
  if (pathname?.startsWith("/info")) {
    if (isMobile) return <InfoTopBar />;
    return <MoviesTopBar />;
  }

  const type = getTopBarType(pathname || "/");

  if (type === "universal-hidden") return <MoviesTopBar />;
  if (type === "universal") return <UniversalTopBar />;
  if (type === "movies") return <MoviesTopBar />;
  if (type === "jobs") return <JobsTopBar />;
  if (type === "food") return <FoodTopBar />;
  if (type === "mmoney") return <MMoneyTopBar />;

  return <MoviesTopBar />;
}
