// src/pos/api/posApi.js
//
// Routes every call through the app's shared apiClient (same one
// auth/authService.js uses) so the access token is attached automatically,
// and a 401 triggers the existing silent-refresh-and-retry flow instead of
// just failing. Do NOT use a plain fetch() here — it silently bypasses auth.
import { apiRequest } from "../../api/apiClient";

async function request(path, options = {}) {
  const { ok, data } = await apiRequest(path, options);
  if (!ok) {
    // Controllers in this project return { message: "generic wrapper", error: "specific reason" } —
    // surface the specific one when present, since the generic message alone hides the real cause.
    const detail = data?.error ? `${data.message}: ${data.error}` : data?.message;
    throw new Error(detail || "Request failed");
  }
  return data;
}

// Menu module wraps responses as { success, data } — unwrap here so
// callers always get the plain payload regardless of which module they hit.
async function requestMenu(path, options = {}) {
  const body = await request(path, options);
  return body?.data !== undefined ? body.data : body;
}

export const getCategories = () => requestMenu("/categories");
export const getMenuItems = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return requestMenu(`/menu${qs ? `?${qs}` : ""}`);
};

export const getTables = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/pos/tables${qs ? `?${qs}` : ""}`);
};

export const searchCustomers = (q) => request(`/pos/customers/search?q=${encodeURIComponent(q)}`);
export const createCustomer = (payload) =>
  request("/pos/customers", { method: "POST", body: JSON.stringify(payload) });

export const createOrder = (payload) =>
  request("/pos/orders", { method: "POST", body: JSON.stringify(payload) });

export const sendToKitchen = (orderId, orderItemIds) =>
  request(`/pos/kot/orders/${orderId}`, {
    method: "POST",
    body: JSON.stringify({ orderItemIds }),
  });

export const getKitchenDisplay = (kitchenSectionId) => {
  const qs = kitchenSectionId ? `?kitchenSectionId=${kitchenSectionId}` : "";
  return request(`/pos/kot/display${qs}`);
};

export const updateKotStatus = (id, status, reason) =>
  request(`/pos/kot/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, reason }),
  });