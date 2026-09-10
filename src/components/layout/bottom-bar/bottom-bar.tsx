"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./bottom-bar.css";

const items = [
  { href: "/mobile-money", label: "M Money", svg: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.75" y="5" width="18.5" height="14" rx="2.5"/><path d="M2.75 9.5h18.5"/><path d="M16.25 14.25h2.25"/></svg>
  )},
  { href: "/jobs", label: "Jobs", svg: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7.25" width="18" height="13.25" rx="2.25"/><path d="M8 7.25V5.5A2.25 2.25 0 0 1 10.25 3.25h3.5A2.25 2.25 0 0 1 16 5.5v1.75"/><path d="M3 11.5h18"/><path d="M10 11.5v1.25a2 2 0 0 0 4 0V11.5"/></svg>
  )},
  {  
    href: "/movies", 
    label: "Movies", 
    center: true, 
    image: "/bottom-bar-images/movies.png" 
  },
  { href: "/ug-foods", label: "Food", svg: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11.5h14"/><path d="M6.25 11.5a5.75 5.75 0 0 1 11.5 0"/><path d="M4 11.5v1.25a5.25 5.25 0 0 0 5.25 5.25h5.5A5.25 5.25 0 0 0 20 12.75V11.5"/></svg>
  )},
  { href: "/profile", label: "You", svg: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4.25"/><path d="M4.75 19.5a7.25 7.25 0 0 1 14.5 0"/></svg>
  )},
];

export default function BottomBar(){
  const path = usePathname();
  return (
    <nav className="bottom-bar-glass">
      <div className="bottom-inner">
        {items.map(i=>{
          const active = path===i.href;
          return (
            <Link key={i.href} href={i.href} className={`bottom-item ${active?"active":""} ${i.center?"center":""}`}>
              <span className={`bottom-icon ${i.center?"center-icon":""}`}>
                {i.image ? (
                  <Image 
                    src={i.image} 
                    alt={i.label}
                    width={52}
                    height={52}
                    className="bottom-center-image"
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : i.svg}
              </span>
              {!i.center && <span className="bottom-label">{i.label}</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  );
}
