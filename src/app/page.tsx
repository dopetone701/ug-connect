"use client";
import "./page.css";
import "../components/ui/service-card/service-card.css";
import { useEffect, useState } from "react";

const top = [
  {id:"movies", l:"Movies", custom:true, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>
  )},
  {id:"ug-foods", l:"UG Foods", customFood:true, icon: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16"/>
    <path d="M5 12c0 4 3.1 7 7 7s7-3 7-7"/>
    <path d="M8 3c-1 1.2-1 2.8 0 4"/>
    <path d="M12 2c-1 1.5-1 3.5 0 5"/>
    <path d="M16 3c-1 1.2-1 2.8 0 4"/>
  </svg>
)},

  {id:"mobile-money", l:"Mobile Money", customMoney:true, icon: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2.5"/>
    <path d="M9 6h6"/>
    <path d="M8 15h8"/>
    <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none"/>
    <path d="M12 9v4"/>
    <path d="M10.5 10.5 12 9l1.5 1.5"/>
  </svg>
)},

];

const bottom = [
  {
    id:"hair-cuts",
    l:"Hair Cuts",
    customSalon:true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Professional scissors */}
        <circle cx="6" cy="7" r="3"/>
        <circle cx="6" cy="17" r="3"/>
        <path d="M8.5 8.5 19 3"/>
        <path d="M8.5 15.5 19 21"/>
        <path d="M12 12h7"/>
      </svg>
    )
  },

  {
    id:"jobs",
    l:"Jobs",
    customJobs:true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Professional briefcase */}
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M3 12h18"/>
        <path d="M10 12v2h4v-2"/>
      </svg>
    )
  },

  {
    id:"send-to-uganda",
    l:"Send to Uganda",
    customCago:true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Package + send arrow */}
        <path d="M4 7 12 3l8 4v10l-8 4-8-4V7z"/>
        <path d="M4 7l8 4 8-4"/>
        <path d="M12 11v10"/>
        <path d="M15 14h5"/>
        <path d="m18 11 3 3-3 3"/>
      </svg>
    )
  },

  {
    id:"beds-near-u",
    l:"Beds Near U",
    customBeds:true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Bed */}
        <path d="M3 18V8"/>
        <path d="M21 18v-6"/>
        <path d="M3 13h18"/>
        <path d="M5 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>
        <path d="M13 13v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/>
        <path d="M3 18v3"/>
        <path d="M21 18v3"/>
      </svg>
    )
  },
];


function CardLabel({l, icon}: any){
  return (
    <div className="card-title-top">
      <span className="card-title-icon">{icon}</span>
      <p>{l}</p>
    </div>
  )
}

export default function Page(){
  const [rate, setRate] = useState(1008);
  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch("https://open.er-api.com/v6/latest/AED");
        const d = await r.json();
        setRate(Math.round(d.rates?.UGX || 1008));
      }catch{ setRate(1008); }
    }
    load();
    const id = setInterval(load, 60000);
    return ()=>clearInterval(id);
  },[]);

  return(
    <div className="landing-root">
      <h1 className="landing-title">Choose your service</h1>
     
      <div className="grid top-grid">
        {top.map(s=> (
          <div key={s.id} className="card-wrapper">
            <CardLabel l={s.l} icon={s.icon} />
            {s.custom ? (
              <a href={`/${s.id}`} className="service-card movies-card">
                <div className="movies-left"></div>
                <div className="movies-right">
                  <div className="scroller-track">
                    <img src="/scroller.jpg" alt="" />
                    <img src="/scroller.jpg" alt="" />
                    <img src="/scroller.jpg" alt="" />
                    <img src="/scroller.jpg" alt="" />
                  </div>
                </div>
              </a>
            ) : (s as any).customFood ? (
              <a href={`/${s.id}`} className="service-card ug-foods-card">
                <div className="ug-foods-left"></div>
                <div className="ug-foods-right">
                  <div className="foods-stack">
                    <img src="/matooke.jpg" className="stack-img stack-1" alt="" />
                    <img src="/matooke.jpg" className="stack-img stack-2" alt="" />
                    <img src="/matooke.jpg" className="stack-img stack-3" alt="" />
                  </div>
                </div>
                <div className="foods-label"><p>UG Foods</p></div>
              </a>
            ) : (s as any).customMoney ? (
              <a href={`/${s.id}`} className="service-card mobile-money-card">
                <div className="money-bg"></div>
                <div className="money-live-widget">
                  <div className="live-row">
                    <p className="live-label-aed">AED</p>
                    <span className="live-arrow">→</span>
                    <p className="live-label-ugx">UGX</p>
                  </div>
                  <h2 className="live-rate">1 AED = {rate.toLocaleString()} UGX</h2>
                  <p className="live-sub">Live</p>
                </div>
              </a>
            ) : (
              <a href={`/${s.id}`} className="service-card"><span> </span></a>
            )}
          </div>
        ))}
      </div>

      <div className="grid bottom-grid">
        {bottom.map(s=> (
          <div key={s.id} className="card-wrapper">
            <CardLabel l={s.l} icon={s.icon} />
            {(s as any).customSalon ? (
              <a href={`/${s.id}`} className="service-card salon-card">
                <div className="salon-bg"></div>
              </a>
            ) : (s as any).customJobs ? (
              <a href={`/${s.id}`} className="service-card jobs-card">
                <div className="jobs-bg"></div>
              </a>
            ) : (s as any).customCago ? (
              <a href={`/${s.id}`} className="service-card cago-card">
                <div className="cago-bg"></div>
              </a>
            ) : (s as any).customBeds ? (
              <a href={`/${s.id}`} className="service-card beds-card">
                <div className="beds-bg"></div>
              </a>
            ) : (
              <a href={`/${s.id}`} className="service-card"><span> </span></a>
            )}
          </div>
        ))}
      </div>

      <div className="cta-wrap"><button className="cta-btn">Sign up for full experience</button></div>
    </div>
  );
}
