// client/src/menu/menuApi.js
import { apiRequest } from "../api/apiClient";

// ---------- Categories ----------
export const fetchCategories = () => apiRequest("/categories");
export const createCategory = (data) =>
  apiRequest("/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) =>
  apiRequest(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) =>
  apiRequest(`/categories/${id}`, { method: "DELETE" });

// ---------- Sub Categories ----------
export const fetchSubCategories = (categoryId) => {
  const query = categoryId ? `?categoryId=${categoryId}` : "";
  return apiRequest(`/subcategories${query}`);
};

// ---------- Kitchen Sections ----------
export const fetchKitchenSections = () => apiRequest("/kitchen-sections");

// ---------- Menu Items ----------
export const fetchMenuItems = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/menu${query ? `?${query}` : ""}`);
};
export const createMenuItem = (data) =>
  apiRequest("/menu", { method: "POST", body: JSON.stringify(data) });
export const updateMenuItem = (id, data) =>
  apiRequest(`/menu/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMenuItem = (id) =>
  apiRequest(`/menu/${id}`, { method: "DELETE" });

// ---------- Image Upload ----------
// multipart requests bypass apiRequest's JSON header, so this posts directly
// but still needs the Bearer token from the same source apiClient uses.
export const uploadImage = async (file, folder = "menu-items") => {
  const { getAccessToken } = await import("../api/apiClient");
  const token = getAccessToken();

  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};