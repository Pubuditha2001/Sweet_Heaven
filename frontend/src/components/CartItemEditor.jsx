import React, { useEffect, useRef, useState } from "react";
import CakeSizesOptions from "./CakeSizesOptions";
import ToppingsOptions from "./ToppingsOptions";
import AccessoriesPicker from "./AccessoriesPicker";
import { fetchCakeById } from "../api/cake";
import { fetchToppingsByRef } from "../api/topping";
import { fetchAccessories } from "../api/accessory";

export default function CartItemEditor({ item, onClose, onSave, onRemove }) {
  const wrapRef = useRef(null);
  const [qty, setQty] = useState(item?.qty || 1);
  const [note, setNote] = useState(item?.note || "");
  const [product, setProduct] = useState(null);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [availableAccessories, setAvailableAccessories] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedSize, setSelectedSize] = useState(
    item?.sizeIndex != null ? item.sizeIndex : item?.sizeIndex || 0
  );
  const [freeSizeLabel, setFreeSizeLabel] = useState(
    item?.sizeLabel || item?.size || ""
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        onClose && onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  const increase = () => setQty((q) => q + 1);
  const decrease = () => setQty((q) => Math.max(1, q - 1));

  // load product, toppings and accessories and initialize selections
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (item?.productId) {
          const p = await fetchCakeById(item.productId);
          if (!mounted) return;
          setProduct(p);
          // determine selected size index
          const idx =
            item?.sizeIndex != null
              ? item.sizeIndex
              : p?.prices?.findIndex(
                  (pr) => (pr.size || "") === (item.sizeLabel || item.size)
                ) ?? 0;
          setSelectedSize(idx >= 0 ? idx : 0);
          setFreeSizeLabel(item?.sizeLabel || item?.size || "");
          if (p?.toppingRef) {
            const tr = await fetchToppingsByRef(p.toppingRef);
            if (!mounted) return;
            setAvailableToppings(tr.toppings || []);
            const selT = (item.toppings || []).map(
              (t) =>
                tr.toppings.find(
                  (at) =>
                    (at._id || at.id || at.name) === (t.id || t._id || t.name)
                ) || t
            );
            setSelectedToppings(selT);
          }
        }
        const accs = await fetchAccessories();
        if (!mounted) return;
        setAvailableAccessories(accs || []);
        const selA = (item.accessories || []).map(
          (a) =>
            (accs || []).find(
              (aa) => (aa._id || aa.id || aa.name) === (a.id || a._id || a.name)
            ) || a
        );
        setSelectedAccessories(selA);
      } catch (err) {
        console.error("CartItemEditor load error:", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [item]);

  const handleToppingToggle = (t) => {
    setSelectedToppings((prev) => {
      const key = (x) => x._id || x.id || x.name;
      if (prev.some((p) => key(p) === key(t)))
        return prev.filter((p) => key(p) !== key(t));
      return [...prev, t];
    });
  };

  const handleAccessoryToggle = (a) => {
    setSelectedAccessories((prev) => {
      const key = (x) => x._id || x.id || x.name;
      if (prev.some((p) => key(p) === key(a)))
        return prev.filter((p) => key(p) !== key(a));
      return [...prev, a];
    });
  };

  const getToppingPrice = (topping, sizeIndex = selectedSize) => {
    if (!topping || !topping.prices) return 0;
    const sel = topping.prices[sizeIndex] || topping.prices[0];
    return sel ? sel.price : 0;
  };

  const getAccessoryPrice = (a) => a?.price || 0;

  const handleSave = () => {
    const toppingsPayload = (selectedToppings || []).map((t) => ({
      id: t._id || t.id || t.name,
      name: t.name,
    }));
    const accessoriesPayload = (selectedAccessories || []).map((a) => ({
      id: a._id || a.id || a.name,
      name: a.name,
    }));
    const basePrice =
      product?.prices?.[selectedSize]?.price ||
      item.unitPrice ||
      item.price ||
      0;
    const toppingsPrice = (selectedToppings || []).reduce(
      (s, t) => s + getToppingPrice(t, selectedSize),
      0
    );
    const accessoriesPrice = (selectedAccessories || []).reduce(
      (s, a) => s + (a.price || 0),
      0
    );
    const unitPrice = basePrice + toppingsPrice + accessoriesPrice;

    onSave &&
      onSave({
        qty,
        sizeIndex: selectedSize,
        sizeLabel:
          product?.prices?.[selectedSize]?.size || freeSizeLabel || undefined,
        note: note || undefined,
        toppings: toppingsPayload,
        accessories: accessoriesPayload,
        unitPrice,
      });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4"
      style={{ zIndex: 9999 }}
    >
      <div
        ref={wrapRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl"
        style={{
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit item</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4" style={{ flex: 1, overflowY: "auto" }}>
          <div className="flex items-start gap-4">
            <img
              src={item.image || "/fallback.jpg"}
              alt={item.name}
              className="w-24 h-24 rounded-md object-cover border"
              onError={(e) => (e.target.src = "/fallback.jpg")}
            />

            <div className="flex-1">
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                Unit price: Rs.{" "}
                {(item.unitPrice || item.price || 0).toLocaleString()}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decrease}
                    className="px-3 py-1 rounded-md border hover:bg-gray-100 text-gray-900 font-medium"
                    style={{ color: "#111827" }}
                    aria-label="decrease"
                  >
                    −
                  </button>
                  <div
                    className="px-3 py-1 border rounded-md min-w-[48px] text-center text-gray-900 font-medium"
                    style={{ color: "#111827" }}
                  >
                    {qty}
                  </div>
                  <button
                    onClick={increase}
                    className="px-3 py-1 rounded-md border hover:bg-gray-100 text-gray-900 font-medium"
                    style={{ color: "#111827" }}
                    aria-label="increase"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">
                  Size / Variant
                </label>
                {product ? (
                  <CakeSizesOptions
                    prices={product.prices}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    onReset={() => setSelectedSize(0)}
                  />
                ) : (
                  <input
                    value={freeSizeLabel}
                    onChange={(e) => setFreeSizeLabel(e.target.value)}
                    placeholder="e.g. Small / 6 inch"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                )}
              </div>

              <div className="mt-4">
                <ToppingsOptions
                  availableToppings={availableToppings}
                  selectedToppings={selectedToppings}
                  handleToppingToggle={handleToppingToggle}
                  getToppingPrice={getToppingPrice}
                  selectedSize={selectedSize}
                  onReset={() => setSelectedToppings([])}
                />
              </div>

              <div className="mt-4">
                <AccessoriesPicker
                  accessories={availableAccessories}
                  selectedAccessories={selectedAccessories}
                  handleAccessoryToggle={handleAccessoryToggle}
                  getAccessoryPrice={getAccessoryPrice}
                  onReset={() => setSelectedAccessories([])}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Add a note for the baker (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between"
          style={{ flexShrink: 0 }}
        >
          <div>
            <button
              onClick={() => onRemove && onRemove(item.id)}
              className="px-3 py-2 text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
