export function attachNoonScroll(el: HTMLDivElement) {
  let isDown = false, startX = 0, startScroll = 0, vel = 0, lastX = 0, lastT = 0, raf = 0;
  let prevBodySelect = "";
  let prevBodyCursor = "";
  let overshoot = 0; // how far past edge we stretched, for rubber-band
  let bouncing = false;

  const kill = () => cancelAnimationFrame(raf);

  const lockSelection = () => {
    prevBodySelect = document.body.style.userSelect;
    prevBodyCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    (document.body.style as any).webkitUserSelect = "none";
    document.body.style.cursor = "grabbing";
    el.style.userSelect = "none";
    (el.style as any).webkitUserSelect = "none";
    el.style.cursor = "grabbing";
  };

  const unlockSelection = () => {
    document.body.style.userSelect = prevBodySelect;
    (document.body.style as any).webkitUserSelect = "";
    document.body.style.cursor = prevBodyCursor;
    el.style.userSelect = "";
    (el.style as any).webkitUserSelect = "";
    el.style.cursor = "";
  };

  const getMax = () => Math.max(0, el.scrollWidth - el.clientWidth);

  // RUBBER-BAND: animate transform back to 0
  const bounceBack = () => {
    if (overshoot === 0) return;
    bouncing = true;
    el.style.transition = "transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1)";
    el.style.transform = "translateX(0px)";
    const done = () => {
      el.style.transition = "";
      el.style.transform = "";
      overshoot = 0;
      bouncing = false;
      el.removeEventListener("transitionend", done);
    };
    el.addEventListener("transitionend", done);
    // Fallback if transitionend doesn't fire
    setTimeout(done, 350);
  };

  const momentum = () => {
    const step = () => {
      vel *= 0.92;
      if (Math.abs(vel) < 0.5) return;
      el.scrollLeft += vel;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const down = (x: number) => {
    kill();
    // Kill any in-flight bounce so new drag feels instant
    el.style.transition = "";
    el.style.transform = "";
    overshoot = 0;
    bouncing = false;
    isDown = true;
    startX = x;
    startScroll = el.scrollLeft;
    lastX = x;
    lastT = performance.now();
    vel = 0;
    el.classList.add("dragging");
    el.classList.add("is-dragging");
    lockSelection();
  };

  const move = (x: number, e?: Event) => {
    if (!isDown) return;
    const dx = x - startX;
    if (Math.abs(dx) > 4) e?.preventDefault();
    const now = performance.now();
    const dt = now - lastT || 16;
    vel = ((x - lastX) / dt) * 16;

    const max = getMax();
    const raw = startScroll - dx; // where scrollLeft *wants* to go

    if (raw < 0) {
      // RUBBER-BAND LEFT EDGE: stretch with resistance
      el.scrollLeft = 0;
      overshoot = raw; // negative
      el.style.transform = `translateX(${(-overshoot * 0.35).toFixed(1)}px)`;
    } else if (raw > max) {
      // RUBBER-BAND RIGHT EDGE: stretch with resistance
      el.scrollLeft = max;
      overshoot = raw - max; // positive
      el.style.transform = `translateX(${(-overshoot * 0.35).toFixed(1)}px)`;
    } else {
      // Normal scroll, no stretch
      overshoot = 0;
      el.style.transform = "translateX(0px)";
      el.scrollLeft = raw;
    }

    lastX = x;
    lastT = now;
  };

  const up = () => {
    if (!isDown) return;
    isDown = false;
    el.classList.remove("dragging");
    el.classList.remove("is-dragging");
    unlockSelection();

    // If we stretched past edge, bounce back — no momentum
    if (overshoot !== 0) {
      bounceBack();
      vel = 0;
      return;
    }

    if (Math.abs(vel) > 2) { vel = -vel; momentum(); }
  };

  const onSelectStart = (e: Event) => { if (isDown) e.preventDefault(); };
  const onDragStart = (e: Event) => { e.preventDefault(); };

  const md = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.l-a-btn')) return;
    e.preventDefault();
    down(e.pageX);
  };
  const mm = (e: MouseEvent) => move(e.pageX, e);
  const mu = () => up();
  const td = (e: TouchEvent) => {
    if ((e.target as HTMLElement).closest('.l-a-btn')) return;
    down(e.touches[0].pageX);
  };
  const tm = (e: TouchEvent) => move(e.touches[0].pageX, e);

  el.addEventListener("mousedown", md);
  window.addEventListener("mousemove", mm as any, { passive: false } as any);
  window.addEventListener("mouseup", mu);
  window.addEventListener("mouseleave", mu);
  el.addEventListener("touchstart", td as any, { passive: true } as any);
  el.addEventListener("touchmove", tm as any, { passive: false } as any);
  el.addEventListener("touchend", up as any);
  el.addEventListener("touchcancel", up as any);
  document.addEventListener("selectstart", onSelectStart);
  el.addEventListener("dragstart", onDragStart);

  return () => {
    kill();
    unlockSelection();
    el.removeEventListener("mousedown", md);
    window.removeEventListener("mousemove", mm as any);
    window.removeEventListener("mouseup", mu);
    window.removeEventListener("mouseleave", mu);
    el.removeEventListener("touchstart", td as any);
    el.removeEventListener("touchmove", tm as any);
    el.removeEventListener("touchend", up as any);
    el.removeEventListener("touchcancel", up as any);
    document.removeEventListener("selectstart", onSelectStart);
    el.removeEventListener("dragstart", onDragStart);
  };
}
