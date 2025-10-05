import React from "react";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../utils/imageUtils";

function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function OrderItem({ item }) {
  const it = item || {};
  const cake = it.cake || null;
  const isAccessory =
    it.productCategory === "accessory" ||
    String(it.id || "").startsWith("accessory:");

  let imgSrcRaw = isAccessory
    ? it.image || getAccessoryFallback()
    : (cake && (cake.cakeImage || cake.image)) || it.image || "fallback.jpg";

  const imgSrc = normalizeImageUrl(imgSrcRaw);

  const basePrice = Number(it.unitPrice ?? it.price ?? 0) || 0;
  const toppingsTotal = (it.toppings || []).reduce(
    (s, t) => s + Number(t?.price?.price ?? t?.price ?? 0),
    0
  );
  const accessoriesTotal = (it.accessories || []).reduce(
    (s, a) => s + Number(a?.price ?? 0),
    0
  );
  const perUnit = basePrice + toppingsTotal + accessoriesTotal;
  const itemTotal = perUnit * Number(it.qty || 1);

  return (
    <div className="flex gap-4 items-start p-3 sm:p-4 border rounded-lg bg-white w-full">
      <img
        src={imgSrc}
        alt={it.name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0 border"
        onError={handleImageError}
      />

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-gray-900"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
              title={it.name}
            >
              {it.name}
              {it.changeNote ? (
                <span className="text-xs text-gray-500">{` (${it.changeNote})`}</span>
              ) : null}
            </div>
            {it.size && (
              <div className="text-sm text-gray-500">
                Size: {typeof it.size === "string" ? it.size : it.size.size}
              </div>
            )}
            {it.note && <div className="text-sm text-gray-500">{it.note}</div>}
            {it.toppings && it.toppings.length > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                Toppings:{" "}
                {it.toppings.map((t) => t.name || t.toppingId || t).join(", ")}
              </div>
            )}
          </div>

          <div className="text-right mt-0 ml-3 whitespace-nowrap">
            <div className="font-semibold text-pink-600">
              {formatRs(itemTotal)}
            </div>
            <div className="text-sm text-gray-500">
              {Number(it.qty || 1)} × {formatRs(perUnit)}
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-[1fr_auto] gap-0 text-sm text-gray-600">
          {!isAccessory && (
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-400">Base cake</div>
              <div className="text-gray-400">{formatRs(basePrice)}</div>
            </div>
          )}

          {!isAccessory && (
            <div className="flex justify-between items-center mt-0 text-sm">
              <div className="truncate text-gray-400">Add-ons</div>
              <div className="text-gray-400">{formatRs(toppingsTotal)}</div>
            </div>
          )}

          {isAccessory && (
            <div className="flex justify-between items-center mt-0 text-sm">
              <div className="text-gray-400">Accessory price</div>
              <div className="text-gray-400">{formatRs(basePrice)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
