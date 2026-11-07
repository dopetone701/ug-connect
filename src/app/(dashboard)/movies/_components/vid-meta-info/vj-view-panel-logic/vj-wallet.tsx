"use client"
import { useState } from "react"
import { FatOptions } from "./fat-options"

// Tip sheet — money goes DIRECTLY to the VJ. UG Connect takes nothing.
// TODO: wire this to your real payment worker (MTN MoMo / Airtel Money).
export function VJWallet({ vjName, onClose }: { vjName: string; onClose: () => void }) {
  const [amount, setAmount] = useState<number | null>(5000)
  const [method, setMethod] = useState<"mtn" | "airtel">("mtn")
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="vj-wallet vj-wallet-done">
        <button type="button" className="vj-wallet-close" aria-label="Close tip" onClick={onClose}>✕</button>
        <div className="vj-wallet-done-emoji">🙏</div>
        <h3>Thank you, real one.</h3>
        <p>Your <strong>UGX {(amount || 0).toLocaleString()}</strong> tip is on its way to <strong>{vjName}</strong>.</p>
        <p className="vj-wallet-note">100% goes to {vjName}. UG Connect does not take a cut from VJ tips.</p>
        <button type="button" className="vj-tip-cta" onClick={onClose}>Done</button>
      </div>
    )
  }

  return (
    <div className="vj-wallet">
      <div className="vj-wallet-head">
        <div>
          <h3 className="vj-wallet-title">Tip {vjName}</h3>
          <p className="vj-wallet-sub">Your appreciation goes straight into {vjName}&apos;s pocket — not ours.</p>
        </div>
        {/* CLOSE — user changed their mind */}
        <button type="button" className="vj-wallet-close" aria-label="Close tip, maybe later" onClick={onClose}>✕</button>
      </div>

      <FatOptions selected={amount} onSelect={setAmount} onCustom={setAmount} />

      <div className="vj-pay-methods">
        <button type="button" className={`vj-pay-btn ${method === "mtn" ? "selected" : ""}`} onClick={() => setMethod("mtn")}>MTN MoMo</button>
        <button type="button" className={`vj-pay-btn ${method === "airtel" ? "selected" : ""}`} onClick={() => setMethod("airtel")}>Airtel Money</button>
      </div>

      {/* Precise gap lives in CSS: .vj-pay-methods has margin-bottom, .vj-tip-cta is separate */}
      <button
        type="button"
        className="vj-tip-cta"
        disabled={!amount || amount < 500}
        onClick={() => setSent(true)}
      >
        {amount ? `Send UGX ${amount.toLocaleString()} Tip →` : "Choose an amount"}
      </button>
      <button type="button" className="vj-wallet-later" onClick={onClose}>Maybe later</button>
      <p className="vj-wallet-note">🔒 Secure payment &nbsp;•&nbsp; 100% to the VJ &nbsp;•&nbsp; UG Connect takes 0%</p>
    </div>
  )
}

