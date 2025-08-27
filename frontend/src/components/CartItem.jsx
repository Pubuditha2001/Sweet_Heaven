function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onEdit,
  onRemoveAccessory,
}) {
  // New backend format: item.cake, item.size, item.toppings
  const cake = item.cake;
  const size = item.size;
  const toppings = item.toppings || [];

  const isAccessory =
    item.productCategory === "accessory" ||
    String(item.id || "").startsWith("accessory:");

  const basePrice = size?.price || 0;
  const toppingsTotal = toppings.reduce(
    (sum, t) => sum + (t.price?.price || 0),
    0
  );
  const subtotal = basePrice + toppingsTotal;

  return (
    <div className="flex gap-4 items-start p-3 sm:p-4 border rounded-lg bg-white w-full">
      {isAccessory ? (
        item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0 border"
            onError={(e) => (e.target.src = "/accessoryFallback.png")}
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md flex-shrink-0 border bg-gray-50" />
        )
      ) : (
        <img
          src={cake?.cakeImage ? cake.cakeImage : "/fallback.jpg"}
          alt={item.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0 border"
          onError={(e) => (e.target.src = "/fallback.jpg")}
        />
      )}

      <div className="flex-1">
        {/* Header: name left, total and per-unit on right (reference layout) */}
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-gray-900"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
              title={item.name}
            >
              {item.name}
            </div>
            {item.size && (
              <div className="text-sm text-gray-500">
                Size: {item.size.size}
              </div>
            )}
            {item.note && (
              <div className="text-sm text-gray-500">{item.note}</div>
            )}
          </div>
          <div className="text-right mt-0 ml-3 whitespace-nowrap">
            <div className="font-semibold text-pink-600">
              {isAccessory
                ? formatRs((item.unitPrice || item.price || 0) * item.qty)
                : formatRs(subtotal * item.qty)}
            </div>
          </div>
        </div>

        {/* Price breakdown: labels left, prices right */}
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-0 text-sm text-gray-600">
          {/* Base cake price: only for cake items */}
          {!(
            item.productCategory === "accessory" ||
            String(item.id || "").startsWith("accessory:")
          ) && (
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-400">Base cake</div>
              <div className="text-gray-400">
                {cake
                  ? formatNumber(
                      cake.prices?.[item.sizeIndex || 0]?.price ||
                        item.price ||
                        0
                    )
                  : formatNumber(item.price || 0)}
              </div>
            </div>
          )}

          {/* Add-ons: always show row for cake items; show '- 0' when none */}
          {!isAccessory && (
            <div className="flex justify-between items-center mt-0 text-sm">
              <div className="truncate text-gray-400">Add-ons</div>
              <div className="text-gray-400">{formatNumber(toppingsTotal)}</div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-2">
          {isAccessory ? (
            <>{formatRs(item.unitPrice || item.price || 0)} each</>
          ) : (
            // Cake: show subtotal × qty = total (avoid duplicating base+toppings)
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-400 font-bold">Total</div>
              <div className="text-gray-400">
                <span className="font-medium font-bold">{item.qty}</span>
                <span className="px-3">X</span>
                <span className="text-gray-400 font-bold">
                  {formatNumber(subtotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
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
