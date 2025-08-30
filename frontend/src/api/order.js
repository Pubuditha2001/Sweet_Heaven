// Order API helper
export async function requestOrder(payload) {
  const res = await fetch(`/api/orders/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to request order");
  return res.json();
}

export async function fetchOrders() {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/orders`, { method: "GET", headers });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function fetchOrderById(id) {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/orders/${id}`, { method: "GET", headers });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function updateOrder(id, payload) {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}
