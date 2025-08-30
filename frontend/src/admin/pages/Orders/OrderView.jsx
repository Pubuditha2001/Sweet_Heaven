import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderById, updateOrder } from "../../../api/order";
import { fetchCakeById } from "../../../api/cake";
import { fetchAccessoryById } from "../../../api/accessory";
import OrderItem from "../../../components/OrderItem";
import ActionResultPopUp from "../../../components/ActionResultPopUp";
import { generateOrderPdf } from "../../../utils/pdf";

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOrderById(id);
        const ord = data && (data.item || data);
        if (mounted) setOrder(ord);
        if (mounted && ord) await loadProductsForOrder(ord);
      } catch (err) {
        setError(err.message || String(err));
      }
      setLoading(false);
    }
    load();
    return () => (mounted = false);
  }, [id]);

  // simple direct confirm helper (kept for compatibility)
  const confirm = async () => {
    try {
      const resp = await updateOrder(id, { status: "confirmed" });
      const updated = resp && (resp.item || resp);
      if (updated) {
        setOrder(updated);
        setProductMap({});
        await loadProductsForOrder(updated);
      }
      alert("Order confirmed");
    } catch (err) {
      alert("Failed to confirm order: " + (err.message || err));
    }
  };

  // Action modal state for this view
  const [actionModal, setActionModal] = useState({
    show: false,
    mode: "confirm",
    status: "prompt",
    message: "",
  });
  const [rejectedReason, setRejectedReason] = useState("");

  const openActionModal = (mode) =>
    setActionModal({ show: true, mode, status: "prompt", message: "" });
  const closeActionModal = () =>
    setActionModal({
      show: false,
      mode: "confirm",
      status: "prompt",
      message: "",
    });

  const performAction = async () => {
    if (!order) return;
    const newStatus =
      actionModal.mode === "reject"
        ? "rejected"
        : actionModal.mode === "finished"
        ? "finished"
        : "confirmed";
    setActionModal((s) => ({
      ...s,
      status: "pending",
      message: `${actionModal.mode}ing order...`,
    }));
    try {
      const payload = { status: newStatus };
      if (actionModal.mode === "reject" && rejectedReason)
        payload.rejectedReason = rejectedReason;
      const resp = await updateOrder(order._id || order.id, payload);
      const updated = resp && (resp.item || resp);
      if (updated) {
        setOrder(updated);
        setProductMap({});
        await loadProductsForOrder(updated);
        setActionModal((s) => ({
          ...s,
          status: "success",
          message: `Order ${newStatus}`,
        }));
      } else {
        throw new Error("Invalid update response");
      }
    } catch (err) {
      setActionModal((s) => ({
        ...s,
        status: "failed",
        message: err.message || String(err),
      }));
    }
  };

  async function loadProductsForOrder(ord) {
    try {
      const results = {};
      const idsByType = {};
      const promises = [];

      for (const it of ord.items || []) {
        // Prefer explicit productType when present
        const explicitType = it.productType || it.type;
        const type = explicitType
          ? String(explicitType).toLowerCase()
          : it.productCategory === "accessory"
          ? "accessory"
          : "cake";

        // Try many possible id locations used across legacy and new payloads
        const pid =
          it.itemId ||
          it.productId ||
          (it.product && (it.product._id || it.product.id)) ||
          it.id ||
          it._id ||
          (it.cake && (it.cake._id || it.cake.id)) ||
          (it.accessory && (it.accessory._id || it.accessory.id)) ||
          null;

        // If the item contains an embedded product object, prefer using it as the resolved product
        const embedded =
          it.cake || it.accessory || it.product || it.item || null;
        if (embedded) {
          const key = pid || embedded._id || embedded.id || null;
          if (key) {
            results[key] = embedded;
            continue;
          }
          continue;
        }

        idsByType[type] = idsByType[type] || new Set();
        if (pid) idsByType[type].add(pid);
      }

      if (idsByType.cake && idsByType.cake.size) {
        for (const cid of Array.from(idsByType.cake)) {
          promises.push(
            fetchCakeById(cid)
              .then((res) => {
                results[cid] = (res && (res.item || res)) || null;
              })
              .catch(() => {
                results[cid] = null;
              })
          );
        }
      }

      if (idsByType.accessory && idsByType.accessory.size) {
        for (const aid of Array.from(idsByType.accessory)) {
          promises.push(
            fetchAccessoryById(aid)
              .then((res) => {
                results[aid] = (res && (res.item || res)) || null;
              })
              .catch(() => {
                results[aid] = null;
              })
          );
        }
      }

      await Promise.all(promises);
      setProductMap(results);
    } catch (e) {
      // ignore
    }
  }

  function normalizeImagePath(src) {
    if (!src) return null;
    if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;
    return src.replace(/^\.\/?/, "/");
  }

  const downloadPDF = async () => {
    try {
      await generateOrderPdf(order || { id });
    } catch (e) {
      alert("Failed to generate PDF: " + (e.message || e));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">No order found</div>;

  const statusClass = (() => {
    const st = String(order?.status || "").toLowerCase();
    const map = {
      requested: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      finished: "bg-blue-100 text-blue-800",
    };
    return map[st] || "bg-gray-100 text-gray-800";
  })();

  // small currency formatter used in CheckoutDetails
  function formatRs(n) {
    return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
  }

  const orderSubtotal = (order.items || []).reduce((sum, it) => {
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

  // Ensure display order: cakes first, then accessories, then others
  function getItemType(it) {
    const explicitType = it.productType || it.type;
    if (explicitType) return String(explicitType).toLowerCase();
    if (it.productCategory === "accessory") return "accessory";
    if (it.cake) return "cake";
    if (it.accessory) return "accessory";
    return "other";
  }

  const orderedItems = (order.items || []).slice().sort((a, b) => {
    const rank = (t) => (t === "cake" ? 0 : t === "accessory" ? 1 : 2);
    const ta = getItemType(a);
    const tb = getItemType(b);
    return rank(ta) - rank(tb);
  });

  return (
    <div className="max-w-6xl mx-auto px-2 py-6">
      <div className="bg-white rounded-lg p-4">
        <div className="mb-6">
          {/* Row 1: Order ID (left) and Status (right) */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-pink-600 font-semibold">
              Order {order.orderId || order._id || order.id}
            </h2>

            <div className="ml-4 flex-shrink-0">
              {order?.status && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}
                >
                  {String(order.status)}
                </span>
              )}
            </div>
          </div>

          {/* actions moved into the main grid as a full-width row */}
          <div className="md:col-span-3">
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
              {/* Actions row: always inline; on narrow screens this is the first row */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => openActionModal("confirm")}
                  className="flex-none px-4 py-2 bg-green-500 text-white rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => openActionModal("reject")}
                  className="flex-none px-4 py-2 bg-red-500 text-white rounded"
                >
                  Reject
                </button>
                <button
                  onClick={() => openActionModal("finished")}
                  className="flex-none px-4 py-2 bg-gray-700 text-white rounded"
                >
                  Finished
                </button>
              </div>

              {/* Download row: on mobile this appears as a full-width button under actions; on md+ it aligns to the right and stays inline */}
              <div className="w-full md:w-auto md:ml-auto">
                <div className="flex md:justify-end">
                  <button
                    onClick={downloadPDF}
                    className="w-full md:w-auto px-4 py-2 bg-pink-600 text-white rounded"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-pink-500 text-lg ">Customer</h3>
              <div className="mt-2 space-y-2 text-sm">
                {/* Each row: label (fixed width) + value (flex, right-aligned for stylish layout) */}
                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Order ID</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.orderId || order._id || order.id}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Name</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.clientDetails?.name || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">
                    Primary phone
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.clientDetails?.phone || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">
                    Secondary phone
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.clientDetails?.phone2 ||
                      order.clientDetails?.secondaryPhone ||
                      "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Email</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium break-words">
                    {order.clientDetails?.email || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">
                    Confirmation method
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.clientDetails?.confirmationMethod ||
                      order.confirmationMethod ||
                      "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">
                    Scheduled Date
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium">
                    {order.clientDetails?.scheduledDate ||
                      order.scheduledDate ||
                      "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Address</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium whitespace-pre-line">
                    {order.clientDetails?.address || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Note</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium whitespace-pre-line">
                    {order.note || order.notes || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-xs text-gray-400 ">Status</div>
                  <div className="flex-1 flex justify-end text-sm">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                      {order.status || "-"}
                    </span>
                  </div>
                </div>

                {order.rejectedReason ? (
                  <div className="flex items-start gap-3">
                    <div className="w-36 text-sm text-gray-400 ">
                      Rejection reason
                    </div>
                    <div className="flex-1 text-sm text-red-700 bg-red-50 p-3 rounded">
                      {order.rejectedReason}
                    </div>
                  </div>
                ) : null}
                {/* Compact order summary (mirrors CheckoutDetails) */}
                <div className="pt-3 border-t">
                  <h4 className="font-semibold text-pink-400">Order summary</h4>
                  <div className="mt-2 text-sm space-y-2">
                    {orderedItems.slice(0, 4).map((it, i) => {
                      const name =
                        it.name || it.itemName || it.cakeName || "Item";
                      return (
                        <div
                          key={i}
                          className="text-gray-400 flex justify-between"
                        >
                          <div className="truncate pr-2">
                            {name}
                            {it.size ? ` • ${it.size}` : ""}
                          </div>
                          <div className="text-gray-700">x{it.qty || 1}</div>
                        </div>
                      );
                    })}
                    {orderedItems.length > 4 && (
                      <div className="text-xs text-gray-500">
                        and {orderedItems.length - 4} more items
                      </div>
                    )}

                    <div className="pt-2 border-t flex justify-between text-sm font-medium">
                      <div>Subtotal</div>
                      <div>{formatRs(order.subtotal ?? orderSubtotal)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold text-pink-400">Items</h3>
              <div className="mt-3 space-y-3 rounded">
                {orderedItems.map((it, idx) => {
                  const pid = it.itemId || it.id || it._id;
                  const embedded =
                    it.cake || it.accessory || it.product || it.item || null;
                  let product = (pid && productMap[pid]) || embedded || null;
                  if (!product && pid) {
                    const found = Object.values(productMap).find((p) => {
                      if (!p) return false;
                      const pidStr = String(pid);
                      return (
                        String(p._id || p.id || "") === pidStr ||
                        String(p._id?._str || "") === pidStr
                      );
                    });
                    if (found) product = found;
                  }

                  const rawImg =
                    product?.cakeImage ||
                    product?.image ||
                    (product?.images && product.images[0]) ||
                    it.image ||
                    (embedded && (embedded.cakeImage || embedded.image)) ||
                    null;
                  const img = normalizeImagePath(rawImg);
                  let title =
                    product?.cakeName ||
                    product?.name ||
                    (embedded && (embedded.cakeName || embedded.name)) ||
                    it.name ||
                    it.cakeName ||
                    it.productType ||
                    "Item";

                  const sizeLabel =
                    typeof it.size === "string"
                      ? it.size
                      : it.size?.size ||
                        it.sizeId ||
                        (typeof it.sizeIndex !== "undefined"
                          ? `index:${it.sizeIndex}`
                          : null);
                  const toppingsArr = Array.isArray(it.toppings)
                    ? it.toppings
                    : (it.toppings || []).map((t) =>
                        typeof t === "string"
                          ? t
                          : t?.name ||
                            t?.toppingName ||
                            t?.toppingId ||
                            t?.id ||
                            String(t)
                      );

                  const safeCake = product
                    ? Object.assign({}, product, {
                        cakeImage:
                          product?.cakeImage ||
                          product?.image ||
                          (product?.images && product.images[0]) ||
                          img,
                      })
                    : null;

                  const missingProduct = !product && !embedded;
                  if (missingProduct && pid)
                    title = `${title} (missing product: ${pid})`;

                  const storedName = (
                    it.itemName ||
                    it.name ||
                    (embedded && (embedded.cakeName || embedded.name)) ||
                    title ||
                    ""
                  ).toString();
                  const fetchedName =
                    (product &&
                      (product.cakeName || product.name || product.title)) ||
                    null;
                  let changeNote = undefined;
                  if (
                    fetchedName &&
                    storedName &&
                    String(fetchedName).toString().trim().toLowerCase() !==
                      String(storedName).toString().trim().toLowerCase()
                  )
                    changeNote = `changed to ${String(fetchedName)}`;

                  const displayItem = Object.assign({}, it, {
                    name: storedName || title,
                    unitPrice: it.unitPrice ?? it.price ?? product?.price ?? 0,
                    price: it.price ?? it.unitPrice ?? product?.price ?? 0,
                    size: sizeLabel,
                    toppings: toppingsArr,
                    image: img,
                    cake: safeCake,
                    changeNote,
                  });

                  return (
                    <OrderItem
                      key={it._id || it.id || idx}
                      item={displayItem}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <ActionResultPopUp
          show={actionModal.show}
          mode={actionModal.mode}
          status={actionModal.status}
          message={actionModal.message}
          title={
            actionModal.mode === "reject"
              ? `Reject order ${order.orderId || order._id || order.id}`
              : actionModal.mode === "finished"
              ? `Mark order ${
                  order.orderId || order._id || order.id
                } as finished`
              : `Confirm order ${order.orderId || order._id || order.id}`
          }
          onClose={closeActionModal}
          onConfirm={performAction}
          imageSrcRejected="/rejected.png"
        >
          {actionModal.mode === "reject" && (
            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">
                Reason for rejection
              </label>
              <textarea
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={4}
                placeholder="Optional: explain why this order is rejected"
              />
            </div>
          )}
        </ActionResultPopUp>
      </div>
    </div>
  );
}
