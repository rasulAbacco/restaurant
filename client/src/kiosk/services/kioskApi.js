// ==============================================
// src/kiosk/services/kioskApi.js
// ==============================================
// Thin fetch wrapper around the kiosk backend module (server/src/kiosk/*).
// Every kiosk device sends its device key with each request; set it once
// via setKioskDeviceKey() at app startup (e.g. read from a config file
// baked into the kiosk build, or from localStorage set during setup).

const API_BASE =
  import.meta.env?.VITE_KIOSK_API_URL || "http://localhost:5001/api/kiosk";

let deviceKey = import.meta.env?.VITE_KIOSK_DEVICE_KEY || "";
let storeName = import.meta.env?.VITE_KIOSK_STORE || "Main Store";

console.log("=== KIOSK FRONTEND DEBUG ===");
console.log("API_BASE:", API_BASE);
console.log("deviceKey:", deviceKey);
console.log("All Vite env:", import.meta.env);
console.log("============================");

export const setKioskDeviceKey = (key) => {
  deviceKey = key;
};

export const setKioskStore = (name) => {
  storeName = name;
};

class KioskApiError extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request(path, options = {}) {
  console.log("Sending request to:", `${API_BASE}${path}`);
  console.log("Sending x-kiosk-key:", deviceKey);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-kiosk-key": deviceKey,
      ...(options.headers || {}),
    },
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok || !body?.success) {
    throw new KioskApiError(
      body?.message || `Request failed (${res.status})`,
      res.status,
      body?.errors,
    );
  }

  return body.data;
}

// ---------- Menu ----------

export const fetchKioskMenu = () => request("/menu");

export const fetchAddOnsForItem = (menuItemId) =>
  request(`/menu/${menuItemId}/addons`);

// ---------- Tables ----------

export const fetchTables = (store = storeName) =>
  request(`/tables?store=${encodeURIComponent(store)}`);

// ---------- Orders ----------

export const createOrder = (payload) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify({ store: storeName, ...payload }),
  });

export const fetchOrder = (orderId) => request(`/orders/${orderId}`);

export const cancelOrder = (orderId) =>
  request(`/orders/${orderId}/cancel`, { method: "POST" });

// ---------- Payment: Cash ----------

// Cash-only now — UPI and Card go through the dedicated Razorpay endpoints
// below. Passing method "UPI"/"CARD" here will be rejected by the backend.
export const payOrder = (orderId, payload) =>
  request(`/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ---------- Payment: UPI (Razorpay QR Code) ----------

export const fetchUpiQr = (orderId) => {
  console.log("fetchUpiQr called with orderId:", orderId);
  return request(`/orders/${orderId}/upi-qr`);
};

// Poll this every few seconds while the QR is on screen (see KioskQrScan.jsx).
// Returns { paid: boolean, order?: <order> }.
export const fetchUpiQrStatus = (orderId) =>
  request(`/orders/${orderId}/upi-qr/status`);

// ---------- Payment: Card (Razorpay Checkout) ----------

// Returns { razorpayOrderId, amount, currency, keyId, orderNumber } — used
// to open Razorpay's Checkout.js popup on the kiosk screen.
export const createCardOrder = (orderId) =>
  request(`/orders/${orderId}/card-order`, { method: "POST" });

// payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// from Razorpay Checkout's success handler. Server verifies the signature
// before marking the order paid.
export const verifyCardPayment = (orderId, payload) =>
  request(`/orders/${orderId}/card-order/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export { KioskApiError };
