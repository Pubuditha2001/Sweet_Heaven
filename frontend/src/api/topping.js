// Fetch all toppings (for filter dropdown)
export async function fetchAllToppings() {
  try {
    const res = await fetch("/api/toppings");
    if (!res.ok) return { toppings: [] };
    return res.json();
  } catch (e) {
    return { toppings: [] };
  }
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
    const res = await fetch(`/api/toppings/${ref}`);
    if (!res.ok) return { toppings: [] };
    return res.json();
  } catch (e) {
    return { toppings: [] };
  }
}
