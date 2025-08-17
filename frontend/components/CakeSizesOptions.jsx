import React from "react";

export default function CakeSizesOptions({
  prices,
  selectedSize,
  setSelectedSize,
}) {
  if (!prices || prices.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Choose Size & Price
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prices.map((priceOption, index) => (
          <div
            key={index}
            onClick={() => setSelectedSize(index)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedSize === index
                ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                : "border-gray-200 hover:border-pink-300 bg-white hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">
                {priceOption.size}
              </span>
              <span className="text-lg font-bold text-pink-600">
                Rs. {priceOption.price.toLocaleString()}
              </span>
            </div>
            {selectedSize === index && (
              <div className="mt-2 text-sm text-pink-600">✓ Selected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
