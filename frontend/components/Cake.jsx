import React, { useState, useEffect } from "react";

const fallbackImg = "/fallback.jpg"; // Place a fallback.jpg in public folder

const Cake = ({ cake }) => {
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    // Import images using import.meta.glob (recursive)
    const images = import.meta.glob("../src/assets/**", { eager: true });
    const imageKey = `../src/assets/${cake.img}`;
    // Debug: log all available keys
    console.log("Available image keys:", Object.keys(images));
    const imageUrl = images[imageKey]?.default;

    if (imageUrl) {
      setImgUrl(imageUrl);
    } else {
      console.error(`Image not found: ${imageKey}`);
      setImgUrl(fallbackImg); // fallback image
    }
  }, [cake.img]);

  return (
    <div className="flex flex-col h-90">
      <div className="rounded-2xl overflow-hidden shadow bg-white flex flex-col h-full">
        <div className="flex justify-center items-center p-2">
          <div className="w-40 h-40 rounded-xl object-cover bg-center block md:hidden">
            {/* Mobile: keep current size */}
            <img
              src={imgUrl}
              alt={cake.name}
              className="w-full h-full rounded-xl object-cover bg-center"
            />
          </div>
          <div
            className="hidden md:block w-full"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Desktop: image fills card width and keeps 1:1 ratio */}
            <img
              src={imgUrl}
              alt={cake.name}
              className="w-full h-full rounded-xl object-cover bg-center"
              style={{ aspectRatio: "1 / 1" }}
            />
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
            {cake.name}
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
            {cake.description}
          </p>
          {cake.price && (
            <p className="text-pink-600 font-bold mt-auto text-left">{`Rs. ${cake.price}`}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cake;
