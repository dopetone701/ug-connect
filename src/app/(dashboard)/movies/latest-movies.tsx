"use client";
import { useEffect, useState, useRef } from "react";
import "./latest-movies.css";

type movie = {
  id: string;
  title: string;
  genre: string;
  vj: string;
  description: string;
  cover_url: string;
  video_url: string;
  preview_urls?: string[];
};

const play_svg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>`;

export default function latestmovies() {
  const [movies, setmovies] = useState<movie[]>([]);
  const trackref = useRef<HTMLDivElement>(null);
  const cardsref = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("https://movie-server-api.connectu89.workers.dev/api/movies/latest")
     .then((r) => r.json())
     .then((d) => {
        console.log("movies loaded", d);
        setmovies(d);
      })
     .catch((e) => console.error("fetch fail", e));
  }, []);

  useEffect(() => {
    if (!movies.length ||!trackref.current) return;
    let current = Math.floor(movies.length / 2);

    const getoffset = (i: number) => {
      let d = i - current;
      const len = movies.length;
      if (d > len / 2) d -= len;
      if (d < -len / 2) d += len;
      return d;
    };

    const update = () => {
  cardsref.current.forEach((c, i) => {
    if (!c) return;
    const o = getoffset(i);
    const abs = Math.abs(o);
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      c.style.transform = `translate(-50%,-50%) translateX(${o * 108}%) scale(${abs < 0.5 ? 1 : 0.86})`;
    } else {
      // deeper 3d lift
      c.style.transform = `translate(-50%,-50%) translateX(${o * 135}%) translateZ(${ -abs * 180 }px) rotateY(${o * -18}deg) scale(${1 - abs * 0.18})`;
    }
    c.style.opacity = `${Math.max(0.2, 1 - abs * 0.55)}`;
    c.style.zIndex = `${100 - Math.abs(Math.round(o * 10))}`;
    c.classList.toggle("is-active", Math.round(o) === 0);
  });
};


    const animateto = (t: number) => {
      const s = current, len = movies.length;
      let d = t - s;
      if (d > len / 2) d -= len;
      if (d < -len / 2) d += len;
      const dur = 380, st = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - st) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        current = s + d * e;
        update();
        if (p < 1) requestAnimationFrame(tick);
        else { current = (t + len) % len; update(); }
      };
      requestAnimationFrame(tick);
    };

    let startx = 0, isdrag = false, startcurrent = 0;
    const root = trackref.current;

    const onstart = (x: number) => { startx = x; startcurrent = current; isdrag = true; };
    const onmove = (x: number) => { if (!isdrag) return; const dx = x - startx; current = startcurrent - dx / 110; update(); };
    const onend = (x: number) => {
      if (!isdrag) return; isdrag = false;
      const dx = x - startx;
      if (Math.abs(dx) > 50) animateto(dx < 0? Math.round(current + 1) : Math.round(current - 1));
      else animateto(Math.round(current));
    };

    root.addEventListener("touchstart", (e) => onstart(e.touches[0].clientX), { passive: true } as any);
    root.addEventListener("touchmove", (e) => onmove(e.touches[0].clientX), { passive: false } as any);
    root.addEventListener("touchend", (e) => onend(e.changedTouches[0].clientX));

    root.addEventListener("mousedown", (e) => onstart(e.clientX));
    window.addEventListener("mousemove", (e) => { if(isdrag) onmove(e.clientX); });
    window.addEventListener("mouseup", (e) => { if(isdrag) onend(e.clientX); });

    update();

    // click to center
    cardsref.current.forEach((c, i) => {
      if (!c) return;
      c.onclick = (ev: any) => {
        if (ev.target.closest(".l-play,.l-preview")) return;
        animateto(i);
      };
    });
  }, [movies]);

  if (!movies.length) {
    return (
      <div id="latest-mount">
        <div className="latest-head"><h2>latest movies</h2></div>
        <div style={{ padding: "20px", color: "hsl(var(--text-muted))", fontSize: "12px" }}>loading movies...</div>
      </div>
    );
  }

  return (
    <div id="latest-mount">
      <div className="latest-head"><h2>latest movies</h2></div>
      <div ref={trackref} className="latest-track">
        {movies.map((m, i) => (
          <div
            key={m.id}
            ref={(el) => { cardsref.current[i] = el; }}
            className="latest-card"
          >
            <div className="latest-cover">
              <img
                src={m.cover_url}
                alt={m.title}
                onError={(e: any) => e.target.src = `https://picsum.photos/seed/${m.id}/600/900`}
              />
              <div className="latest-fade" />
              <div className="latest-bottom">
                <button className="l-play" dangerouslySetInnerHTML={{ __html: play_svg }} onClick={() => window.open(m.video_url, "_blank")} />
                <button className="l-preview" onClick={() => window.open(m.preview_urls?.[0]? `https://movie-server-api.connectu89.workers.dev/r2/${m.preview_urls[0]}` : m.video_url, "_blank")}>preview</button>
              </div>
            </div>
            <div className="latest-under">
              <div className="l-title">{m.title}</div>
              <div className="l-meta"><span>{m.genre}</span><span>•</span><span>{m.vj}</span></div>
              <div className="l-desc">{m.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
