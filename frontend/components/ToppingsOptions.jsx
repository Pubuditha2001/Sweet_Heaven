import React from "react";

export default function ToppingsOptions({
  availableToppings,
  selectedToppings,
  handleToppingToggle,
  getToppingPrice,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Toppings</h3>
      {availableToppings && availableToppings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableToppings.map((topping, idx) => (
            <div
              key={idx}
              onClick={() => handleToppingToggle(topping)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 flex flex-col ${
                selectedToppings.includes(topping)
                  ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                  : "border-gray-200 hover:border-pink-300 bg-white hover:shadow-md"
              }`}
            >
              {topping.image && (
                <img
                  src={topping.image}
                  alt={topping.name}
                  className="w-16 h-16 object-cover rounded-full mx-auto mb-2 border border-pink-200"
                  style={{ background: "#fff" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  {topping.name}
                </span>
                <span className="text-lg font-bold text-pink-600">
                  +Rs. {getToppingPrice(topping).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {topping.description}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {topping.prices &&
                  topping.prices.map((pr, i) => (
                    <div key={i}>
                      {pr.size}: Rs. {pr.price}
                    </div>
                  ))}
              </div>
              {selectedToppings.includes(topping) && (
                <div className="mt-2 text-sm text-pink-600">✓ Added</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm py-4">
          No toppings available for this cake.
        </div>
      )}
    </div>
  );
}
