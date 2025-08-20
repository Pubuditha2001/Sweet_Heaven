// Cake related API helpers
export async function fetchCakes() {
  const res = await fetch("/api/cakes");
  if (!res.ok) throw new Error("Failed to fetch cakes");
  return res.json();
}

export async function fetchCakeById(id) {
  const res = await fetch(`/api/cakes/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
// Admin Cake API helpers
export async function updateCake(id, cakeData) {
  const res = await fetch(`/api/cakes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cakeData),
  });
  if (!res.ok) throw new Error("Failed to update cake");
  return res.json();
}

export async function createCake(cakeData) {
  const res = await fetch(`/api/cakes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cakeData),
  });
  if (!res.ok) throw new Error("Failed to create cake");
  return res.json();
}

export async function deleteCake(id) {
  const res = await fetch(`/api/cakes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete cake");
  return res.json();
}
