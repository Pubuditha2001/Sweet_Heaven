import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaHeart,
  FaShare,
} from "react-icons/fa";

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

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/cakes/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        // Set up image URL
        let imageUrl = data.cakeImage;
        if (!imageUrl || typeof imageUrl !== "string") {
          setImgUrl(fallbackImg);
        } else {
          if (!imageUrl.startsWith("/")) {
            imageUrl = "/" + imageUrl.replace(/^(\.\/|\.{2}\/)+/, "");
          }
          setImgUrl(imageUrl);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleImageError = () => {
    setImgUrl(fallbackImg);
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log("Adding to cart:", {
      product: product._id,
      size: selectedSize,
      quantity: quantity,
      price: product.prices[selectedSize]?.price || 0,
    });
    // You can implement actual cart functionality here
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
      /* Header */
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

            {/* Category Badge */}
            <div>
              <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            {/* Size Selection */}
            {product.prices && product.prices.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose Size & Price
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.prices.map((priceOption, index) => (
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
                        <div className="mt-2 text-sm text-pink-600">
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
            {product.prices && product.prices[selectedSize] && (
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Price:
                  </span>
                  <span className="text-2xl font-bold text-pink-600">
                    Rs.{" "}
                    {(
                      product.prices[selectedSize].price * quantity
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FaShoppingCart />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => navigate("/custom-cake")}
                className="w-full border-2 border-pink-500 text-pink-500 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-pink-50 transition duration-300"
              >
                Customize This Cake
              </button>
            </div>

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
