import "./noon-scroll.css";

export function attachNoonScroll(el: HTMLDivElement) {
  const s = el.style as any;

  s.overflowX = "auto";
  s.overflowY = "hidden";
  s.display = "flex";
  s.scrollSnapType = "x mandatory";
  s.webkitOverflowScrolling = "touch";
  s.scrollbarWidth = "none";
  s.msOverflowStyle = "none";
  s.overscrollBehaviorX = "auto";
  s.touchAction = "pan-x pan-y";
  s.transform = "";
  s.transition = "";
  s.cursor = "";
  el.classList.add("noon-scroll"); // <-- was noon-native-scroll, fixed

  Array.from(el.children).forEach((child) => {
    (child as HTMLElement).style.scrollSnapAlign = "start";
  });

  return () => {
    el.classList.remove("noon-scroll");
  };
}
