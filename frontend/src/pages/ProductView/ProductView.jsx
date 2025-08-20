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
import AccessoriesPicker from "../../components/AccessoriesPicker";
import { fetchCakeById } from "../../api/cake";
import { fetchToppingsByRef } from "../../api/topping";
import { fetchAccessories } from "../../api/accessory";
import { addCartItem } from "../../api/cart";

const fallbackImg = "/fallback.jpg";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgUrl, setImgUrl] = useState(fallbackImg);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [accessoryQuantities, setAccessoryQuantities] = useState({});
  const [orderHover, setOrderHover] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakeById(id);
        setProduct(data);

        // Set up image URL
        let imageUrl = data.cakeImage;
        if (!imageUrl || typeof imageUrl !== "string") {
          setImgUrl(fallbackImg);
        } else {
          if (!imageUrl.startsWith("/")) {
            imageUrl = "/" + imageUrl.replace(/^(.\/|..\/)+/, "");
          }
          setImgUrl(imageUrl);
        }

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
        setError(err.message);
      }
      setLoading(false);
    }

    async function loadAccessories() {
      try {
        const data = await fetchAccessories();
        setAccessories(data);
      } catch (err) {
        console.error(err);
      }
    }

    if (id) {
      fetchProduct();
      loadAccessories();
    }
  }, [id]);

  const handleImageError = () => {
    setImgUrl(fallbackImg);
  };

  // Calculate topping price for a given size (defaults to current selectedSize)
  // Normalize size strings (case/whitespace) to make matching robust across sources
  // availableToppings is the toppings array from the Topping document referenced by cake.toppingRef
  // selectedToppings are objects from availableToppings
  // getToppingPrice finds the price for the selected cake size
  const getToppingPrice = (topping, sizeIndex = selectedSize) => {
    if (!topping || !Array.isArray(topping.prices)) return 0;
    const selectedSizeName = product?.prices?.[sizeIndex]?.size;
    const normalize = (s) =>
      (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();
    const target = normalize(selectedSizeName);
    let priceObj = topping.prices.find((p) => normalize(p.size) === target);
    // Fallback: match by numeric portion (e.g. '1kg' vs '1Kg' or '500g')
    if (!priceObj) {
      const numeric = (str) => {
        const m = (str || "").toString().match(/([\d.]+)/);
        return m ? m[1] : null;
      };
      const targetNum = numeric(selectedSizeName);
      if (targetNum) {
        priceObj = topping.prices.find((p) => numeric(p.size) === targetNum);
      }
    }
    return priceObj ? priceObj.price : 0;
  };

  // Calculate accessory price
  const getAccessoryPrice = (accessory) => {
    return accessory?.price || 0;
  };

  // Calculate total price
  const getTotalPrice = () => {
    const basePrice = product.prices[selectedSize]?.price || 0;
    const toppingsPrice = selectedToppings.reduce(
      (sum, topping) => sum + getToppingPrice(topping),
      0
    );
    const accessoriesPrice = selectedAccessories.reduce((sum, acc) => {
      const accId = acc._id;
      const accQty = accessoryQuantities[accId] || 1;
      return sum + getAccessoryPrice(acc) * accQty;
    }, 0);
    return (basePrice + toppingsPrice + accessoriesPrice) * quantity;
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

  const handleAccessoryToggle = (accessory) => {
    setSelectedAccessories((prev) => {
      if (prev.includes(accessory)) {
        // remove accessory and its quantity mapping
        setAccessoryQuantities((q) => {
          const id = accessory._id;
          if (!id) return q;
          const copy = { ...q };
          delete copy[id];
          return copy;
        });
        return prev.filter((a) => a !== accessory);
      } else {
        // set default qty 1 for newly added accessory
        setAccessoryQuantities((q) => {
          const id = accessory._id;
          if (!id) return q;
          return { ...q, [id]: 1 };
        });
        return [...prev, accessory];
      }
    });
  };

  const setAccessoryQuantity = (accessoryId, qty) => {
    setAccessoryQuantities((q) => ({ ...q, [accessoryId]: Math.max(1, qty) }));
  };

  const handleAddToCart = () => {
    // Build a normalized cart item using only IDs
    if (!product) return;

    // Prepare toppings payload: [{ toppingId, priceId }]
    // toppingId is the _id of the topping in the toppings array of the Topping document
    // priceId is the _id of the price object for the selected cake size
    const toppingsPayload = (selectedToppings || []).map((topping) => {
      let priceObj = null;
      if (Array.isArray(topping.prices)) {
        const selectedSizeName = product?.prices?.[selectedSize]?.size;
        const normalize = (s) =>
          (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();
        const target = normalize(selectedSizeName);
        priceObj =
          topping.prices.find((p) => normalize(p.size) === target) ||
          topping.prices[selectedSize] ||
          topping.prices[0];
      }
      return {
        toppingId: topping._id,
        priceId: priceObj?._id,
      };
    });

    // Prepare cake item for cart
    const cakeItem = {
      productType: "cake",
      itemId: product._id,
      sizeId: product.prices[selectedSize]?._id,
      qty: quantity,
      toppings: toppingsPayload,
    };

    // Prepare accessory items for cart
    const accessoryItems = (selectedAccessories || []).map((a) => {
      const accQty = accessoryQuantities[a._id] || 1;
      return {
        productType: "accessory",
        accessoryId: a._id,
        itemId: a._id,
        qty: accQty,
        price: a.price,
        name: a.name,
        image: a.image,
      };
    });

    // Use persistent client cartId stored in localStorage
    const clientCartIdKey = "client_cart_id";
    let cartId = localStorage.getItem(clientCartIdKey);
    if (!cartId) {
      cartId = `anon_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(clientCartIdKey, cartId);
    }

    // Add cake item to cart
    addCartItem(cartId, cakeItem)
      .then(() => {
        setCartNotice(`${cakeItem.qty} × ${product.cakeName} added to cart`);
        window.setTimeout(() => setCartNotice(null), 3000);
      })
      .catch(() => {
        setCartNotice("Failed to add to cart");
        window.setTimeout(() => setCartNotice(null), 3000);
      });

    // Add accessory items to cart
    accessoryItems.forEach((accItem) => {
      addCartItem(cartId, accItem).catch(() => {});
    });
  };

  const handleOrderNow = () => {
    const order = {
      product: product._id,
      size: selectedSize,
      quantity,
      toppings: selectedToppings.map((t) => t.name),
      accessories: selectedAccessories.map((a) => a.name),
      price: getTotalPrice(),
    };

    // Navigate to checkout page with the prepared order
    navigate("/checkout", { state: { order } });
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
          <div className="text-gray-500 text-xl mb-4">🍰 Product not found</div>
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

            {/* Size Selection */}
            <CakeSizesOptions
              prices={product.prices}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              onReset={() => setSelectedSize(0)}
            />

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

            {/* Accessories Options (compact popup to match other selectors) */}
            {accessories && accessories.length > 0 && (
              <AccessoriesPicker
                accessories={accessories}
                selectedAccessories={selectedAccessories}
                handleAccessoryToggle={handleAccessoryToggle}
                getAccessoryPrice={getAccessoryPrice}
                onReset={() => {
                  setSelectedAccessories([]);
                  setAccessoryQuantities({});
                }}
                accessoryQuantities={accessoryQuantities}
                setAccessoryQuantity={setAccessoryQuantity}
              />
            )}

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
              <button
                onClick={() => navigate("/custom-cake")}
                className="flex-1 w-full md:w-auto border-2 border-pink-500 text-pink-500 h-14 rounded-lg font-semibold text-lg hover:bg-pink-50 transition duration-300 flex items-center justify-center"
              >
                Customize This Cake
              </button>
            </div>

            {/* transient cart notice */}
            {cartNotice && (
              <div className="mt-3 max-w-xl px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-800">
                {cartNotice}
              </div>
            )}

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
                    {product.prices && product.prices[selectedSize]
                      ? `${Math.ceil(
                          product.prices[selectedSize].price / 500
                        )} people`
                      : "Varies by size"}
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
