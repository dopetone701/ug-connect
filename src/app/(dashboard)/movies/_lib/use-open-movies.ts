"use client";
import { useRouter } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";

export function useOpenMovie(){
  const router = useRouter();
  const openDrawer = useWatchDrawer(s => s.openDrawer);
  
  return (id: string, type: "full" | "preview" = "full") => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    if(isMobile){
      openDrawer(id, type); // mobile = drawer + mini bubble
    } else {
      router.push(`/movies/watch/${id}?t=${type}`); // pc = direct page
    }
  }
}
