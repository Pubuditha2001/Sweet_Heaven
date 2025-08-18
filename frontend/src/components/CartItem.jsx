import React, { useEffect, useState } from "react";
import { fetchCakeById } from "../api/cake";
import { fetchAccessoryById } from "../api/accessory";
import { fetchToppingsByRef } from "../api/topping";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onEdit,
  onRemoveAccessory,
}) {
  const [product, setProduct] = useState(null);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [localToppingsDb, setLocalToppingsDb] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (item?.productId) {
          // Determine source by explicit productCategory or legacy id prefix
          const isAccessory =
            item.productCategory === "accessory" ||
            String(item.id || "").startsWith("accessory:");
          if (isAccessory) {
            const p = await fetchAccessoryById(item.productId);
            if (!mounted) return;
            setProduct(p);
            // accessories don't have toppings
            setAvailableToppings([]);
          } else {
            const p = await fetchCakeById(item.productId);
            if (!mounted) return;
            setProduct(p);
            if (p?.toppingRef) {
              const tr = await fetchToppingsByRef(p.toppingRef);
              if (!mounted) return;
              setAvailableToppings(tr.toppings || []);
            } else {
              setAvailableToppings([]);
            }
          }
        }
      } catch (err) {
        // ignore
      }
    }
    load();
    return () => (mounted = false);
  }, [item.productId, item.productCategory, item.id]);

  // load local toppings JSON as fallback (served from public folder)
  useEffect(() => {
    let mounted = true;
    async function loadLocal() {
      try {
        const res = await fetch("/database%20Data/toppings.json");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setLocalToppingsDb(data || []);
      } catch (e) {}
    }
    loadLocal();
    return () => (mounted = false);
  }, []);

  const normalize = (s) =>
    (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();

  function getToppingPriceFromObj(toppingObj, sizeIndex = item.sizeIndex || 0) {
    if (!toppingObj) return 0;
    const prices = toppingObj.prices || [];
    let selectedSizeName = product?.prices?.[sizeIndex]?.size;
    if (!selectedSizeName)
      selectedSizeName = item.sizeLabel || item.size || undefined;
    if (!prices.length) return 0;
    const target = normalize(selectedSizeName);
    let priceObj = prices.find((p) => normalize(p.size) === target);
    if (!priceObj) {
      const numeric = (str) => {
        const m = (str || "").toString().match(/([\d.]+)/);
        return m ? m[1] : null;
      };
      const targetNum = numeric(selectedSizeName);
      if (targetNum)
        priceObj = prices.find((p) => numeric(p.size) === targetNum);
    }
    return priceObj ? priceObj.price : 0;
  }

  // fallback: try to lookup topping by name in local toppings DB
  function findToppingInLocalDB(toppingName) {
    if (!toppingName) return null;
    const key = (toppingName || "").toString().toLowerCase().trim();
    for (const col of localToppingsDb || []) {
      for (const t of col.toppings || []) {
        if ((t.name || "").toString().toLowerCase().trim() === key) return t;
      }
    }
    return null;
  }

  return (
    <div className="flex gap-4 items-start p-3 sm:p-4 border rounded-lg bg-white w-full">
      <img
        src={item.image || "/fallback.jpg"}
        alt={item.name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0 border"
        onError={(e) => (e.target.src = "/fallback.jpg")}
      />

      <div className="flex-1">
        {/* Header: name left, total and per-unit on right (reference layout) */}
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {item.name}
            </div>
            {item.size && (
              <div className="text-sm text-gray-500">Size: {item.size}</div>
            )}
            {item.note && (
              <div className="text-sm text-gray-500">{item.note}</div>
            )}
          </div>
          <div className="text-right mt-0 ml-3 whitespace-nowrap">
            <div className="font-semibold text-pink-600">
              {formatRs((item.unitPrice || item.price || 0) * item.qty)}
            </div>
          </div>
        </div>

        {/* Price breakdown: labels left, prices right */}
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-1 text-sm text-gray-600">
          {/* Base cake price */}
          <div className="flex justify-between items-center text-sm">
            <div>Base cake</div>
            <div className="text-gray-600">
              {product
                ? formatRs(
                    product.prices?.[item.sizeIndex || 0]?.price ||
                      item.price ||
                      0
                  )
                : formatRs(item.price || 0)}
            </div>
          </div>

          {/* Toppings */}
          {(item.toppings || []).map((t, idx) => {
            let toppingObj = (availableToppings || []).find(
              (at) => (at._id || at.id || at.name) === (t.id || t._id || t.name)
            );
            if (!toppingObj) toppingObj = findToppingInLocalDB(t.name) || null;
            const tPrice = toppingObj
              ? getToppingPriceFromObj(toppingObj, item.sizeIndex)
              : 0;

            return (
              <div
                key={idx}
                className="flex justify-between items-center mt-1 text-sm"
              >
                <div className="truncate text-gray-700">{t.name}</div>
                <div className="text-gray-600">+{formatRs(tPrice)}</div>
              </div>
            );
          })}
        </div>

        <div className="text-sm text-gray-500 mt-2">
          {formatRs(item.unitPrice || item.price || 0)} each
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecrease(item.id)}
              className="px-2 sm:px-3 py-1 rounded-md border hover:bg-gray-100 text-gray-900 font-medium"
              style={{ color: "#111827" }}
              aria-label="decrease"
            >
              −
            </button>
            <div
              className="px-2 sm:px-3 py-1 border rounded-md min-w-[40px] sm:min-w-[48px] text-center text-gray-900 font-medium"
              style={{ color: "#111827" }}
            >
              {item.qty}
            </div>
            <button
              onClick={() => onIncrease(item.id)}
              className="px-2 sm:px-3 py-1 rounded-md border hover:bg-gray-100 text-gray-900 font-medium"
              style={{ color: "#111827" }}
              aria-label="increase"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRemove(item.id)}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Remove
            </button>
            <button
              onClick={() => onEdit && onEdit(item)}
              className="text-sm text-gray-500 hover:text-pink-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      {/* accessories are rendered as separate cart rows by the Cart page */}
    </div>
  );
}
