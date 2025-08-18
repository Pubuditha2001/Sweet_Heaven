// Cart.jsx - Shopping cart page (modern, responsive, theme-matching)
import React, { useEffect, useState } from "react";
import CartItemEditor from "../../components/CartItemEditor";
import CartItem from "../../components/CartItem";
import AccessoryRow from "../../components/AccessoryRow";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cart";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

// CartItem component moved to /components/CartItem.jsx

export default function Cart() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  // fetch from backend cart API using client cartId; fallback to localStorage
  useEffect(() => {
    const clientCartIdKey = "client_cart_id";
    let cartId = localStorage.getItem(clientCartIdKey);
    if (!cartId) {
      cartId = `anon_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(clientCartIdKey, cartId);
    }

    getCart(cartId)
      .then((data) => setItems((data.items || []).map((it) => ({ ...it }))))
      .catch(() => {
        try {
          const raw = localStorage.getItem("cart");
          if (raw) setItems(JSON.parse(raw));
          else setItems([]);
        } catch (e) {
          setItems([]);
        }
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

    // Build normalized signature same as ProductView
    const norm = (arr) =>
      (arr || [])
        .map((x) => (x.id || x._id || x.name || "").toString())
        .filter(Boolean)
        .sort()
        .join(",");
    const toppingIds = norm(payload.toppings);
    const accessoryIds = norm(payload.accessories);
    const newId = `${editingItem.productId}|size:${
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
      // update the edited item (id/signature changed) — backend doesn't allow renaming id via PUT
      const updated = { ...editingItem, ...payload, id: newId };
      const nextItems = items.map((it) => (it.id === oldId ? updated : it));
      setItems(nextItems);

      const cartId = localStorage.getItem(clientCartIdKey);
      // remove old then add new on backend to reflect id change
      removeCartItem(cartId, oldId)
        .catch(() => {})
        .finally(() => {
          // attempt to add updated item on backend
          // use api helper addCartItem
          try {
            addCartItem(cartId, updated).catch(() => {});
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
    const itemUnit = it.unitPrice || it.price || 0;
    const accessoriesTotalPerUnit = (it.accessories || []).reduce(
      (s, a) => s + (a.price || 0),
      0
    );
    const baseUnit = Math.max(0, itemUnit - accessoriesTotalPerUnit);
    const itemSubtotal = baseUnit * it.qty;
    const accessoriesSubtotal = (it.accessories || []).reduce(
      (s, a) => s + (a.price || 0) * it.qty,
      0
    );
    return sum + itemSubtotal + accessoriesSubtotal;
  }, 0);
  const delivery = subtotal > 0 && subtotal < 1000 ? 60 : 0; // small rule
  const discount = 0; // placeholder for promo logic
  const total = subtotal + delivery - discount;

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Your Cart</h2>

        {items.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 flex flex-col items-center gap-6 text-center">
            <img
              src="/fallback.jpg"
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
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <div key={it.id}>
                  <CartItem
                    item={it}
                    onIncrease={increase}
                    onDecrease={decrease}
                    onRemove={remove}
                    onEdit={openEditor}
                  />
                  {(it.accessories || []).map((acc) => (
                    <AccessoryRow
                      key={acc.id || acc._id || acc.name}
                      accessory={acc}
                      parentItemId={it.id}
                      parentQty={it.qty}
                      onRemove={removeAccessory}
                    />
                  ))}
                </div>
              ))}

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => clear()}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
                >
                  Clear Cart
                </button>
                <div className="text-sm text-gray-500">
                  You can edit quantities or remove items before checkout.
                </div>
              </div>
            </div>

            <aside className="rounded-lg border bg-white p-6 shadow-sm w-full lg:w-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Order Summary</h4>
                <div className="text-sm text-gray-500">
                  {items.reduce(
                    (c, it) => c + 1 + ((it.accessories || []).length || 0),
                    0
                  )}{" "}
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
                onClick={() =>
                  alert("Proceeding to checkout — integrate your flow here")
                }
                className="mt-6 w-full sm:w-full md:w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 font-medium"
              >
                Checkout
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
