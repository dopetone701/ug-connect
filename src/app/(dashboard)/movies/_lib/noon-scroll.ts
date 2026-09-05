"use client";
export function attachNoonScroll(el: HTMLDivElement) {
  let isDown = false, startX = 0, startScroll = 0, vel = 0, lastX = 0, lastT = 0, raf = 0;
  const kill = () => cancelAnimationFrame(raf);
  const momentum = () => {
    const step = () => {
      vel *= 0.92;
      if (Math.abs(vel) < 0.5) return;
      el.scrollLeft += vel;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const down = (x:number) => { kill(); isDown=true; startX=x; startScroll=el.scrollLeft; lastX=x; lastT=performance.now(); vel=0; el.classList.add("dragging"); };
  const move = (x:number, e?: Event) => {
    if(!isDown) return;
    const dx = x-startX;
    if(Math.abs(dx)>4) e?.preventDefault();
    const now=performance.now();
    const dt=now-lastT||16;
    vel=((x-lastX)/dt)*16;
    el.scrollLeft=startScroll-dx;
    lastX=x; lastT=now;
  };
  const up = () => {
    if(!isDown) return;
    isDown=false; el.classList.remove("dragging");
    if(Math.abs(vel)>2){ vel=-vel; momentum(); }
  };
  const md=(e:MouseEvent)=>down(e.pageX);
  const mm=(e:MouseEvent)=>move(e.pageX,e);
  const td=(e:TouchEvent)=>down(e.touches[0].pageX);
  const tm=(e:TouchEvent)=>move(e.touches[0].pageX,e);

  el.addEventListener("mousedown", md);
  window.addEventListener("mousemove", mm as any, {passive:false} as any);
  window.addEventListener("mouseup", up);
  el.addEventListener("touchstart", td as any, {passive:true} as any);
  el.addEventListener("touchmove", tm as any, {passive:false} as any);
  el.addEventListener("touchend", up as any);

  return ()=> {
    kill();
    el.removeEventListener("mousedown", md);
    window.removeEventListener("mousemove", mm as any);
    window.removeEventListener("mouseup", up);
    el.removeEventListener("touchstart", td as any);
    el.removeEventListener("touchmove", tm as any);
    el.removeEventListener("touchend", up as any);
  };
}
