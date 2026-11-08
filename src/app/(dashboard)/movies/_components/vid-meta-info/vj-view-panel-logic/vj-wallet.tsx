"use client"
import { useState } from "react"
import { FatOptions } from "./fat-options"
import VJTipMomo from "./vj-tip-momo"
import VJTipPayPal from "./vj-tip-paypal"

// Tip sheet — money goes DIRECTLY to the VJ. UG Connect takes nothing.
// REAL MTN: Send -> VJTipMomo (same /init-pay + /verify polling as MtnMomo subscription flow)
// REAL PayPal: Send -> VJTipPayPal (same /create-order + /verify-order as PayPalBilling subscription flow)
// Airtel: not wired yet — shows "coming soon", Send stays disabled so no fake success.
export function VJWallet({ vjName, onClose }: { vjName: string; onClose: () => void }) {
  const [amount, setAmount] = useState<number | null>(5000)
  const [method, setMethod] = useState<"mtn" | "airtel" | "paypal">("mtn")
  const [showPay, setShowPay] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentAmount, setSentAmount] = useState<number>(0)

  if (sent) {
    return (
      <div className="vj-wallet vj-wallet-done">
        <button type="button" className="vj-wallet-close" aria-label="Close tip" onClick={onClose}>✕</button>
        <div className="vj-wallet-done-emoji">🙏</div>
        <h3>Thank you, real one.</h3>
        <p>Your <strong>UGX {sentAmount.toLocaleString()}</strong> tip is on its way to <strong>{vjName}</strong>.</p>
        <p className="vj-wallet-note">100% goes to {vjName}. UG Connect does not take a cut from VJ tips.</p>
        <button type="button" className="vj-tip-cta" onClick={onClose}>Done</button>
      </div>
    )
  }

  // STEP 2 — REAL MTN PAY (phone + push + verify polling). Back (✕) returns to amount picker.
  if (showPay && method === "mtn" && amount) {
    return (
      <div className="vj-wallet">
        <VJTipMomo
          amount={amount}
          vjName={vjName}
          onBack={() => setShowPay(false)}
          onSuccess={(tip) => { setSentAmount(tip?.amount || amount); setSent(true) }}
        />
      </div>
    )
  }

  // STEP 2 — REAL PayPal (create-order -> popup -> verify-order). Back (✕) returns to amount picker.
  if (showPay && method === "paypal" && amount) {
    return (
      <div className="vj-wallet">
        <VJTipPayPal
          amount={amount}
          vjName={vjName}
          onBack={() => setShowPay(false)}
          onSuccess={(tip) => { setSentAmount(tip?.amount || amount); setSent(true) }}
        />
      </div>
    )
  }

  // STEP 1 — pick amount + method
  return (
    <div className="vj-wallet">
      <div className="vj-wallet-head">
        <div>
          <h3 className="vj-wallet-title">Tip {vjName}</h3>
        </div>
        {/* CLOSE — user changed their mind */}
        <button type="button" className="vj-wallet-close" aria-label="Close tip, maybe later" onClick={onClose}>✕</button>
      </div>

      <FatOptions selected={amount} onSelect={setAmount} onCustom={setAmount} />

      <div className="vj-pay-methods">
        <button type="button" className={`vj-pay-btn ${method === "mtn" ? "selected" : ""}`} onClick={() => setMethod("mtn")}>MTN MoMo</button>
        <button type="button" className={`vj-pay-btn ${method === "airtel" ? "selected" : ""}`} onClick={() => setMethod("airtel")}>Airtel Money</button>
        <button type="button" className={`vj-pay-btn ${method === "paypal" ? "selected" : ""}`} onClick={() => setMethod("paypal")}>PayPal</button>
      </div>

      {method === "paypal" && amount && (
        <p className="vj-wallet-note" style={{ margin: "0 0 12px" }}>PayPal ≈ ${(amount / 3700).toFixed(2)} • Instant • For diaspora fans.</p>
      )}

      {method === "airtel" && (
        <p className="vj-wallet-note" style={{ margin: "0 0 12px" }}>Airtel Money coming soon — use MTN MoMo for now, it&apos;s live.</p>
      )}

      {/* Precise gap lives in CSS: .vj-pay-methods has margin-bottom, .vj-tip-cta is separate */}
      <button
        type="button"
        className="vj-tip-cta"
        disabled={!amount || amount < 500 || method === "airtel"}
        onClick={() => setShowPay(true)}
      >
        {method === "airtel" ? "Airtel coming soon" : method === "paypal" ? `Continue with PayPal →` : amount ? `Send UGX ${amount.toLocaleString()} Tip →` : "Choose an amount"}
      </button>
      <button type="button" className="vj-wallet-later" onClick={onClose}>Maybe later</button>
      <p className="vj-wallet-note">🔒 Secure payment &nbsp;•&nbsp; 100% to the VJ &nbsp;•&nbsp; UG Connect takes 0%</p>
    </div>
  )
}

