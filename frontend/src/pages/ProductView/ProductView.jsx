import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaHeart,
  FaShare,
} from "react-icons/fa";
import ToppingsOptions from "../../components/ToppingsOptions";
import CakeSizesOptions from "../../components/CakeSizesOptions";
import { fetchCakeById } from "../../api/cake";
import { fetchToppingsByRef } from "../../api/topping";
import { addCartItem } from "../../api/cart";
import CartResultPopUp from "../../components/CartResultPopUp";
import {
  normalizeImageUrl,
  handleImageError,
  getToppingFallback,
} from "../../utils/imageUtils";

const fallbackImg = normalizeImageUrl("fallback.jpg");

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgUrl, setImgUrl] = useState(normalizeImageUrl("fallback.jpg"));
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [availableToppings, setAvailableToppings] = useState([]);
  // accessories moved to a separate page
  const [orderHover, setOrderHover] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const [showAccessoryPopup, setShowAccessoryPopup] = useState(false);
  const [addStatus, setAddStatus] = useState(null); // 'pending' | 'success' | 'failed'
  const [addMessage, setAddMessage] = useState("");
  const [lastCakeItem, setLastCakeItem] = useState(null);
  const [lastCartId, setLastCartId] = useState(null);

  // Utility to extract a plain id string from different id shapes
  const extractId = (val) => {
    if (val === null || val === undefined) return val;
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      // common Mongoose/_id shapes
      if (val._id) {
        try {
          return typeof val._id === "string" ? val._id : val._id.toString();
        } catch (e) {
          return String(val._id);
        }
      }
      if (val.$oid) return val.$oid;
      try {
        return val.toString();
      } catch (e) {
        return JSON.stringify(val);
      }
    }
    return String(val);
  };

  const handleRetry = () => {
    if (!lastCartId || !lastCakeItem) return;
    setAddStatus("pending");
    setAddMessage("Retrying...");
    addCartItem(lastCartId, lastCakeItem)
      .then(() => {
        const msg = `${lastCakeItem.qty} × ${product.cakeName} added to cart`;
        setAddStatus("success");
        setAddMessage(msg);
        setCartNotice(msg);
      })
      .catch(() => {
        setAddStatus("failed");
        setAddMessage("Retry failed");
      });
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakeById(id);
        if (!data) {
          setError("This cake is currently not available or has been removed");
          setProduct(null);
          setLoading(false);
          return;
        }
        setProduct(data);

        // Set up image URL
        let imageUrl = data.cakeImage;
        setImgUrl(normalizeImageUrl(imageUrl));

        // Fetch toppings using toppingRef (ObjectId of toppings list)
        let toppingsList = [];
        if (data && data.toppingRef) {
          const toppingData = await fetchToppingsByRef(data.toppingRef);
          toppingsList = toppingData.toppings || [];
          setAvailableToppings(toppingsList);
          console.log("Fetched toppings:", toppingsList);
        } else {
          setAvailableToppings([]);
          console.log("No toppingRef found in cake data.");
        }
        setSelectedToppings([]);
      } catch (err) {
        setError("This cake is currently not available");
      }
      setLoading(false);
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Calculate topping price for a given size (defaults to current selectedSize)
  // Normalize size strings (case/whitespace) to make matching robust across sources
  // availableToppings is the toppings array from the Topping document referenced by cake.toppingRef
  // selectedToppings are objects from availableToppings
  // getToppingPrice finds the price for the selected cake size
  const getToppingPrice = (topping, sizeIndex = selectedSize) => {
    if (!topping || !Array.isArray(topping.prices)) return 0;
    // Match by cake price 'size' string (e.g. '1 Kg', 'Small') first
    const selectedSizeName = product?.prices?.[sizeIndex]?.size;
    const normalize = (s) =>
      (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();

    let priceObj = null;
    if (selectedSizeName) {
      const target = normalize(selectedSizeName);
      priceObj = topping.prices.find((p) => normalize(p.size) === target);
    }

    // Fallback: match by numeric portion (e.g. '1kg' vs '500g')
    if (!priceObj) {
      const numeric = (str) => {
        const m = (str || "").toString().match(/([\d.]+)/);
        return m ? m[1] : null;
      };
      const targetNum = numeric(product?.prices?.[sizeIndex]?.size);
      if (targetNum) {
        priceObj = topping.prices.find((p) => numeric(p.size) === targetNum);
      }
    }

    // Final fallback: first price entry or zero
    if (!priceObj) priceObj = topping.prices[0] || null;
    return priceObj ? priceObj.price : 0;
  };

  // accessory pricing moved to Accessories page

  // Calculate total price
  const getTotalPrice = () => {
    // Handle both pricing models
    let basePrice = 0;

    if (product.priceBasedPricing === false) {
      // Single price model - use the single price field
      basePrice = product.price || 0;
    } else {
      // Size-based pricing model (priceBasedPricing is true or undefined)
      basePrice = product.prices?.[selectedSize]?.price || 0;
    }

    const toppingsPrice = selectedToppings.reduce(
      (sum, topping) => sum + getToppingPrice(topping),
      0
    );
    return (basePrice + toppingsPrice) * quantity;
  };

  const handleToppingToggle = (topping) => {
    setSelectedToppings((prev) => {
      if (prev.includes(topping)) {
        return prev.filter((t) => t !== topping);
      } else {
        return [...prev, topping];
      }
    });
  };

  // accessory selection/quantities handled on Accessories page

  const handleAddToCart = () => {
    // Build a normalized cart item using only IDs
    if (!product) return;

    // Prepare toppings payload: array of topping id strings
    // Backend expects an array of ids (not objects). Normalize to plain id strings.
    const toppingsPayload = (selectedToppings || []).map((topping) => {
      const rawId = topping && (topping._id || topping);
      return extractId(rawId);
    });

    // Prepare cake item for cart
    const cakeItem = {
      productType: "cake",
      // send plain id string for itemId
      itemId: extractId(product._id),
      // store the size value (string) so backend can look up current price by size
      // For single price model, use a default size identifier
      sizeId:
        product.priceBasedPricing === false
          ? "standard"
          : product.prices?.[selectedSize]?.size,
      qty: quantity,
      // only include toppings when user selected any (keep undefined when none)
      ...(toppingsPayload && toppingsPayload.length
        ? { toppings: toppingsPayload }
        : {}),
    };

    // Use persistent client cartId stored in localStorage
    const clientCartIdKey = "client_cart_id";
    let cartId = localStorage.getItem(clientCartIdKey);
    if (!cartId) {
      cartId = `anon_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(clientCartIdKey, cartId);
    }

    // store for retry
    setLastCakeItem(cakeItem);
    setLastCartId(cartId);

    // show modal and pending status immediately
    setAddStatus("pending");
    setAddMessage("Adding to cart...");
    setShowAccessoryPopup(true);

    // Add cake item to cart
    addCartItem(cartId, cakeItem)
      .then(() => {
        const msg = `${cakeItem.qty} × ${product.cakeName} added to cart`;
        setAddStatus("success");
        setAddMessage(msg);
        setCartNotice(msg);
        // keep modal open so user can choose next action
        window.setTimeout(() => setCartNotice(null), 3000);
      })
      .catch(() => {
        const msg = "Failed to add to cart";
        setAddStatus("failed");
        setAddMessage(msg);
        setCartNotice(msg);
        window.setTimeout(() => setCartNotice(null), 3000);
      });

    // accessories are added from the Accessories page now
  };

  const handleOrderNow = () => {
    // Create item in the format expected by checkout page
    const orderItem = {
      itemId: extractId(product._id),
      productId: extractId(product._id),
      name: product.cakeName,
      cakeName: product.cakeName,
      productName: product.cakeName,
      qty: quantity,
      price: getTotalPrice(),
      unitPrice:
        product.priceBasedPricing === false
          ? product.price || 0
          : product.prices?.[selectedSize]?.price || 0,
      size:
        product.priceBasedPricing === false
          ? "Standard"
          : product.prices?.[selectedSize]?.size,
      sizeId:
        product.priceBasedPricing === false
          ? "standard"
          : product.prices?.[selectedSize]?.size,
      productType: "cake",
      productCategory: "cake",
      toppings: selectedToppings.map((topping) => ({
        name: topping.name || topping.toppingName,
        toppingName: topping.name || topping.toppingName,
        toppingId: extractId(topping._id),
        id: extractId(topping._id),
        price: {
          price: getToppingPrice(topping),
        },
      })),
      accessories: [], // No accessories selected from this page
      cake: {
        _id: extractId(product._id),
        id: extractId(product._id),
        cakeName: product.cakeName,
        cakeImage: product.cakeImage,
      },
    };

    // Navigate to checkout page with the prepared order items
    navigate("/checkout", { state: { items: [orderItem] } });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.cakeName,
        text: product.cakeDescription,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl text-pink-600 font-medium">
            Loading delicious details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-red-500 text-xl mb-4">😔 {error}</div>
          <p className="text-gray-600 mb-6">
            This cake might have been removed or is temporarily unavailable.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 focus:from-pink-600 focus:to-purple-600 focus:outline-none active:from-pink-700 active:to-purple-700 transition duration-300 shadow-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-gray-500 text-xl mb-4">
            🍰 Cake not available
          </div>
          <p className="text-gray-600 mb-6">
            This cake is currently not available or has been removed.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 focus:from-pink-600 focus:to-purple-600 focus:outline-none active:from-pink-700 active:to-purple-700 transition duration-300 shadow-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate("/menu")}
          className="flex items-center bg-pink-500 text-white hover:bg-pink-600 focus:bg-pink-600 focus:outline-none active:bg-pink-700 transition-colors duration-200 font-medium px-4 py-2 rounded-lg"
        >
          <FaArrowLeft className="mr-2 text-white" />
          Back to Menu
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-xl">
                <img
                  src={imgUrl}
                  alt={product.cakeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                />
              </div>
              {/* Floating action buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    isFavorited
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-600 hover:text-red-500"
                  }`}
                >
                  <FaHeart />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-white text-gray-600 hover:text-pink-500 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.cakeName}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.cakeDescription}
              </p>
            </div>

            {/* Detailed Description Section */}
            {product.detailedDescription && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-pink-100">
                <h3 className="text-lg font-semibold text-pink-600 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 text-base whitespace-pre-line">
                  {product.detailedDescription}
                </p>
              </div>
            )}

            {/* Category Badge */}
            <div>
              <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            {/* Price/Size Selection */}
            {product.priceBasedPricing === false ? (
              /* Single Price Display - matching CakeSizesOptions style */
              <div className="w-full flex items-center justify-between px-4 py-3 h-14 border rounded-lg bg-white border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md">
                <div className="text-base font-medium text-gray-900">Price</div>
                <div className="text-base font-semibold text-pink-600">
                  Rs. {Number(product.price || 0).toLocaleString()}
                </div>
              </div>
            ) : (
              /* Size Selection - show for size-based pricing */
              <CakeSizesOptions
                prices={product.prices}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                onReset={() => setSelectedSize(0)}
              />
            )}

            {/* Topping Options */}
            <div className="space-y-4">
              <ToppingsOptions
                availableToppings={availableToppings}
                selectedToppings={selectedToppings}
                handleToppingToggle={handleToppingToggle}
                getToppingPrice={getToppingPrice}
                selectedSize={selectedSize}
                onReset={() => setSelectedToppings([])}
              />
            </div>

            {/* Accessories have been moved to their own page. */}

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quantity
                </h3>
                <div className="flex items-center space-x-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <div className="text-xl text-gray-900 font-semibold px-6 py-3 rounded-xl min-w-[80px] text-center ">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price Section */}
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total Price:
                </span>
                <span className="text-2xl font-bold text-pink-600">
                  Rs. {getTotalPrice().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white h-14 rounded-lg font-semibold text-lg transition duration-300 flex items-center justify-center space-x-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <FaShoppingCart />
                <span>Add to Cart</span>
              </button>

              {/* Order Now */}
              <button
                onClick={handleOrderNow}
                onMouseEnter={() => setOrderHover(true)}
                onMouseLeave={() => setOrderHover(false)}
                style={{ backgroundColor: orderHover ? "#27a88f" : "#2ebfa5" }}
                className="flex-1 w-full md:w-auto text-white h-14 rounded-lg font-semibold text-lg transition duration-300 flex items-center justify-center space-x-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <span>Order Now</span>
              </button>

              {/* Customize */}
              {/* <button
                onClick={() => navigate("/custom-cake")}
                className="flex-1 w-full md:w-auto border-2 border-pink-500 text-pink-500 h-14 rounded-lg font-semibold text-lg hover:bg-pink-50 transition duration-300 flex items-center justify-center"
              >
                Customize This Cake
              </button> */}
            </div>

            {/* transient cart notice */}
            {cartNotice && (
              <div className="mt-3 max-w-xl px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-800">
                {cartNotice}
              </div>
            )}

            {/* Modal moved to CartResultPopUP component */}
            <CartResultPopUp
              show={showAccessoryPopup}
              status={addStatus}
              message={addMessage}
              onClose={() => setShowAccessoryPopup(false)}
              onRetry={handleRetry}
              onBuyAnother={() => {
                setShowAccessoryPopup(false);
                navigate("/menu");
              }}
              onAddAccessories={() => navigate("/accessories")}
            />

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-white to-pink-50 p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🍰 Cake Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="flex items-center">Preparation Time</span>
                  <span className="font-medium text-pink-600">2-24 hours</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="flex items-center">Serves:</span>
                  <span className="font-medium text-pink-600">
                    {(() => {
                      if (product.priceBasedPricing === false) {
                        // Single price model - use single price field
                        const basePrice = product.price || 0;
                        return `${Math.ceil(basePrice / 500)} people`;
                      } else if (
                        product.prices &&
                        product.prices[selectedSize]
                      ) {
                        // Size-based pricing model
                        return `${Math.ceil(
                          product.prices[selectedSize].price / 500
                        )} people`;
                      } else {
                        return "Varies by size";
                      }
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="flex items-center">Storage</span>
                  <span className="font-medium text-pink-600">
                    Refrigerate for best taste
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="flex items-center">Delivery</span>
                  <span className="font-medium text-pink-600">
                    Available citywide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
