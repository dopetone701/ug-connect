"use client";


export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;


import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import WatchClient from './watch-client';
import { useWatchDrawer } from "@/stores/use-watch-drawer";

export default function Page() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const type = search.get("t") || "full";
  const { openDrawer } = useWatchDrawer() as any;

  // PC -> Mobile: switch to drawer
  useEffect(()=>{
    const handle = () => {
      const isMobile = window.innerWidth <= 768;
      if(isMobile && id){
        openDrawer(id, type);
        router.replace("/movies");
      }
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [id, type, openDrawer, router]);

  return <WatchClient isOverlay={false} />;
}
