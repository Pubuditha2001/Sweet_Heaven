import React, { useState, useRef, useEffect } from "react";

export default function CakeSizesOptions({
  prices,
  selectedSize,
  setSelectedSize,
  onReset,
}) {
  if (!prices || prices.length === 0) return null;

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // prevent page behind the modal from scrolling when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return undefined;
  }, [open]);

  const current = prices[selectedSize] || prices[0];

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block text-lg font-semibold text-gray-900 mb-2">
        Choose Size
      </label>

      {/* Compact trigger button that displays selected option */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 h-14 border rounded-lg bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
      >
        <div className="text-base font-medium text-gray-900">
          {current.size}
        </div>
        <div className="text-base font-semibold text-pink-600">
          Rs. {current.price.toLocaleString()}
        </div>
      </button>

      {/* Popover with a denser grid of options */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-lg p-6 max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Size
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {prices.map((priceOption, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedSize(index);
                    setOpen(false);
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 text-left ${
                    selectedSize === index
                      ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-pink-300 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-gray-900">
                      {priceOption.size}
                    </span>
                    <span className="text-sm font-semibold text-pink-600">
                      Rs. {priceOption.price.toLocaleString()}
                    </span>
                  </div>
                  {selectedSize === index && (
                    <div className="mt-2 text-sm text-pink-600">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onReset && onReset()}
                className="mr-3 px-4 py-2 bg-gray-300 border rounded-md text-sm hover:bg-gray-400 text-gray-800"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
