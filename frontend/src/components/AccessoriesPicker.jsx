import React, { useState, useRef, useEffect } from "react";
import { normalizeImageUrl, handleImageError } from "../utils/imageUtils";

export default function AccessoriesPicker({
  accessories,
  selectedAccessories,
  handleAccessoryToggle,
  getAccessoryPrice,
  onReset,
  accessoryQuantities = {},
  setAccessoryQuantity = () => {},
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
                className="px-2 py-4 border-b border-gray-200"
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

              {/* Scrollable Content: hide scrollbar on mobile; show thin styled scrollbar on desktop */}
              <style>{`
                /* mobile: hide scrollbar */
                @media (max-width: 767px) {
                  .modal-scrollable::-webkit-scrollbar { display: none; }
                  .modal-scrollable { -ms-overflow-style: none; scrollbar-width: none; }
                }
                /* desktop: thin, subtle scrollbar */
                @media (min-width: 768px) {
                  .modal-scrollable { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.12) transparent; }
                  .modal-scrollable::-webkit-scrollbar { width: 8px; }
                  .modal-scrollable::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 9999px; }
                  .modal-scrollable::-webkit-scrollbar-track { background: transparent; }
                }
              `}</style>
              <div
                className="px-6 py-4 modal-scrollable"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch", // Better mobile scrolling
                }}
              >
                <div className="grid grid-cols-1 gap-4">
                  {accessories.map((acc, idx) => {
                    const isSelected = selectedAccessories.includes(acc);
                    const accId = acc._id;
                    const qty = accessoryQuantities[accId] || 1;
                    return (
                      <div
                        key={idx}
                        className={`w-full min-w-0 p-0 border rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-start gap-4 text-left relative overflow-hidden ${
                          isSelected
                            ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-pink-300 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleAccessoryToggle(acc)}
                          className="flex items-start gap-4 flex-1 text-left bg-transparent border-0 p-3 md:p-2"
                        >
                          {normalizeImageUrl(acc.image) && (
                            <img
                              src={normalizeImageUrl(acc.image)}
                              alt={acc.name}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              onError={handleImageError}
                              data-alt-index="0"
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 text-base md:text-sm">
                                {acc.name}
                              </span>
                              <span className="text-sm font-semibold text-pink-600">
                                +Rs. {getAccessoryPrice(acc).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2 md:mt-1 md:text-sm">
                              {acc.description}
                            </div>
                            {isSelected && (
                              <div className="mt-2 text-sm text-pink-600">
                                ✓ Added
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Compact quantity control anchored bottom-right when selected */}
                        {isSelected && (
                          <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded px-1 py-0.5 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setAccessoryQuantity(
                                  accId,
                                  Math.max(1, qty - 1)
                                )
                              }
                              aria-label={`Decrease quantity for ${acc.name}`}
                              className="w-5 h-5 flex items-center justify-center text-xs bg-gray-300 hover:bg-gray-200 rounded p-0 leading-none box-border"
                            >
                              -
                            </button>
                            <div className="w-5 text-center text-xs font-medium text-gray-900">
                              {qty}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAccessoryQuantity(accId, qty + 1)
                              }
                              aria-label={`Increase quantity for ${acc.name}`}
                              className="w-5 h-5 flex items-center justify-center text-xs bg-gray-300 hover:bg-gray-200 rounded p-0 leading-none box-border"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
