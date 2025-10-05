// Cart.jsx - Shopping cart page (modern, responsive, theme-matching)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItemEditor from "../../components/CartItemEditor";
import CartItem from "../../components/CartItem";
import { fetchAccessoryById } from "../../api/accessory";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cart";
import { fetchToppingsByRef, fetchAllToppings } from "../../api/topping";
import { normalizeImageUrl } from "../../utils/imageUtils";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

// CartItem component moved to /components/CartItem.jsx

export default function Cart() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [accessoryDetails, setAccessoryDetails] = useState({});
  const navigate = useNavigate();

  // fetch from backend cart API using client cartId; fallback to localStorage
  useEffect(() => {
    const clientCartIdKey = "client_cart_id";
    let cartId = localStorage.getItem(clientCartIdKey);
    if (!cartId) {
      cartId = `anon_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(clientCartIdKey, cartId);
    }

    setIsLoading(true);
    getCart(cartId)
      .then(async (data) => {
        console.log("Cart data received:", data); // Debug log
        const rawItems = data.items || [];
        console.log("Raw items:", rawItems); // Debug log

        // Fetch missing accessory details for items where backend didn't return details
        const details = { ...accessoryDetails };
        await Promise.all(
          rawItems.map(async (it) => {
            if (it.productType === "accessory" && it.itemId) {
              if (!it.details && !details[it.itemId]) {
                const acc = await fetchAccessoryById(it.itemId).catch(
                  () => null
                );
                if (acc) details[it.itemId] = acc;
              }
            }
          })
        );

        // Normalize items to the shape expected by CartItem.jsx
        const normalized = await Promise.all(
          rawItems.map(async (it) => {
            const det = it.details || details[it.itemId] || {};
            const isAccessory = it.productType === "accessory";

            // Check if item is available (not hidden/deleted) - do this first
            let isAvailable = true;
            if (!det || det.isHidden === true) {
              isAvailable = false;
            }

            const name = isAvailable
              ? isAccessory
                ? det.name || det.title || "Accessory"
                : det.cakeName || det.name || "Cake"
              : isAccessory
              ? "Unavailable Accessory"
              : "Unavailable Cake";
            const image = isAccessory ? det.image : det.cakeImage || det.image;

            // For cake items, try to resolve size and topping prices
            let cake = null;
            let size = undefined;
            let sizeIndexLocal = 0;
            let unitPrice = 0;
            // helpers available in outer scope of this mapping
            const normalize = (s) =>
              (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();
            const numeric = (str) => {
              const m = (str || "").toString().match(/([\d.]+)/);
              return m ? m[1] : null;
            };
            let toppingsWithPrices = [];
            if (!isAccessory) {
              cake = det || null;

              // determine selected size: try to match stored sizeId to a price entry
              if (det && Array.isArray(det.prices) && det.prices.length > 0) {
                const storedSize = it.sizeId;
                if (storedSize) {
                  // storedSize expected to be normalized text like '1kg' or '500g'
                  const target = normalize(storedSize);
                  const idx = det.prices.findIndex(
                    (p) => normalize(p.size) === target
                  );
                  if (idx > -1) {
                    size = det.prices[idx];
                    sizeIndexLocal = idx;
                  } else {
                    // try numeric fallback (e.g. '1kg' vs '1')
                    const targetNum = numeric(storedSize);
                    if (targetNum) {
                      const idx2 = det.prices.findIndex(
                        (p) => numeric(p.size) === targetNum
                      );
                      if (idx2 > -1) {
                        size = det.prices[idx2];
                        sizeIndexLocal = idx2;
                      }
                    }
                  }
                }

                // If we still didn't find a matching size, fall back to the first price entry
                // (keeps existing behavior for legacy/edge cases). This is only used when
                // there is no stored size information on the cart item.
                if (!size) {
                  size = det.prices[0] || null;
                  sizeIndexLocal = 0;
                }

                // base cake price (do not include toppings here) -- use the selected size price
                const basePrice = size?.price || 0;
                unitPrice = basePrice;
                if (Array.isArray(it.toppings) && it.toppings.length > 0) {
                  // if cake has a toppingRef, fetch toppings doc once
                  let toppingDocs = [];
                  if (det && det.toppingRef) {
                    const td = await fetchToppingsByRef(det.toppingRef).catch(
                      () => ({ toppings: [] })
                    );
                    toppingDocs = td.toppings || [];
                  }
                  // fallback: if no toppingRef or toppingDocs empty, try fetching all toppings
                  if (!toppingDocs || toppingDocs.length === 0) {
                    const all = await fetchAllToppings().catch(() => ({
                      toppings: [],
                    }));
                    toppingDocs = all.toppings || [];
                  }

                  // for each topping id in cart, find the topping doc (by _id match) and determine price
                  for (const t of it.toppings) {
                    const tid = String(t.toppingId || t);
                    let toppingDoc =
                      toppingDocs.find((x) => String(x._id) === tid) || null;
                    if (!toppingDoc) continue;

                    // find price object by matching size string first
                    let priceObj = null;
                    const selectedSizeName =
                      size?.size || det.prices?.[0]?.size;
                    if (selectedSizeName) {
                      const target = normalize(selectedSizeName);
                      priceObj = toppingDoc.prices.find(
                        (p) => normalize(p.size) === target
                      );
                    }
                    if (!priceObj) {
                      const targetNum = numeric(
                        size?.size || det.prices?.[0]?.size
                      );
                      if (targetNum)
                        priceObj = toppingDoc.prices.find(
                          (p) => numeric(p.size) === targetNum
                        );
                    }
                    if (!priceObj) priceObj = toppingDoc.prices[0] || null;

                    toppingsWithPrices.push({
                      _id: tid,
                      toppingId: tid,
                      name: toppingDoc.name,
                      price: priceObj || { price: 0 },
                    });
                  }
                }
              }
            }

            // For accessories, the accessory doc may contain a flat `price` field.
            if (isAccessory) {
              // prefer explicit numeric fields: det.price or det.unitPrice
              unitPrice = Number(det.price ?? det.unitPrice ?? 0);
            }

            return {
              // keep both _id and id aliases (components use item.id)
              _id: it._id,
              id: it._id,
              itemId: it.itemId,
              productType: it.productType,
              productCategory: isAccessory ? "accessory" : "cake",
              qty: it.qty || 1,
              name,
              image,
              unitPrice,
              price: unitPrice,
              cake,
              size,
              // expose the resolved index so editors and UI can map back to product.prices
              sizeIndex: sizeIndexLocal,
              toppings: toppingsWithPrices.length
                ? toppingsWithPrices
                : it.toppings || [],
              accessories: it.accessories || [],
              addedAt: it.addedAt,
              isAvailable: isAvailable,
            };
          })
        );

        console.log("Normalized items:", normalized); // Debug log
        setItems(normalized);
        setAccessoryDetails(details);
      })
      .catch((error) => {
        console.error("Error loading cart:", error); // Debug log
        setItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const clientCartIdKey = "client_cart_id";

  const increase = (id) => {
    // optimistic UI update
    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
    updateCartItem(localStorage.getItem(clientCartIdKey), id, {
      qty: (items.find((i) => i.id === id)?.qty || 0) + 1,
    }).catch(() => {
      // ignore: fallback already updated local state; persist to localStorage
      const raw = localStorage.getItem("cart");
      try {
        const cart = raw && raw.length ? JSON.parse(raw) : [];
        const idx = cart.findIndex((c) => c.id === id);
        if (idx > -1) {
          cart[idx].qty = (cart[idx].qty || 0) + 1;
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } catch (e) {}
    });
  };

  const decrease = (id) => {
    setItems((s) =>
      s.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
      )
    );
    updateCartItem(localStorage.getItem(clientCartIdKey), id, {
      qty: Math.max(1, (items.find((i) => i.id === id)?.qty || 1) - 1),
    }).catch(() => {});
  };

  const remove = (id) => {
    setItems((s) => s.filter((it) => it.id !== id));
    removeCartItem(localStorage.getItem(clientCartIdKey), id).catch(() => {
      try {
        const raw = localStorage.getItem("cart");
        const cart = raw && raw.length ? JSON.parse(raw) : [];
        const next = cart.filter((c) => c.id !== id);
        localStorage.setItem("cart", JSON.stringify(next));
      } catch (e) {}
    });
  };

  const removeAccessory = (parentItemId, accessoryId) => {
    const next = items.map((it) => {
      if (it.id !== parentItemId) return it;
      const newAccessories = (it.accessories || []).filter(
        (a) => (a.id || a._id || a.name) !== accessoryId
      );
      return { ...it, accessories: newAccessories };
    });
    setItems(next);

    // Persist change for parent item
    const payload = {
      accessories:
        (next.find((i) => i.id === parentItemId) || {}).accessories || [],
    };
    updateCartItem(
      localStorage.getItem(clientCartIdKey),
      parentItemId,
      payload
    ).catch(() => {
      // fallback to localStorage
      try {
        const raw = localStorage.getItem("cart");
        const cart = raw && raw.length ? JSON.parse(raw) : [];
        const idx = cart.findIndex((c) => c.id === parentItemId);
        if (idx > -1) {
          cart[idx].accessories = payload.accessories;
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } catch (e) {}
    });
  };

  const openEditor = (item) => {
    setEditingItem(item);
  };

  const handleEditorSave = (payload) => {
    if (!editingItem) return;
    const oldId = editingItem.id;

    // Build normalized signature using unified itemId
    const norm = (arr) =>
      (arr || [])
        .map((x) => (x.id || x._id || x.name || "").toString())
        .filter(Boolean)
        .sort()
        .join(",");
    const toppingIds = norm(payload.toppings);
    const accessoryIds = norm(payload.accessories);
    const newId = `${editingItem.itemId}|type:${editingItem.productType}|size:${
      payload.sizeIndex ?? editingItem.sizeIndex
    }|t:${toppingIds}|a:${accessoryIds}`;

    // If another item already has this signature, merge quantities
    const existingIdx = items.findIndex(
      (i) => i.id === newId && i.id !== oldId
    );
    if (existingIdx > -1) {
      const next = items
        .map((it) => {
          if (it.id === newId) {
            return { ...it, qty: (it.qty || 0) + (payload.qty || 1) };
          }
          return it;
        })
        .filter((it) => it.id !== oldId);
      setItems(next);
      // update server: update existing item qty, and remove old item
      updateCartItem(localStorage.getItem(clientCartIdKey), newId, {
        qty: next[existingIdx].qty,
      }).catch(() => {});
      removeCartItem(localStorage.getItem(clientCartIdKey), oldId).catch(
        () => {}
      );
    } else {
      // update the edited item
      const updated = { ...editingItem, ...payload, id: newId };

      // If signature didn't change, update in-place via PUT to avoid remove+add
      if (newId === oldId) {
        const nextItems = items.map((it) =>
          it.id === oldId ? { ...it, ...payload } : it
        );
        setItems(nextItems);

        const cartId = localStorage.getItem(clientCartIdKey);
        try {
          const updatePayload = {
            productType: updated.productType || editingItem.productType,
            itemId: updated.itemId || editingItem.itemId,
            qty: updated.qty || 1,
            sizeId: updated.sizeId,
            toppings: updated.toppings,
          };
          updateCartItem(cartId, oldId, updatePayload).catch(() => {});
        } catch (e) {}

        // persist locally if backend fails
        try {
          const raw = localStorage.getItem("cart");
          const cart = raw && raw.length ? JSON.parse(raw) : [];
          const idx = cart.findIndex((c) => c.id === oldId);
          if (idx > -1) {
            cart[idx] = { ...cart[idx], ...payload, id: newId };
            localStorage.setItem("cart", JSON.stringify(cart));
          }
        } catch (e) {}
      } else {
        // signature changed: remove old then add new on backend to reflect id change
        const nextItems = items.map((it) => (it.id === oldId ? updated : it));
        setItems(nextItems);

        const cartId = localStorage.getItem(clientCartIdKey);
        removeCartItem(cartId, oldId)
          .catch(() => {})
          .finally(() => {
            // attempt to add updated item on backend
            try {
              const addPayload = {
                productType: updated.productType || editingItem.productType,
                itemId: updated.itemId || editingItem.itemId,
                qty: updated.qty || 1,
                sizeId: updated.sizeId,
                toppings: updated.toppings,
              };
              addCartItem(cartId, addPayload).catch(() => {});
            } catch (e) {}
          });

        // persist locally if backend fails
        try {
          const raw = localStorage.getItem("cart");
          const cart = raw && raw.length ? JSON.parse(raw) : [];
          const idx = cart.findIndex((c) => c.id === oldId);
          if (idx > -1) {
            cart[idx] = { ...cart[idx], ...payload, id: newId };
            localStorage.setItem("cart", JSON.stringify(cart));
          }
        } catch (e) {}
      }
    }
    setEditingItem(null);
  };

  const handleEditorRemove = (id) => {
    setEditingItem(null);
    remove(id);
  };

  const clear = () => {
    setItems([]);
    const cartId = localStorage.getItem(clientCartIdKey);
    if (cartId) {
      clearCart(cartId).catch(() => {
        localStorage.removeItem("cart");
      });
    } else {
      localStorage.removeItem("cart");
    }
  };

  const subtotal = items.reduce((sum, it) => {
    // Skip unavailable items from total calculation
    if (it.isAvailable === false) return sum;

    const qty = it.qty || 1;
    // unit base price
    const base = Number(it.unitPrice ?? it.price ?? 0);

    // toppings (may be objects with price.price or numeric)
    const toppingsTotal = (it.toppings || []).reduce((s, t) => {
      const p =
        t && typeof t === "object"
          ? Number(t.price?.price ?? t.price ?? 0)
          : Number(t || 0);
      return s + (isNaN(p) ? 0 : p);
    }, 0);

    // accessories attached to this item (each accessory may have .price)
    const accessoriesTotalPerUnit = (it.accessories || []).reduce(
      (s, a) => s + Number(a.price ?? 0),
      0
    );

    const itemTotal = (base + toppingsTotal + accessoriesTotalPerUnit) * qty;
    return sum + itemTotal;
  }, 0);
  const delivery = subtotal > 0 && subtotal < 1000 ? 60 : 0; // small rule
  const discount = 0; // placeholder for promo logic
  const total = subtotal + delivery - discount;

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Your Cart</h2>

        {isLoading ? (
          <div className="rounded-lg border bg-white p-8 flex flex-col items-center gap-4 text-center">
            <img
              src={normalizeImageUrl("loading.png")}
              alt="loading"
              className="w-24 h-24"
            />
            <div className="text-gray-700">Loading cart...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 flex flex-col items-center gap-6 text-center">
            <img
              src={normalizeImageUrl("/fallback.jpg")}
              alt="empty"
              className="w-44 h-44 object-cover rounded-full shadow-sm"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Add delicious cakes, toppings and accessories to get started.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/menu"
                className="px-5 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Shop Menu
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Cakes section */}
              {items.filter((i) => i.productType === "cake").length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Cakes</h3>
                  <div className="space-y-2 mt-2">
                    {items
                      .filter((i) => i.productType === "cake")
                      .map((it) => (
                        <CartItem
                          key={it._id || it.id}
                          item={it}
                          onIncrease={increase}
                          onDecrease={decrease}
                          onRemove={remove}
                          onEdit={openEditor}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* Accessories section */}
              {items.filter((i) => i.productType === "accessory").length >
                0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Accessories
                  </h3>
                  <div className="space-y-2 mt-2">
                    {items
                      .filter((i) => i.productType === "accessory")
                      .map((it) => (
                        <CartItem
                          key={it._id || it.id}
                          item={it}
                          onIncrease={increase}
                          onDecrease={decrease}
                          onRemove={remove}
                          onEdit={openEditor}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* Notice for unavailable items */}
              {items.some((item) => item.isAvailable === false) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div>
                      <h4 className="text-orange-800 font-medium">
                        ⚠️ Items Not Available
                      </h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Some items in your cart are currently unavailable and
                        won't be included in your order total. You can remove
                        them or contact us for alternatives.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => clear()}
                  className="px-4 py-2 border bg-red-500 rounded-md text-sm hover:bg-gray-50"
                >
                  Clear Cart
                </button>
                <div className="text-sm text-gray-500 text-center">
                  You can edit quantities or remove items before checkout.
                </div>
              </div> */}
            </div>

            <aside className="rounded-lg lg:mt-11 border bg-white p-6 shadow-sm w-full lg:w-auto self-start">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Order Summary</h4>
                <div className="text-sm text-gray-500">
                  {items.reduce((count, it) => {
                    const itemQty = Number(it.qty || 1);
                    const accessoryQty = (it.accessories || []).reduce(
                      (s, a) => s + Number(a.qty || 1),
                      0
                    );
                    return count + itemQty + accessoryQty;
                  }, 0)}{" "}
                  items
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Subtotal</div>
                  <div>{formatRs(subtotal)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Delivery</div>
                  <div>{delivery ? formatRs(delivery) : "Free"}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Discount</div>
                  <div>-{formatRs(discount)}</div>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <div className="text-lg font-semibold">Total</div>
                  <div className="text-xl font-bold text-pink-600">
                    {formatRs(total)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout", { state: { items } })}
                className="mt-6 w-full sm:w-full md:w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 font-medium"
              >
                Request Order
              </button>
              <div className="mt-4 text-xs text-gray-500">
                Secure checkout · Multiple payment options · Easy returns
              </div>
            </aside>
          </div>
        )}
        {editingItem && (
          <CartItemEditor
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleEditorSave}
            onRemove={handleEditorRemove}
          />
        )}
      </div>
    </div>
  );
}

// Note: CartItemEditor modal is rendered from within the Cart component when editingItem is set.
