import { createApiUrl } from "../utils/apiConfig.js";
// Fetch all toppings (for filter dropdown)
export async function fetchAllToppings() {
  try {
    const res = await fetch(createApiUrl("/api/toppings"));
    if (!res.ok) return { toppings: [] };
    return res.json();
  } catch (e) {
    return { toppings: [] };
  }
}

export async function fetchHiddenToppings() {
  const res = await fetch(createApiUrl("/api/toppings/hidden/all"));
  if (!res.ok) throw new Error("Failed to fetch hidden toppings");
  return res.json();
}

// Topping related API helpers
export async function fetchToppingsByRef(ref) {
  // Avoid calling the backend for missing or invalid refs.
  if (!ref) return { toppings: [] };
  // simple ObjectId validation (24 hex chars)
  const isValidObjectId =
    typeof ref === "string" && /^[a-fA-F0-9]{24}$/.test(ref);
  if (!isValidObjectId) return { toppings: [] };

  try {
    const res = await fetch(createApiUrl(`/api/toppings/${ref}`));
    if (!res.ok) return { toppings: [] };
    return res.json();
  } catch (e) {
    return { toppings: [] };
  }
}

// Fetch topping collection by ID
export async function fetchToppingById(id) {
  if (!id) return null;

  try {
    const res = await fetch(createApiUrl(`/api/toppings/${id}`));
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

// Create new topping collection
export async function createToppingCollection(toppingData) {
  const res = await fetch(createApiUrl("/api/toppings"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toppingData),
  });
  if (!res.ok) {
    throw new Error(`Failed to create topping collection: ${res.statusText}`);
  }
  return res.json();
}

// Update topping collection
export async function updateToppingCollection(id, toppingData) {
  const res = await fetch(createApiUrl(`/api/toppings/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toppingData),
  });
  if (!res.ok) {
    throw new Error(`Failed to update topping collection: ${res.statusText}`);
  }
  return res.json();
}

// Delete topping collection
export async function deleteToppingCollection(id) {
  const res = await fetch(createApiUrl(`/api/toppings/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete topping collection: ${res.statusText}`);
  }
  return res.json();
}

export async function hideToppingCollection(id, isHidden = true) {
  const res = await fetch(createApiUrl(`/api/toppings/${id}/hide`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHidden }),
  });
  if (!res.ok) throw new Error("Failed to hide/unhide topping collection");
  return res.json();
}
