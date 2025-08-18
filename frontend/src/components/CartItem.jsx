import React from "react";

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
  return (
    <div className="flex gap-4 items-start p-3 sm:p-4 border rounded-lg bg-white w-full">
      <img
        src={item.image || "/fallback.jpg"}
        alt={item.name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0 border"
        onError={(e) => (e.target.src = "/fallback.jpg")}
      />

      <div className="flex-1">
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

            {/* Toppings inline tags */}
            {(item.toppings || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(item.toppings || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right mt-0 ml-3 whitespace-nowrap">
            <div className="font-semibold text-pink-600">
              {formatRs((item.unitPrice || item.price || 0) * item.qty)}
            </div>
            <div className="text-sm text-gray-500">
              {formatRs(item.unitPrice || item.price || 0)} each
            </div>
          </div>
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
