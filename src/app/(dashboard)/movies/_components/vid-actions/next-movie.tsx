"use client";

export default function NextMovie({ 
  currentIndex=0, 
  total=5, 
  isSeries=false, 
  autoPlayOn=false, 
  onNext, 
  onPrev, 
  onToggleAutoPlay 
}: any) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const hasContent = total > 1;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      
      {/* PREV - TEXT */}
      {hasContent && !isFirst && (
        <button 
          onClick={e=>{e.stopPropagation(); onPrev?.();}}
          style={{ background:"transparent", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}
        >
          Prev
        </button>
      )}

      {/* NEXT - TEXT */}
      {hasContent && !isLast && (
        <button 
          onClick={e=>{e.stopPropagation(); onNext?.();}}
          style={{ background:"transparent", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}
        >
          Next
        </button>
      )}

      {/* AUTOPLAY - PILL (single) */}
      {isSeries && (
        <button
          onClick={e=>{e.stopPropagation(); onToggleAutoPlay?.(!autoPlayOn);}}
          style={{
            width:44,height:24,borderRadius:999,
            background:autoPlayOn?"white":"rgba(255,255,255,0.35)",
            border:"none",display:"flex",alignItems:"center",padding:2,cursor:"pointer"
          }}
        >
          <div style={{
            width:20,height:20,borderRadius:"50%",
            background:autoPlayOn?"black":"white",
            transform:autoPlayOn?"translateX(20px)":"translateX(0)",
            transition:"0.25s",display:"flex",alignItems:"center",justifyContent:"center"
          }}>
            <div style={{width:0,height:0,borderLeft:"6px solid currentColor",borderTop:"4px solid transparent",borderBottom:"4px solid transparent",color:autoPlayOn?"white":"black",marginLeft:1}} />
          </div>
        </button>
      )}
    </div>
  );
}
