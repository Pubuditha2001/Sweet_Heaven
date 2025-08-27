// Checkout.jsx - Order request confirmation page (no payments)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestOrder } from "../../api/order";
import OrderDetailsConfirmation from "./OrderDetailsConfirmation";
import OrderItem from "../../components/OrderItem";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState(state?.items || []);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [step, setStep] = useState(1);
  const [clientDetails, setClientDetails] = useState(null);

  useEffect(() => {
    if (!state?.items) {
      try {
        const raw = localStorage.getItem("cart");
        const cart = raw && raw.length ? JSON.parse(raw) : [];
        setItems(cart);
      } catch (e) {
        setItems([]);
      }
    }
  }, [state]);

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

  // legacy: keep handleRequest as a simple request without client details
  const handleRequest = async () => {
    if (!items || items.length === 0) return;
    setSubmitting(true);
    const payload = {
      clientCartId: localStorage.getItem("client_cart_id") || null,
      items,
      subtotal,
      note,
      createdAt: new Date().toISOString(),
      status: "requested",
    };
    try {
      await requestOrder(payload);
      localStorage.removeItem("cart");
      navigate("/", { replace: true, state: { orderRequested: true } });
    } catch (e) {
      console.error(e);
      alert("Failed to send order request. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // called by OrderDetailsConfirmation when user submits their details
  const submitFullOrder = async (clientDetails) => {
    setClientDetails(clientDetails);
  };

  const requestOrderWithDetails = async () => {
    if (!items || items.length === 0) return;
    setSubmitting(true);
    const payload = {
      clientCartId: localStorage.getItem("client_cart_id") || null,
      items,
      subtotal,
      note,
      clientDetails,
      createdAt: new Date().toISOString(),
      status: "requested",
    };

    try {
      await requestOrder(payload);
      localStorage.removeItem("cart");
      navigate("/", { replace: true, state: { orderRequested: true } });
    } catch (e) {
      console.error(e);
      alert("Failed to send order request. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">
          Confirm Your Order
        </h2>
        <div className="rounded-lg border bg-white p-2">
          <div className="space-y-4">
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium p-2">Confirm items</h3>
                <div className="space-y-2 p-2">
                  {(items || []).map((it) => (
                    <OrderItem key={it.id || it._id} item={it} />
                  ))}
                </div>
                <div className="p-2 flex justify-end">
                  <button
                    onClick={() =>
                      navigate("/checkout/details", { state: { items, note } })
                    }
                    className="px-4 py-2 bg-pink-600 text-white rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-2 border-r">
                  <OrderDetailsConfirmation
                    onSubmit={submitFullOrder}
                    hideSubmit
                    onChange={(d) => setClientDetails(d)}
                  />
                </div>
                <div className="p-2">
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
                        className="w-full border rounded bg-white p-2 mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={requestOrderWithDetails}
                        disabled={submitting}
                        className="w-full px-4 py-4 bg-green-500 text-white rounded-md text-lg"
                      >
                        {submitting ? "Sending..." : "Request Order"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
