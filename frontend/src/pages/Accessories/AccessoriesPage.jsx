import React, { useEffect, useState } from "react";
import { fetchAccessories } from "../../api/accessory";
import { addCartItem } from "../../api/cart";
import { FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import CartResultPopUp from "../../components/CartResultPopUp";
import AccessoryAddPopup from "../../components/AccessoryAddPopup";
import { useNavigate } from "react-router-dom";

export default function AccessoriesPage() {
  const navigate = useNavigate();
  const [accessories, setAccessories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [addingIds, setAddingIds] = useState({});
  const [cartPopup, setCartPopup] = useState({
    show: false,
    status: "pending",
    message: "",
  });
  const [lastAcc, setLastAcc] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAccessories();
        setAccessories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load accessories");
      }
      setLoading(false);
    }
    load();
  }, []);

  const basePublic = import.meta?.env?.BASE_URL || "/";

  const getImageSrc = (image) => {
    if (!image) return `${basePublic}accessoryFallback.png`;
    if (typeof image === "string") {
      // absolute URLs or root-relative paths are fine as-is
      if (image.startsWith("/") || image.startsWith("http")) return image;
      // otherwise treat as a path relative to public
      return `${basePublic}${image}`;
    }
    if (typeof image === "object") {
      // common cloudinary / upload shapes
      return (
        image.url ||
        image.secure_url ||
        image.path ||
        `${basePublic}accessoryFallback.png`
      );
    }
    return `${basePublic}accessoryFallback.png`;
  };

  const setQty = (id, qty) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Number(qty) || 1) }));
  };

  const handleAdd = async (acc) => {
    setLastAcc(acc);
    const clientCartIdKey = "client_cart_id";
    let cartId = localStorage.getItem(clientCartIdKey);
    if (!cartId) {
      cartId = `anon_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(clientCartIdKey, cartId);
    }
    const qty = Number(quantities[acc._id] || 1) || 1;
    // mark as adding
    setAddingIds((s) => ({ ...s, [acc._id]: true }));
    // show popup pending
    setCartPopup({
      show: true,
      status: "pending",
      message: `Adding ${acc.name}...`,
    });

    const accItem = {
      productType: "accessory",
      accessoryId: String(acc._id),
      itemId: String(acc._id),
      qty,
      price: acc.price,
      name: acc.name,
      image: acc.image,
    };

    try {
      await addCartItem(cartId, accItem);
      const msg = `${qty} × ${acc.name} added to cart`;
      setNotice(msg);
      setCartPopup({ show: true, status: "success", message: msg });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      const msg = err?.message || "Failed to add accessory to cart";
      setNotice(msg);
      setCartPopup({ show: true, status: "failed", message: msg });
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setAddingIds((s) => {
        const copy = { ...s };
        delete copy[acc._id];
        return copy;
      });
    }
  };

  const handlePopupClose = () => {
    setCartPopup((p) => ({ ...p, show: false }));
  };

  const handlePopupRetry = () => {
    if (lastAcc) handleAdd(lastAcc);
  };

  const handleAddAccessories = () => {
    // we are already on accessories page; just close popup
    setCartPopup((p) => ({ ...p, show: false }));
  };

  const handleBuyAnother = () => {
    // close popup; could navigate to cakes or home if desired
    setCartPopup((p) => ({ ...p, show: false }));
  };

  const handleGoToCart = () => {
    setCartPopup((p) => ({ ...p, show: false }));
    navigate("/cart");
  };

  if (loading) return <div className="p-6">Loading accessories...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="px-4 py-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
      <h1 className="text-2xl font-black text-gray-900 mb-4">Accessories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {accessories.map((acc, index) => (
          <div
            key={acc._id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            {/* <div className="flex flex-col h-90 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"> */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col h-full hover:shadow-2xl transition-all duration-300 relative group">
              <div className="flex justify-center items-center p-2 relative">
                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl m-2 flex items-center justify-center">
                  <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-pink-500 px-3 py-1 rounded-full text-sm">
                    View
                  </span>
                </div> */}
                <div className="w-40 h-40 rounded-xl object-cover bg-center block md:hidden">
                  {getImageSrc(acc.image) && (
                    <img
                      src={getImageSrc(acc.image)}
                      alt={acc.name}
                      className="w-full h-full rounded-xl object-cover bg-center"
                      onError={(e) => {
                        const fb = `${basePublic}accessoryFallback.png`;
                        if (e.currentTarget.src !== fb) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fb;
                        }
                      }}
                    />
                  )}
                </div>
                <div
                  className="hidden md:block w-full"
                  style={{ aspectRatio: "1 / 1" }}
                >
                  {getImageSrc(acc.image) && (
                    <img
                      src={getImageSrc(acc.image)}
                      alt={acc.name}
                      className="w-full h-full rounded-xl object-cover bg-center"
                      style={{ aspectRatio: "1 / 1" }}
                      onError={(e) => {
                        const fb = `${basePublic}accessoryFallback.png`;
                        if (e.currentTarget.src !== fb) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fb;
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <div
                className="pt-2 pb-4 px-3 md:px-4 flex flex-col flex-1 justify-start"
                style={{ minHeight: "110px" }}
              >
                <h2
                  className="font-black text-gray-900 mb-1 text-left truncate"
                  style={{
                    minHeight: "22px",
                    maxHeight: "22px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {acc.name}
                </h2>
                {acc.description && (
                  <p
                    className="text-sm text-gray-500 mb-2 text-left"
                    style={{
                      minHeight: "40px",
                      maxHeight: "40px",
                      overflow: "hidden",
                    }}
                  >
                    {acc.description}
                  </p>
                )}

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-pink-600 font-bold">
                    Rs.{" "}
                    {(acc.price * (quantities[acc._id] || 1)).toLocaleString()}
                  </p>

                  {/* <div className="inline-flex items-center bg-pink-500 text-white rounded-full px-3 py-1">/ */}
                  {/* Quantity and Add to Cart - Mobile Optimized */}
                  <div className="mt-auto space-y-2 md:space-y-3">
                    {/* Quantity Selector - Compact for mobile */}
                    <div className="flex items-center justify-center md:justify-start">
                      <div className="flex items-center rounded-lg p-1">
                        <button
                          onClick={() =>
                            setQty(
                              acc._id,
                              Math.max(1, (quantities[acc._id] || 1) - 1)
                            )
                          }
                          className="p-1 md:p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 text-gray-400"
                          disabled={(quantities[acc._id] || 1) <= 1}
                        >
                          <FaMinus size={10} className="md:w-3 md:h-3" />
                        </button>
                        <span className="px-3 md:px-4 py-1 text-sm md:text-base font-semibold text-gray-900 min-w-[32px] md:min-w-[40px] text-center">
                          {quantities[acc._id] || 1}
                        </span>
                        <button
                          onClick={() =>
                            setQty(acc._id, (quantities[acc._id] || 1) + 1)
                          }
                          className="p-1 md:p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-400"
                        >
                          <FaPlus size={10} className="md:w-3 md:h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(acc)}
                  disabled={!!addingIds[acc._id]}
                  className={`mt-3 mx-auto w-11/12 sm:ml-auto sm:w-11/12 md:w-11/12 bg-pink-500 text-white px-3 py-2 sm:py-1 rounded-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {addingIds[acc._id] ? (
                    <span className="text-sm">Adding...</span>
                  ) : (
                    <>
                      <FaShoppingCart className="w-4 h-4 md:w-6 md:h-6" /> Add
                    </>
                  )}
                </button>
                {/* </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {notice && (
        <div className="mt-4 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded">
          {notice}
        </div>
      )}
      {/* keep legacy CartResultPopUp available but render new AccessoryAddPopup for accessories */}
      <AccessoryAddPopup
        show={cartPopup.show}
        status={cartPopup.status}
        message={cartPopup.message}
        onClose={handlePopupClose}
        onGoToCart={handleGoToCart}
      />
    </div>
  );
}
