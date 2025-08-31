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
  // phone action menu state: stores the phone value currently showing the menu
  const [phoneMenuFor, setPhoneMenuFor] = useState(null);

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
            results[String(key)] = embedded;
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
                results[String(cid)] = (res && (res.item || res)) || null;
              })
              .catch(() => {
                results[String(cid)] = null;
              })
          );
        }
      }

      if (idsByType.accessory && idsByType.accessory.size) {
        for (const aid of Array.from(idsByType.accessory)) {
          promises.push(
            fetchAccessoryById(aid)
              .then((res) => {
                results[String(aid)] = (res && (res.item || res)) || null;
              })
              .catch(() => {
                results[String(aid)] = null;
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

  // normalize phone for tel: href (digits only)
  function normalizeTel(phone) {
    if (!phone) return "";
    return String(phone).replace(/[^0-9+]/g, "");
  }

  // format phone for display (simple grouping for 10-digit numbers)
  function formatPhoneForDisplay(phone) {
    if (!phone) return phone;
    const s = String(phone).replace(/[^0-9]/g, "");
    if (s.length === 10) {
      return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`;
    }
    if (s.length === 9) {
      return `${s.slice(0, 2)} ${s.slice(2, 5)} ${s.slice(5)}`;
    }
    return phone;
  }

  // prepare number for WhatsApp wa.me links: if starts with 0 replace with 94
  function whatsappNumber(phone) {
    if (!phone) return "";
    let digits = String(phone).replace(/[^0-9]/g, "");
    if (digits.length === 0) return "";
    if (digits.startsWith("0")) {
      // drop leading zero and add country code 94
      return `94${digits.slice(1)}`;
    }
    if (digits.startsWith("94")) return digits;
    // fallback: return digits as-is
    return digits;
  }

  function openPhoneMenu(phoneKey) {
    setPhoneMenuFor(phoneKey);
  }

  function closePhoneMenu() {
    setPhoneMenuFor(null);
  }

  function performPhoneAction(phone, action) {
    const tel = normalizeTel(phone);
    const wa = whatsappNumber(phone);
    if (action === "whatsapp") {
      if (wa)
        window.open(`https://wa.me/${wa}`, "_blank", "noopener noreferrer");
    } else if (action === "call") {
      if (tel) window.location.href = `tel:${tel}`;
    }
    closePhoneMenu();
  }

  const downloadPDF = async () => {
    try {
      // prefer the authoritative order object; if missing, pass orderId (not id)
      await generateOrderPdf(order || { orderId: order?.orderId || id });
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
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium selectable relative">
                    {order.clientDetails?.phone ? (
                      <>
                        <button
                          onClick={() =>
                            openPhoneMenu({
                              key: "primary",
                              value: order.clientDetails?.phone,
                            })
                          }
                          className="text-pink-600 no-underline"
                          title="Choose action"
                        >
                          {formatPhoneForDisplay(order.clientDetails?.phone)}
                        </button>
                        {/* popup handled globally */}
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">
                    Secondary phone
                  </div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium selectable relative">
                    {order.clientDetails?.phone2 ||
                    order.clientDetails?.secondaryPhone ? (
                      <>
                        <button
                          onClick={() =>
                            openPhoneMenu({
                              key: "secondary",
                              value:
                                order.clientDetails?.phone2 ||
                                order.clientDetails?.secondaryPhone,
                            })
                          }
                          className="text-pink-600 no-underline"
                          title="Choose action"
                        >
                          {formatPhoneForDisplay(
                            order.clientDetails?.phone2 ||
                              order.clientDetails?.secondaryPhone
                          )}
                        </button>
                        {/* popup handled globally */}
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-36 text-sm text-gray-400 ">Email</div>
                  <div className="flex-1 text-right text-sm text-gray-800 font-medium break-words selectable">
                    {order.clientDetails?.email ? (
                      <a
                        className="text-pink-600 no-underline"
                        href={`mailto:${order.clientDetails?.email}`}
                      >
                        {order.clientDetails?.email}
                      </a>
                    ) : (
                      "-"
                    )}
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
                  // Resolve product id using the same logic as loadProductsForOrder
                  const explicitType = it.productType || it.type;
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

                  const embedded =
                    it.cake || it.accessory || it.product || it.item || null;
                  let product = null;
                  if (pid)
                    product =
                      productMap[pid] || productMap[String(pid)] || null;
                  product = product || embedded || null;
                  if (!product && pid) {
                    const pidStr = String(pid);
                    const found = Object.values(productMap).find((p) => {
                      if (!p) return false;
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

        {/* Phone action modal (centred popup) */}
        {phoneMenuFor ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={closePhoneMenu}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-80 p-4 z-60">
              <div className="text-lg font-semibold mb-2">Open with</div>
              <div className="space-y-2">
                <button
                  onClick={() => performPhoneAction(phoneMenuFor.value, "call")}
                  className="w-full px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
                  aria-label="Open in phone app"
                >
                  <svg
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h2.6a1 1 0 01.95.684l.8 2.7a1 1 0 01-.217.92L7.4 10.6a11.042 11.042 0 005 5l2.296-2.33a1 1 0 01.92-.217l2.7.8A1 1 0 0119 17.4V20a2 2 0 01-2 2h-1C9.715 22 2 14.285 2 5V5z"
                    />
                  </svg>
                  <span>Phone app</span>
                </button>
                <button
                  onClick={() =>
                    performPhoneAction(phoneMenuFor.value, "whatsapp")
                  }
                  className="w-full px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-2"
                  aria-label="Open in WhatsApp"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.028-.967-.271-.099-.469-.148-.668.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.668-1.611-.915-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.356.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.271-.198-.571-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.957.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.437-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.991c-.002 5.455-4.437 9.89-9.893 9.89zm8.413-18.282A11.815 11.815 0 0012.048 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.149 1.588 5.967L0 24l6.305-1.682a11.89 11.89 0 005.719 1.463h.005c6.552 0 11.887-5.335 11.89-11.893a11.82 11.82 0 00-3.489-8.463z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={closePhoneMenu}
                    className="text-sm text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
                className="w-full border bg-gray-100 rounded p-2 text-sm"
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
