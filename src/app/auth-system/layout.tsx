"use client"
import { useState, useEffect } from "react"
import SigninModals from "./signin-modals"

export default function Layout({children}:{children:React.ReactNode}){
  const [open,setOpen] = useState(false)
  const [mode,setMode] = useState<"signin"|"signup">("signin")
  useEffect(()=>{
    const h = () => { setMode("signin"); setOpen(true); }
    window.addEventListener("ug-open-signin" as any, h)
    return ()=> window.removeEventListener("ug-open-signin" as any, h)
  },[])
  return <>{children}<SigninModals isOpen={open} mode={mode} onClose={()=>setOpen(false)} onSwitchMode={setMode} onSuccess={()=>setOpen(false)} /></>
}
