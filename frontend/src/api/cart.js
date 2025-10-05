import { createApiUrl } from "../utils/apiConfig.js";
// Cart API helpers
export async function getCart(cartId) {
  const res = await fetch(
    createApiUrl(`/api/cart/${encodeURIComponent(cartId)}`)
  );
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addCartItem(cartId, item) {
  const res = await fetch(
    createApiUrl(`/api/cart/${encodeURIComponent(cartId)}/items`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }
  );
  if (!res.ok) throw new Error("Failed to add cart item");
  return res.json();
}

export async function updateCartItem(cartId, itemId, body) {
  const res = await fetch(
    `/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(
      itemId
    )}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function removeCartItem(cartId, itemId) {
  const res = await fetch(
    `/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(
      itemId
    )}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
}

export async function clearCart(cartId) {
  const res = await fetch(
    createApiUrl(`/api/cart/${encodeURIComponent(cartId)}`),
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
}
