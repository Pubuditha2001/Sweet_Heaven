import { createApiUrl } from "../utils/apiConfig.js";
// Order API helper
export async function requestOrder(payload) {
  const res = await fetch(createApiUrl(`/api/orders/request`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.error || body.message)) || "Failed to request order";
    throw new Error(message);
  }
  return res.json();
}

export async function fetchOrders() {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(createApiUrl(`/api/orders`), {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.error || body.message)) || "Failed to fetch orders";
    throw new Error(message);
  }
  return res.json();
}

export async function fetchOrderById(id) {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(createApiUrl(`/api/orders/${id}`), {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.error || body.message)) || "Failed to fetch order";
    throw new Error(message);
  }
  return res.json();
}

export async function updateOrder(id, payload) {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(createApiUrl(`/api/orders/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.error || body.message)) || "Failed to update order";
    throw new Error(message);
  }
  return res.json();
}
