"use client"
import { useMemo, useState, useEffect } from "react"
import "./subscriptions-sheet.css"
import { getPricing } from "@/components/layout/curvy-pro-room/faq-room/currency-map-calculater"
import { useSubscriptionFlow } from "@/stores/use-subscription-flow"

const ALL_VJS = ["VJ JUNIOR","VJ JINGO","VJ ICE P","VJ EMMY","VJ KEVO","VJ MUBA","VJ LITTLE T","VJ HD","VJ MARK"]

export default function SubscriptionsSheet(){
  const [pricing, setPricing] = useState<ReturnType<typeof getPricing> | null>(null)
  const [loadingType, setLoadingType] = useState<"monthly" | "yearly" | null>(null)
  const flow = useSubscriptionFlow()

  useEffect(()=>{
    setPricing(getPricing())
  },[])

  const vjs = useMemo(()=>{
    const shuffled = [...ALL_VJS].sort(()=>0.5-Math.random())
    return shuffled.slice(0,3)
  },[])

  const vjsPlus = useMemo(()=>{
    const shuffled = [...ALL_VJS].sort(()=>0.5-Math.random())
    return shuffled.slice(0,3)
  },[])

  const closeAccountSheetPro = () => {
    window.dispatchEvent(new CustomEvent("ug-close-account-sheet" as any))
    window.dispatchEvent(new CustomEvent("ug-close-sheet" as any))
    window.dispatchEvent(new CustomEvent("ug-close-menu-panel" as any))
    window.dispatchEvent(new CustomEvent("ug-close-account-drawer" as any))
    document.documentElement.classList.remove("is-sheet-open")
    document.body.style.overflow = ""
    try { (require("@/stores/use-side-sheet") as any).useSideSheet.getState().open(null) } catch {}
  }

  const openWithInjectedFeel = (type: "monthly" | "yearly") => {
    if (loadingType) return
    // 1. INJECT VISUAL IMMEDIATELY - user sees click
    setLoadingType(type)

    // 2. DELAY CLOSE ON PURPOSE - let him feel progress (220ms)
    setTimeout(() => {
      closeAccountSheetPro()

      // 3. WAIT FOR DRAWER TO SLIDE DOWN (320ms) THEN OPEN FLOW
      setTimeout(() => {
        flow.open(type)
        setLoadingType(null)
      }, 320)
    }, 220)
  }

  const openPro = () => openWithInjectedFeel("monthly")
  const openPlus = () => openWithInjectedFeel("yearly")
  const openDiscover = () => openWithInjectedFeel("monthly")

  const monthlyText = pricing?.monthlyFormatted || "AED 10"
  const yearlyText = pricing?.yearlyFormatted || "AED 100"
  const saveText = pricing?.saveFormatted || "AED 20"
  const currencyCode = pricing?.currency || "AED"

  return (
    <div className="sub-root">
      <div className="sub-card pro">
        <div className="sub-badge">{currencyCode} - MOST POPULAR</div>
        <h1 className="sub-title">PRO</h1>
        <div className="sub-price"><span>{monthlyText}</span><small>/Mo.</small></div>
        <p className="sub-desc">
          Watch <b>unlimited movies & series</b> translated by your favourite VJs.
          Luganda commentary, no buffering, first to get fresh releases. Your cinema, your language.
        </p>
        <div className="sub-feat"><span className="check"></span> Watch without Ads</div>
        <div className="sub-feat"><span className="check"></span> Unlimited VJ Translations</div>
        <div className="sub-feat"><span className="check"></span> 4K & Early Access</div>
        <div className="sub-bottom">
          <div className="vj-circles">
            {vjs.map((v,i)=>(
              <div key={v} className="vj-circle" style={{zIndex: 3-i}}>{v.replace("VJ ","")}</div>
            ))}
          </div>
          <button className="discover-btn" onClick={openDiscover}>Discover More <span></span></button>
        </div>
        <button className="sub-now" onClick={openPro} disabled={!!loadingType}>
          {loadingType === "monthly" ? " loading..." : `Subscribe Now - ${monthlyText}`}
        </button>
      </div>

      <div className="sub-card plus">
        <div className="sub-badge gold">BEST VALUE - SAVE {saveText}</div>
        <h1 className="sub-title">PRO <span>PLUS</span></h1>
        <div className="sub-price"><span>{yearlyText}</span><small>/Yr.</small></div>
        <p className="sub-desc">
          Everything in PRO, plus <b>all-year access for price of 10 months</b>. Lock your price, offline downloads & family sharing.
        </p>
        <div className="sub-feat"><span className="check"></span> All PRO Features Included</div>
        <div className="sub-feat"><span className="check"></span> Offline Downloads + Family Share</div>
        <div className="sub-feat"><span className="check"></span> Lock Price</div>
        <div className="sub-bottom">
          <div className="vj-circles">
            {vjsPlus.map((v,i)=>(
              <div key={v} className="vj-circle gold" style={{zIndex: 3-i}}>{v.replace("VJ ","")}</div>
            ))}
          </div>
          <button className="discover-btn" onClick={openDiscover}>Discover More <span></span></button>
        </div>
        <button className="sub-now gold" onClick={openPlus} disabled={!!loadingType}>
          {loadingType === "yearly" ? " loading..." : `Subscribe Yearly - ${yearlyText} - Save ${saveText}`}
        </button>
      </div>
    </div>
  )
}

