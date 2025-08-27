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
