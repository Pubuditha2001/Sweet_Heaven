import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OrderDetailsConfirmation from "./OrderDetailsConfirmation";
import OrderItem from "../../components/OrderItem";
import { requestOrder } from "../../api/order";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function CheckoutDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  let items = location.state?.items;
  if (!items) {
    try {
      const raw = localStorage.getItem("cart");
      items = raw && raw.length ? JSON.parse(raw) : [];
    } catch (e) {
      items = [];
    }
  }
  const [note, setNote] = useState(location.state?.note || "");
  const [submitting, setSubmitting] = useState(false);
  const [clientDetails, setClientDetails] = useState(
    location.state?.clientDetails || null
  );

  const subtotal = (items || []).reduce((sum, it) => {
    const qty = Number(it.qty || 1);
    const base = Number(it.unitPrice ?? it.price ?? 0);
    const toppingsTotal = (it.toppings || []).reduce((s, t) => {
      const p =
        t && typeof t === "object"
          ? Number(t.price?.price ?? t.price ?? 0)
          : Number(t || 0);
      return s + (isNaN(p) ? 0 : p);
    }, 0);
    const accessoriesTotalPerUnit = (it.accessories || []).reduce(
      (s, a) => s + Number(a.price ?? 0),
      0
    );
    return sum + (base + toppingsTotal + accessoriesTotalPerUnit) * qty;
  }, 0);

  const requestOrderWithDetails = async () => {
    if (!items || items.length === 0) return;
    setSubmitting(true);
    // build compact items (avoid sending embedded product objects/images)
    const compactItems = (items || []).map((it) => {
      const sizeLabel =
        (typeof it.size === "string" ? it.size : it.size?.size) ||
        it.sizeId ||
        null;
      const itemId =
        it.itemId ||
        it.productId ||
        it.id ||
        it._id ||
        (it.cake && (it.cake._id || it.cake.id)) ||
        undefined;
      return {
        itemId,
        name: it.name || it.cakeName || it.productName || "Item",
        qty: Number(it.qty || 1),
        price: Number(it.unitPrice ?? it.price ?? 0),
        size: sizeLabel || undefined,
        toppings: (it.toppings || []).map((t) =>
          typeof t === "string"
            ? t
            : t?.name || t?.toppingName || t?.toppingId || t?.id || String(t)
        ),
        accessories: (it.accessories || []).map((a) => ({
          name: a?.name || a?.accessoryName || String(a?.id || ""),
          price: Number(a?.price ?? 0),
        })),
        productType: it.productType || it.productCategory || undefined,
        note: it.note || undefined,
      };
    });

    const payload = {
      clientCartId: localStorage.getItem("client_cart_id") || null,
      items: compactItems,
      subtotal,
      note,
      clientDetails,
      createdAt: new Date().toISOString(),
      status: "requested",
    };

    try {
      const res = await requestOrder(payload);
      localStorage.removeItem("cart");
      navigate("/order-requested", {
        replace: true,
        state: {
          id: res.id,
          contactMethod: clientDetails?.confirmationMethod,
          order: { items: compactItems, subtotal, note },
        },
      });
    } catch (e) {
      console.error(e);
      alert("Failed to send order request. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const isClientValid = () => {
    const cd = clientDetails || {};
    if (!cd.name || !cd.name.trim()) return false;
    if (!cd.phone || !cd.phone.trim()) return false;
    if (!cd.scheduledDate) return false;
    if (!cd.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cd.email)) return false;
    return true;
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">
          Confirm Your Order
        </h2>
        <div className="rounded-lg border bg-white p-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-2 border-r">
              <OrderDetailsConfirmation
                onSubmit={(d) => setClientDetails(d)}
                hideSubmit
                onChange={(d) => setClientDetails(d)}
              />
            </div>
            <div className="">
              <h3 className="text-lg font-medium">Order summary</h3>
              <div className="space-y-2 mt-2">
                {(items || []).map((it) => (
                  <OrderItem key={it.id || it._id} item={it} />
                ))}
              </div>
              <div className="pt-4 border-t p-2">
                <div className="p-2 flex justify-between text-sm text-gray-600">
                  <div>Subtotal</div>
                  <div>{formatRs(subtotal)}</div>
                </div>
                <div className="mt-3 ">
                  <label className="block p-2 text-sm font-medium text-gray-700">
                    Order Note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border text-gray-700 rounded bg-white p-2 mt-1"
                    rows={3}
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={requestOrderWithDetails}
                    disabled={submitting || !isClientValid()}
                    className={`w-full px-4 py-4 ${
                      isClientValid()
                        ? "bg-green-500"
                        : "bg-gray-300 cursor-not-allowed"
                    } text-white rounded-md text-lg`}
                  >
                    {submitting ? "Sending..." : "Request Order"}
                  </button>
                  {!isClientValid() && (
                    <div className="text-xs text-red-600 mt-2">
                      Please fill required customer details (name, phone, email,
                      scheduled date) before requesting the order.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
