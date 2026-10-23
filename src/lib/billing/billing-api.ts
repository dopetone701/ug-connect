const PAYPAL_WORKER = "https://pay-pal-billing-server.connectu89.workers.dev";
const MTN_WORKER = "https://mtn-billing-api.connectu89.workers.dev";
const AIRTEL_WORKER = "https://airtel-billing-api.connectu89.workers.dev";

export async function getSubscriptionStatus(deviceId: string) {
  try {
    const res = await fetch(PAYPAL_WORKER + "/status?device_id=" + deviceId);
    return await res.json();
  } catch {
    return { isPremium: false };
  }
}

export async function createPayPalOrder(planId: string, deviceId: string) {
  const res = await fetch(PAYPAL_WORKER + "/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, device_id: deviceId })
  });
  return await res.json();
}

export async function verifyPayPalOrder(orderId: string, deviceId: string) {
  const res = await fetch(PAYPAL_WORKER + "/paypal/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, device_id: deviceId })
  });
  return await res.json();
}

export async function initMoMoPayment(provider: "mtn" | "airtel", planId: string, phone: string, deviceId: string) {
  const worker = provider === "mtn" ? MTN_WORKER : AIRTEL_WORKER;
  const res = await fetch(worker + "/momo/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, phone, device_id: deviceId, provider })
  });
  return await res.json();
}

export async function verifyMoMo(provider: "mtn" | "airtel", txRef: string) {
  const worker = provider === "mtn" ? MTN_WORKER : AIRTEL_WORKER;
  const res = await fetch(worker + "/momo/verify?txRef=" + txRef);
  return await res.json();
}

