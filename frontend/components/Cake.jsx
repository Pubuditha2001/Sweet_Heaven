import React, { useState, useEffect } from "react";

const fallbackImg = "/fallback.jpg"; // Place a fallback.jpg in public folder

const Cake = ({ cake }) => {
  const [imgUrl, setImgUrl] = useState(null); // Initialize with null instead of empty string
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Images are in public folder, so use direct path
    let imageUrl = cake.cakeImage;
    if (!imageUrl || typeof imageUrl !== "string") {
      setImgUrl(fallbackImg);
      return;
    }
    // Ensure path starts with "/"
    if (!imageUrl.startsWith("/")) {
      imageUrl = "/" + imageUrl.replace(/^(\.\/|\.{2}\/)+/, "");
    }
    setImgUrl(imageUrl);
  }, [cake.cakeImage]);

  const handleImageError = () => {
    setImgUrl(fallbackImg);
  };

  return (
    <div className="flex flex-col h-90">
      <div className="rounded-2xl overflow-hidden shadow bg-white flex flex-col h-full">
        <div className="flex justify-center items-center p-2">
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
          {Array.isArray(cake.prices) && cake.prices.length > 0 && (
            <div className="mt-auto text-left">
              <p className="text-pink-600 font-bold">
                From Rs. {Math.min(...cake.prices.map((p) => p.price))}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cake;
