import React from "react";

export default function AccessoryRow({
  accessory,
  onRemove,
  parentItemId,
  parentQty = 1,
}) {
  const price = accessory.price || 0;
  const total = price * (parentQty || 1);
  const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-white mt-2">
      <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
        {accessory.image ? (
          <img
            src={accessory.image}
            alt={accessory.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-xs text-gray-500">acc</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="font-medium text-gray-900 truncate">
            {accessory.name}
          </div>
          <div className="text-sm text-gray-600">{fmt(total)}</div>
        </div>
        {parentQty > 1 && (
          <div className="text-xs text-gray-500 mt-1">
            Quantity: {parentQty} × {fmt(price)}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() =>
            onRemove &&
            onRemove(
              parentItemId,
              accessory.id || accessory._id || accessory.name
            )
          }
          className="text-sm text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
