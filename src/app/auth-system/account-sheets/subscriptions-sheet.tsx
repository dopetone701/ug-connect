"use client"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./subscriptions-sheet.css"
import { getPricing } from "@/components/layout/curvy-pro-room/faq-room/currency-map-calculater"

const ALL_VJS = ["VJ JUNIOR","VJ JINGO","VJ ICE P","VJ EMMY","VJ KEVO","VJ MUBA","VJ LITTLE T","VJ HD","VJ MARK"]

export default function SubscriptionsSheet(){
  const router = useRouter()
  const [pricing, setPricing] = useState<ReturnType<typeof getPricing> | null>(null)

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

  const openService = () => router.push("/service")

  const monthlyText = pricing?.monthlyFormatted || "AED 10"
  const yearlyText = pricing?.yearlyFormatted || "AED 100"
  const saveText = pricing?.saveFormatted || "AED 20"
  const currencyCode = pricing?.currency || "AED"

  return (
    <div className="sub-root">
      <div className="sub-card pro">
        <div className="sub-badge">{currencyCode} • MOST POPULAR</div>
        <h1 className="sub-title">PRO</h1>
        <div className="sub-price"><span>{monthlyText}</span><small>/Mo.</small></div>
        <p className="sub-desc">
          Watch <b>unlimited movies & series</b> translated by your favourite VJs. 
          Luganda commentary, no buffering, first to get fresh releases. Your cinema, your language.
        </p>
        <div className="sub-feat"><span className="check">✓</span> Watch without Ads</div>
        <div className="sub-feat"><span className="check">✓</span> Unlimited VJ Translations</div>
        <div className="sub-feat"><span className="check">✓</span> 4K & Early Access</div>
        <div className="sub-bottom">
          <div className="vj-circles">
            {vjs.map((v,i)=>(
              <div key={v} className="vj-circle" style={{zIndex: 3-i}}>{v.replace("VJ ","")}</div>
            ))}
          </div>
          <button className="discover-btn" onClick={openService}>Discover More <span>›</span></button>
        </div>
        <button className="sub-now">Subscribe Now • {monthlyText}</button>
      </div>

      <div className="sub-card plus">
        <div className="sub-badge gold">BEST VALUE • SAVE {saveText}</div>
        <h1 className="sub-title">PRO <span>PLUS</span></h1>
        <div className="sub-price"><span>{yearlyText}</span><small>/Yr.</small></div>
        <p className="sub-desc">
          Everything in PRO, plus <b>all-year access for price of 10 months</b>. Lock your price, offline downloads & family sharing.
        </p>
        <div className="sub-feat"><span className="check">✓</span> All PRO Features Included</div>
        <div className="sub-feat"><span className="check">✓</span> Offline Downloads + Family Share</div>
        <div className="sub-feat"><span className="check">✓</span> Lock Price</div>
        <div className="sub-bottom">
          <div className="vj-circles">
            {vjsPlus.map((v,i)=>(
              <div key={v} className="vj-circle gold" style={{zIndex: 3-i}}>{v.replace("VJ ","")}</div>
            ))}
          </div>
          <button className="discover-btn" onClick={openService}>Discover More <span>›</span></button>
        </div>
        <button className="sub-now gold">Subscribe Yearly • {yearlyText} - Save {saveText}</button>
      </div>
    </div>
  )
}

