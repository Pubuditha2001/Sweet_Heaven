import React, { useState, useRef, useEffect } from "react";

export default function AccessoriesPicker({
  accessories,
  selectedAccessories,
  handleAccessoryToggle,
  getAccessoryPrice,
  onReset,
}) {
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

  // Lock background scroll while modal is open
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

  const selectedCount = selectedAccessories ? selectedAccessories.length : 0;

  // total price of selected accessories
  const totalSelectedPrice = (selectedAccessories || []).reduce((sum, a) => {
    try {
      return sum + (getAccessoryPrice ? getAccessoryPrice(a) : 0);
    } catch (e) {
      return sum;
    }
  }, 0);

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block text-lg font-semibold text-gray-900 mb-2">
        Accessories
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 h-14 border rounded-lg bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
      >
        <div className="text-base font-medium text-gray-900">
          {selectedCount > 0
            ? `${selectedCount} selected`
            : "Choose accessories"}
        </div>
        <div className="text-base font-semibold text-pink-600">
          {selectedCount > 0
            ? `+Rs. ${totalSelectedPrice.toLocaleString()}`
            : "Add"}
        </div>
      </button>

      {open && (
        <>
          {/* Portal-style overlay - prevents conflicts */}
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setOpen(false)}
          >
            {/* Modal content with explicit scrolling */}
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
              style={{
                position: "relative",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div
                className="px-6 py-4 border-b border-gray-200"
                style={{ flexShrink: 0 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Choose Accessories
                  </h3>
                  <button
                    onClick={() => setOpen(false)}
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

                {selectedCount > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedCount} selected • +Rs.{" "}
                    {totalSelectedPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div
                className="px-6 py-4"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch", // Better mobile scrolling
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessories.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAccessoryToggle(acc)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 flex flex-col text-left ${
                        selectedAccessories.includes(acc)
                          ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                          : "border-gray-200 hover:border-pink-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {acc.name}
                        </span>
                        <span className="text-sm font-semibold text-pink-600">
                          +Rs. {getAccessoryPrice(acc).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {acc.description}
                      </div>
                      {selectedAccessories.includes(acc) && (
                        <div className="mt-2 text-sm text-pink-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Added
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed Footer */}
              <div
                className="px-6 py-4 border-t border-gray-200 bg-gray-50"
                style={{ flexShrink: 0 }}
              >
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => onReset && onReset()}
                    className="px-4 py-2 bg-gray-200 border rounded-md text-sm hover:bg-gray-300 text-gray-800 transition-colors"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 font-medium transition-colors"
                  >
                    Done ({selectedCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
