"use client"
import { useState } from "react"

// VJ TIP — TRUE MTN MoMo, copied 1:1 from MtnMomo (subscription) logic:
// POST /init-pay -> poll GET /verify?txRef= -> REAL MTN GET /requesttopay/{id}
// Differences from subscription version:
//  - sends { type:"tip", amount, vjName } NOT a weekly/monthly/yearly plan
//  - on success does NOT set ug_subscription / ug_has_subscription (this is a tip, not a sub)
//  - dispatches "ug-vj-tip-success" + stores receipt in ug_vj_tips
const MTN_BILLING_URL = process.env.NEXT_PUBLIC_MTN_BILLING_URL || "https://mtn-billing-api.connectu89.workers.dev"

type Props = {
  amount: number
  vjName: string
  onSuccess?: (tip: any) => void
  onError?: (err: string) => void
  onBack?: () => void
}

export default function VJTipMomo({ amount, vjName, onSuccess, onError, onBack }: Props) {
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "success" | "error">("idle")
  const [msg, setMsg] = useState("")
  const [txRef, setTxRef] = useState("")
  const [mtnRaw, setMtnRaw] = useState<any>(null)

  const getDeviceId = () => {
    let id = localStorage.getItem("ug_device_id")
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("ug_device_id", id) }
    return id
  }

  const normalizeForDisplay = (p: string) => {
    const n = p.replace(/[^0-9]/g, "")
    if (n.startsWith("467")) return n
    if (n.startsWith("0")) return "256" + n.slice(1)
    if (n.startsWith("7")) return "256" + n
    return n
  }

  const initPay = async () => {
    if (!phone || phone.replace(/[^0-9]/g, "").length < 9) {
      setMsg("Enter valid number e.g. 0777123456 or 46733123454")
      setStatus("error")
      return
    }
    setStatus("sending")
    setMsg(`Calling ${MTN_BILLING_URL}/init-pay...`)
    setMtnRaw(null)
    try {
      const deviceId = getDeviceId()
      const res = await fetch(`${MTN_BILLING_URL}/init-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ⚠️ WORKER: your /init-pay must accept type:"tip" + amount + vjName.
        // If it only accepts planId today, add: if (body.type === "tip") charge body.amount to body.vjName.
        // We still send planId:"tip" so old validation that requires planId doesn't 400.
        body: JSON.stringify({ planId: "tip", type: "tip", amount, vjName, phone, deviceId }),
      })
      const data = await res.json()
      setMtnRaw(data)
      if (!res.ok) throw new Error(data.error || data.mtn_error || "MTN init failed")

      setTxRef(data.txRef)
      const normalized = normalizeForDisplay(phone)
      setMsg(data.mock
        ? `Sandbox: ${data.message} | Ref: ${data.txRef.slice(0, 8)}... | Phone: ${normalized}`
        : `Real push sent to ${normalized}! Approve on phone *165# | Ref: ${data.txRef.slice(0, 8)}...`
      )
      setStatus("verifying")

      // TRUE polling — worker /verify calls REAL MTN GET /requesttopay/{id}
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        if (attempts > 40) {
          clearInterval(poll)
          setStatus("error")
          setMsg(`Timeout - MTN status still ${mtnRaw?.status || "PENDING"}. Check ${MTN_BILLING_URL}/verify?txRef=${data.txRef}`)
          return
        }
        try {
          const v = await fetch(`${MTN_BILLING_URL}/verify?txRef=${data.txRef}`)
          const j = await v.json()
          setMtnRaw(j)

          if (j.status === "success") {
            clearInterval(poll)
            // TIP receipt — NOT a subscription. Never set ug_subscription here.
            const tip = {
              id: data.txRef,
              type: "tip",
              amount,
              vjName,
              status: "success",
              provider: "mtn",
              provider_ref: data.txRef,
              phone: j.tx?.phone || normalized,
              created_at: new Date().toISOString(),
            }
            try {
              const prev = JSON.parse(localStorage.getItem("ug_vj_tips") || "[]")
              prev.push(tip)
              localStorage.setItem("ug_vj_tips", JSON.stringify(prev))
            } catch {}
            window.dispatchEvent(new CustomEvent("ug-vj-tip-success", { detail: tip }))
            setStatus("success")
            setMsg(`✓ TRUE MTN SUCCESS! MTN status: ${j.mtn?.status || "SUCCESSFUL"} | UGX ${amount.toLocaleString()} tip to ${vjName}`)
            setTimeout(() => onSuccess?.(tip), 1200)
          } else if (j.status === "failed") {
            clearInterval(poll)
            setStatus("error")
            setMsg(`MTN FAILED: ${j.mtn?.reason || j.mtn?.status || "Declined"} | Ref: ${data.txRef}`)
            onError?.(j.mtn?.reason || "Failed")
          } else {
            setMsg(`Waiting... MTN: ${j.mtn?.status || j.status} | Attempt ${attempts}/40 | Ref: ${data.txRef.slice(0, 8)} | Phone: ${j.tx?.phone || normalized}`)
          }
        } catch (e) {
          console.error("verify poll error", e)
        }
      }, 3000)
    } catch (e: any) {
      setStatus("error")
      setMsg(`TRUE ERROR: ${e.message}`)
      onError?.(e.message)
    }
  }

  return (
    <div className="vj-tip-pay">
      <div className="vj-tip-pay-head">
        <div>
          <div className="vj-tip-pay-badge">UGX {amount.toLocaleString()} TIP • MTN MoMo • TRUE API</div>
          <h3 className="vj-tip-pay-title">Pay {vjName} with MTN MoMo</h3>
          <p className="vj-tip-pay-desc">Secure • Real MTN: {MTN_BILLING_URL.replace("https://", "").slice(0, 25)}...</p>
        </div>
        {onBack && <button type="button" className="vj-wallet-close" aria-label="Back to amount" onClick={onBack}>✕</button>}
      </div>

      {status !== "idle" && <div className="vj-tip-pay-status" style={{ fontSize: "12px", wordBreak: "break-all" }}>{msg || status}</div>}
      {status === "error" && <div className="vj-tip-pay-error" style={{ fontSize: "12px", wordBreak: "break-all" }}>{msg}</div>}
      {status === "success" && <div className="vj-tip-pay-success">{msg}</div>}

      <div className="mtn-input-wrap" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="tel"
          placeholder="0777123456 or 46733123454 (sandbox)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            padding: "14px", borderRadius: "12px", background: "hsl(var(--surface))",
            border: "1px solid hsl(var(--border))", color: "hsl(var(--text))", fontSize: "16px", width: "100%", boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={initPay}
          disabled={status === "sending" || status === "verifying"}
          className="vj-tip-cta"
          style={{ color: "#fff" }}
        >
          {status === "sending" ? "Calling MTN API..." : status === "verifying" ? `Polling MTN... ${txRef.slice(0, 8)}...` : `Pay UGX ${amount.toLocaleString()} Tip with MoMo`}
        </button>
        {txRef && <div style={{ fontSize: "10px", opacity: 0.6 }}>Tx: {txRef}</div>}
      </div>

      <div className="vj-tip-pay-footer">
        <span>🔒 MTN {mtnRaw?.mock === false ? "LIVE" : "SANDBOX"} • Real API</span>
        <span>• *165# • {status}</span>
      </div>
    </div>
  )
}

