"use client"
import React, { useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

// VJ TIP — PayPal, copied 1:1 from PayPalBilling (subscription) logic:
// createOrder -> PayPal popup -> onApprove -> /verify-order
// Differences from subscription version:
//  - sends { type:"tip", amount (UGX), amountUSD, vjName } NOT a weekly/monthly/yearly plan
//  - on success does NOT set ug_subscription / ug_has_subscription (tip, not a sub)
//  - dispatches "ug-vj-tip-success" + stores receipt in ug_vj_tips
const BILLING_URL = "https://pay-pal-billing-server.connectu89.workers.dev"
const PAYPAL_CLIENT_ID = "AclG3ZrH-saUXVNYbG9644z9EpRUHESFbmOB6v1RM4GFdKWKYLYrHq9kBLM0iWOpaRcqJ4T47S00yH8D"

type Props = {
  amount: number // UGX
  vjName: string
  onSuccess?: (tip: any) => void
  onError?: (err: string) => void
  onBack?: () => void
}

// UGX -> USD for PayPal display / worker. ~3700 UGX = $1.
// ⚠️ WORKER: /create-order must accept type:"tip" + amountUSD + vjName.
// If it only accepts planId today, add: if (body.type === "tip") create order for body.amountUSD, memo = tip to body.vjName.
const toUSD = (ugx: number) => Math.max(0.5, Number((ugx / 3700).toFixed(2)))

export default function VJTipPayPal({ amount, vjName, onSuccess, onError, onBack }: Props) {
  const [status, setStatus] = useState<"idle" | "creating" | "capturing" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const amountUSD = toUSD(amount)

  const getDeviceId = () => {
    if (typeof window === "undefined") return ""
    let id = localStorage.getItem("ug_device_id")
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("ug_device_id", id) }
    return id
  }
  const getAccountId = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("ugc_account_id") || localStorage.getItem("account_id") || null
  }

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="vj-tip-pay">
        <div className="vj-tip-pay-error">Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID</div>
      </div>
    )
  }

  return (
    <div className="vj-tip-pay">
      <div className="vj-tip-pay-head">
        <div>
          <div className="vj-tip-pay-badge">UGX {amount.toLocaleString()} ≈ ${amountUSD.toFixed(2)} TIP • SECURE</div>
          <h3 className="vj-tip-pay-title">Pay {vjName} with PayPal</h3>
          <p className="vj-tip-pay-desc">Instant • Encrypted • 100% to {vjName}</p>
        </div>
        {onBack && <button type="button" className="vj-wallet-close" aria-label="Back to amount" onClick={onBack}>✕</button>}
      </div>

      {status === "creating" && <div className="vj-tip-pay-status">Creating secure order...</div>}
      {status === "capturing" && <div className="vj-tip-pay-status">Verifying payment...</div>}
      {status === "error" && <div className="vj-tip-pay-error">{errorMsg}</div>}
      {status === "success" && <div className="vj-tip-pay-success">✓ Payment successful! Sending tip...</div>}

      <div className="paypal-buttons">
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture", components: "buttons" }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "white", shape: "rect", label: "paypal", height: 48 }}
            disabled={status !== "idle" && status !== "error"}
            createOrder={async () => {
              try {
                setStatus("creating")
                setErrorMsg("")
                const deviceId = getDeviceId()
                const accountId = getAccountId()
                const res = await fetch(`${BILLING_URL}/create-order`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "tip", planId: "tip", amount, amountUSD, vjName, deviceId, accountId }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Failed to create order")
                setStatus("idle")
                return data.orderId as string
              } catch (e: any) {
                setStatus("error")
                setErrorMsg(e?.message || "Failed to create order")
                onError?.(e?.message || "Failed")
                throw e
              }
            }}
            onApprove={async (data: any) => {
              try {
                setStatus("capturing")
                const deviceId = getDeviceId()
                const orderID = data?.orderID as string
                const res = await fetch(`${BILLING_URL}/verify-order`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: orderID, deviceId, type: "tip", amount, amountUSD, vjName }),
                })
                const result = await res.json()
                if (!res.ok || !result.success) throw new Error(result.error || "Capture failed")
                // TIP receipt — NOT a subscription. Never set ug_subscription here.
                const tip = {
                  id: orderID,
                  type: "tip",
                  amount,
                  amountUSD,
                  vjName,
                  status: "success",
                  provider: "paypal",
                  provider_ref: orderID,
                  created_at: new Date().toISOString(),
                }
                try {
                  const prev = JSON.parse(localStorage.getItem("ug_vj_tips") || "[]")
                  prev.push(tip)
                  localStorage.setItem("ug_vj_tips", JSON.stringify(prev))
                } catch {}
                window.dispatchEvent(new CustomEvent("ug-vj-tip-success", { detail: tip }))
                setStatus("success")
                setTimeout(() => onSuccess?.(tip), 800)
              } catch (e: any) {
                setStatus("error")
                setErrorMsg(e?.message || "Verification failed")
                onError?.(e?.message)
              }
            }}
            onCancel={() => {
              // FIX (same as subscription): only reset status, don't call onClose
              setStatus("idle")
            }}
            onError={(err: any) => {
              console.error("PayPal error", err)
              setStatus("error")
              setErrorMsg("PayPal error. Please try again.")
              onError?.("PayPal error")
            }}
          />
        </PayPalScriptProvider>
      </div>

      <div className="vj-tip-pay-footer">
        <span>🔒 Secure by PayPal</span>
        <span>• Instant • UGX {amount.toLocaleString()} ≈ ${amountUSD.toFixed(2)}</span>
      </div>
    </div>
  )
}

