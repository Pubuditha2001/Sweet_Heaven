import React, { useState, useRef, useEffect } from "react";

export default function ToppingsOptions({
  availableToppings,
  selectedToppings,
  handleToppingToggle,
  getToppingPrice,
  selectedSize,
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

  // prevent background page from scrolling when modal is open
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

  const selectedCount = selectedToppings ? selectedToppings.length : 0;

  // total price of selected toppings for the current cake size
  const totalSelectedPrice = (selectedToppings || []).reduce((sum, t) => {
    try {
      return sum + (getToppingPrice ? getToppingPrice(t, selectedSize) : 0);
    } catch (e) {
      return sum;
    }
  }, 0);

  // helper to normalize image paths like './toppings/foo.jpg' -> '/toppings/foo.jpg'
  const normalizeImagePath = (p) => {
    if (!p || typeof p !== "string") return null;
    if (p.startsWith("/")) return p;
    return "/" + p.replace(/^(\.\.\/|\.\/)+/, "");
  };

  // Try alternative extensions if the image 404s
  const handleToppingImgError = (e) => {
    const el = e.target;
    try {
      const src = el.getAttribute("src") || "";
      const srcNoQuery = src.split("?")[0];
      const base = srcNoQuery.replace(/\.[^/.?#]+($|\?)/, "");
      const candidates = [".webp", ".png", ".jpg", ".jpeg"];
      const currentExtMatch = srcNoQuery.match(/(\.[^/.?#]+)(?:$|\?)/);
      const currentExt = currentExtMatch
        ? currentExtMatch[1].toLowerCase()
        : null;
      let tried = parseInt(el.dataset.altIndex || "0", 10);
      const ordered = candidates.filter((ext) => ext !== currentExt);
      if (tried >= ordered.length) {
        el.style.display = "none";
        return;
      }
      const next = base + ordered[tried];
      el.dataset.altIndex = tried + 1;
      el.src = next;
    } catch (err) {
      el.style.display = "none";
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block text-lg font-semibold text-gray-900 mb-2">
        Toppings
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 h-14 border rounded-lg bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
      >
        <div className="text-base font-medium text-gray-900">
          {selectedCount > 0 ? `${selectedCount} selected` : "Choose toppings"}
        </div>
        <div className="text-base font-semibold text-pink-600">
          {selectedCount > 0
            ? `+Rs. ${totalSelectedPrice.toLocaleString()}`
            : "Add"}
        </div>
      </button>

      {open && (
        <>
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
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl"
              style={{
                position: "relative",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-2 py-4 border-b border-gray-200"
                style={{ flexShrink: 0 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Choose Toppings
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

              <style>{`
                @media (max-width: 767px) {
                  .modal-scrollable::-webkit-scrollbar { display: none; }
                  .modal-scrollable { -ms-overflow-style: none; scrollbar-width: none; }
                }
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
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="grid grid-cols-1 gap-4">
                  {(availableToppings || []).length > 0 ? (
                    availableToppings.map((topping, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToppingToggle(topping)}
                        className={`w-full min-w-0 p-3 md:p-2 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-start gap-4 text-left ${
                          selectedToppings.includes(topping)
                            ? "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-pink-300 bg-white"
                        }`}
                      >
                        {normalizeImagePath(topping.image) && (
                          <img
                            src={normalizeImagePath(topping.image)}
                            alt={topping.name}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            onError={handleToppingImgError}
                            data-alt-index="0"
                          />
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 text-base md:text-sm">
                              {topping.name}
                            </span>
                            <span className="text-sm font-semibold text-pink-600">
                              +Rs.{" "}
                              {(getToppingPrice
                                ? getToppingPrice(topping, selectedSize)
                                : 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-2 md:mt-1 md:text-sm">
                            {topping.description}
                          </div>
                          {selectedToppings.includes(topping) && (
                            <div className="mt-2 text-sm text-pink-600">
                              ✓ Added
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm py-4">
                      No toppings available for this cake.
                    </div>
                  )}
                </div>
              </div>

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
