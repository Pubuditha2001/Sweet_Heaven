import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeImageUrl, getToppingFallback } from "../utils/imageUtils";

const Cake = ({ cake }) => {
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState(null); // Initialize with null instead of empty string
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Use the utility function to normalize the image URL
    const imageUrl = normalizeImageUrl(cake.cakeImage);
    setImgUrl(imageUrl || getToppingFallback());
  }, [cake.cakeImage]);

  const handleImageError = () => {
    setImgUrl(getToppingFallback());
  };

  const handleCakeClick = () => {
    if (cake._id || cake.id) {
      navigate(`/product/${cake._id || cake.id}`);
    }
  };

  return (
    <div
      className="flex flex-col h-90 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
      onClick={handleCakeClick}
    >
      <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col h-full hover:shadow-2xl transition-all duration-300 relative group">
        <div className="flex justify-center items-center p-2 relative">
          {/* Overlay with "View Details" text that appears on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl m-2 flex items-center justify-center">
            <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-pink-500 px-3 py-1 rounded-full text-sm">
              View Details
            </span>
          </div>
          <div className="w-40 h-40 rounded-xl object-cover bg-center block md:hidden">
            {/* Mobile: Only render image when imgUrl is not null */}
            {imgUrl && (
              <img
                src={imgUrl}
                alt={cake.cakeName}
                className="w-full h-full rounded-xl object-cover bg-center"
                onError={handleImageError}
              />
            )}
          </div>
          <div
            className="hidden md:block w-full"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Desktop: Only render image when imgUrl is not null */}
            {imgUrl && (
              <img
                src={imgUrl}
                alt={cake.cakeName}
                className="w-full h-full rounded-xl object-cover bg-center"
                style={{ aspectRatio: "1 / 1" }}
                onError={handleImageError}
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
              fontFamily: '"Handlee", "Edu NSW ACT Cursive", cursive',
            }}
          >
            {cake.cakeName}
          </h2>
          <p
            className="text-sm text-gray-500 mb-2 text-left"
            style={{
              minHeight: "40px",
              maxHeight: "40px",
              overflow: "hidden",
              fontFamily: '"Handlee", "Edu NSW ACT Cursive", cursive',
            }}
          >
            {cake.cakeDescription}
          </p>
          {(cake.priceBasedPricing === false
            ? cake.price
            : Array.isArray(cake.prices) && cake.prices.length > 0
            ? Math.min(...cake.prices.map((p) => p.price))
            : null) && (
            <div className="mt-auto text-left">
              <p className="text-pink-600 font-bold">
                {cake.priceBasedPricing === false
                  ? `Rs. ${cake.price}`
                  : `From Rs. ${Math.min(...cake.prices.map((p) => p.price))}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cake;
