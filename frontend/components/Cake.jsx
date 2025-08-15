import React, { useState, useEffect } from "react";

const Cake = ({ cake }) => {
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    // Import image from assets dynamically
    const loadImage = async () => {
      try {
        // Assuming cake.img contains the relative path or name of the image in assets folder
        const imageModule = await import(`../src/assets/${cake.img}`);
        setImgUrl(imageModule.default);
      } catch (error) {
        console.error("Failed to load image:", error);
        // Set a fallback image or handle the error as needed
      }
    };

    loadImage();
  }, [cake.img]);

  return (
    <div className="flex flex-col h-90">
      {/* Set constant height */}
      <div className="rounded-2xl overflow-hidden shadow bg-white flex flex-col h-full">
        <div className="flex justify-center items-center">
          <div
            className="w-40 h-40 rounded-xl bg-center bg-cover"
            style={{ backgroundImage: `url(${imgUrl})` }}
          ></div>
        </div>
        <div className="p-4 flex flex-col flex-1 justify-center h-24">
          {/* Fixed height for title and description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {cake.name}
          </h3>
          <p className="text-gray-500 text-base">{cake.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Cake;
