"use client";
import React, { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./paypal-billing.css";

const BILLING_URL = "https://pay-pal-billing-server.connectu89.workers.dev";
const PAYPAL_CLIENT_ID = "AclG3ZrH-saUXVNYbG9644z9EpRUHESFbmOB6v1RM4GFdKWKYLYrHq9kBLM0iWOpaRcqJ4T47S00yH8D";

type PlanId = "weekly" | "monthly" | "yearly";

interface Props {
  planId: PlanId;
  onSuccess?: (sub: any) => void;
  onError?: (err: string) => void;
  onClose?: () => void;
}

export default function PayPalBilling({ planId, onSuccess, onError, onClose }: Props) {
  const [status, setStatus] = useState<"idle" | "creating" | "capturing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const getDeviceId = () => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("ug_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ug_device_id", id);
    }
    return id;
  };

  const getAccountId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("ugc_account_id") || localStorage.getItem("account_id") || null;
  };

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="paypal-wrap">
        <div className="paypal-error">Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID</div>
      </div>
    );
  }

  return (
    <div className="paypal-wrap">
      <div className="paypal-header">
        <div className="paypal-plan-badge">{planId.toUpperCase()} • SECURE</div>
        <h3 className="paypal-title">Pay with PayPal</h3>
        <p className="paypal-desc">Instant activation • Encrypted</p>
      </div>

      {status === "creating" && <div className="paypal-status">Creating secure order...</div>}
      {status === "capturing" && <div className="paypal-status">Verifying payment...</div>}
      {status === "error" && <div className="paypal-error">{errorMsg}</div>}
      {status === "success" && <div className="paypal-success">✓ Payment successful! Activating...</div>}

      <div className="paypal-buttons">
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture", components: "buttons" }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "white", shape: "rect", label: "paypal", height: 48 }}
            disabled={status !== "idle" && status !== "error"}
            createOrder={async () => {
              try {
                setStatus("creating");
                setErrorMsg("");
                const deviceId = getDeviceId();
                const accountId = getAccountId();
                const res = await fetch(`${BILLING_URL}/create-order`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planId, deviceId, accountId }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to create order");
                setStatus("idle");
                return data.orderId as string;
              } catch (e: any) {
                setStatus("error");
                setErrorMsg(e?.message || "Failed to create order");
                onError?.(e?.message || "Failed");
                throw e;
              }
            }}
            onApprove={async (data: any) => {
              try {
                setStatus("capturing");
                const deviceId = getDeviceId();
                const orderID = data?.orderID as string;
                const res = await fetch(`${BILLING_URL}/verify-order`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: orderID, deviceId }),
                });
                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.error || "Capture failed");
                localStorage.setItem("ug_subscription", JSON.stringify(result.subscription));
                localStorage.setItem("ug_has_subscription", "true");
                window.dispatchEvent(new CustomEvent("ug-subscription-updated", { detail: result.subscription }));
                setStatus("success");
                setTimeout(() => onSuccess?.(result.subscription), 800);
              } catch (e: any) {
                setStatus("error");
                setErrorMsg(e?.message || "Verification failed");
                onError?.(e?.message);
              }
            }}
            onCancel={() => {
              // FIX: only reset status, don't call onClose - prevents cancel modal sneak on PayPal popup close
              setStatus("idle");
            }}
            onError={(err: any) => {
              console.error("PayPal error", err);
              setStatus("error");
              setErrorMsg("PayPal error. Please try again.");
              onError?.("PayPal error");
            }}
          />
        </PayPalScriptProvider>
      </div>

      <div className="paypal-footer">
        <span className="paypal-secure">🔒 Secure by PayPal</span>
        <span>• Instant • Cancel anytime</span>
      </div>
    </div>
  );
}

