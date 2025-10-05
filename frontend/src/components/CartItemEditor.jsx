import React, { useEffect, useRef, useState, useMemo } from "react";
import CakeSizesOptions from "./CakeSizesOptions";
import ToppingsOptions from "./ToppingsOptions";
import { fetchCakeById } from "../api/cake";
import { fetchToppingsByRef } from "../api/topping";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../utils/imageUtils";

export default function CartItemEditor({ item, onClose, onSave, onRemove }) {
  const wrapRef = useRef(null);
  const [qty, setQty] = useState(item?.qty || 1);
  const [product, setProduct] = useState(null);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState(
    item?.sizeIndex != null ? item.sizeIndex : item?.sizeIndex || 0
  );
  const [freeSizeLabel, setFreeSizeLabel] = useState(
    item?.sizeLabel || item?.size || ""
  );
  const isAccessory =
    item?.productType === "accessory" || item?.productCategory === "accessory";

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

  // load product, toppings and initialize selections
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const productId = item.productId || item.itemId;
        if (!isAccessory && productId) {
          const p = await fetchCakeById(productId);
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

  const getToppingPrice = (topping, sizeIndex = selectedSize) => {
    if (!topping || !topping.prices) return 0;
    const sel = topping.prices[sizeIndex] || topping.prices[0];
    return sel ? sel.price : 0;
  };

  // compute unit price preview based on selected size and toppings
  const unitPricePreview = useMemo(() => {
    const base =
      product && product.prices && product.prices[selectedSize]
        ? product.prices[selectedSize].price
        : product && product.prices && product.prices[0]
        ? product.prices[0].price
        : item.unitPrice || item.price || 0;

    const toppingsTotal = (selectedToppings || []).reduce(
      (sum, t) => sum + getToppingPrice(t, selectedSize),
      0
    );

    return (base || 0) + (toppingsTotal || 0);
  }, [product, selectedSize, selectedToppings, item]);

  const handleSave = () => {
    // If accessory, save only qty and keep productType accessory
    if (isAccessory) {
      onSave &&
        onSave({
          itemId: item.itemId || item._id,
          productType: "accessory",
          qty,
        });
      return;
    }

    // Save only IDs for cake, size and toppings (backend expects topping ids)
    const toppingsPayload = (selectedToppings || []).map((t) =>
      String(t._id || t.id || t)
    );
    // Use unified itemId and productType
    onSave &&
      onSave({
        itemId: product?._id || item.itemId || item._id,
        productType: "cake",
        qty,
        sizeId: product?.prices?.[selectedSize]?._id || freeSizeLabel,
        sizeIndex: selectedSize,
        toppings: toppingsPayload,
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
              src={
                item.productCategory === "accessory" ||
                item.productType === "accessory"
                  ? normalizeImageUrl(item.image || getAccessoryFallback())
                  : normalizeImageUrl(item.image || "fallback.jpg")
              }
              alt={item.name}
              className="w-24 h-24 rounded-md object-cover border"
              onError={handleImageError}
            />

            <div className="flex-1">
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                Unit price: Rs. {(unitPricePreview || 0).toLocaleString()}
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

              {!isAccessory && (
                <>
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
                </>
              )}

              {/* Note removed - no longer editable in cart editor */}
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
