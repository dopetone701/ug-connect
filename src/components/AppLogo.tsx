"use client";
import { useAppLogo } from "@/hooks/useAppLogo";

export default function AppLogo(props: { className?: string }) {
  const logoUrl = useAppLogo();
  return <img src={logoUrl} alt="UG Connect" className={props.className || "h-10 w-auto"} />;
}
