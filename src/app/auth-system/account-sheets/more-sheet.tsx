"use client"
import "./more-sheet.css"

export default function MoreSheet(){
  const open = (path:string) => { window.location.href = path }
  const share = () => {
    if(navigator.share){
      navigator.share({title:"UG Connect", text:"Watch movies with VJ translation - Your cinema, your language", url:window.location.origin }).catch(()=>{})
    } else {
      navigator.clipboard.writeText(window.location.origin)
    }
  }

  const kill = (e:any) => { e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.() }

  return (
    <div className="m-root" onTouchStart={kill} onPointerDown={kill}>

      <div className="m-group">
        <div className="m-list">
          <button className="m-item" onClick={share}><span className="ic">↗</span><span>Share UG Connect</span><i>›</i></button>
        </div>
      </div>

      <div className="m-group">
        <div className="m-label">Support</div>
        <div className="m-list">
          <button className="m-item" onClick={()=> open("/help")}><span className="ic">?</span><span>Help Center</span><i>›</i></button>
          <button className="m-item" onClick={()=> open("/contact")}><span className="ic">✉</span><span>Contact Us</span><i>›</i></button>
          <button className="m-item" onClick={()=> open("/feedback")}><span className="ic">☆</span><span>Rate App</span><i>›</i></button>
        </div>
      </div>

      <div className="m-group">
        <div className="m-label">Legal</div>
        <div className="m-list">
          <button className="m-item" onClick={()=> open("/privacy")}><span className="ic">◑</span><span>Privacy Policy</span><i>›</i></button>
          <button className="m-item" onClick={()=> open("/terms")}><span className="ic">≡</span><span>Terms of Service</span><i>›</i></button>
          <button className="m-item" onClick={()=> open("/about")}><span className="ic">i</span><span>About UG Connect</span><span className="ver">v2.1.0</span></button>
        </div>
      </div>

      <div className="m-foot">Made for Uganda • Your cinema, your language</div>
    </div>
  )
}
