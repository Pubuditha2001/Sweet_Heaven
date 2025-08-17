import { useState } from "react";

const StarRating = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Rate your experience
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((heart) => {
            const isActive = heart <= (hoveredRating || rating);

            return (
              <button
                key={heart}
                type="button"
                onClick={() => setRating(heart)}
                onMouseEnter={() => setHoveredRating(heart)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50 rounded"
              >
                <svg
                  className={`w-6 h-6 ${
                    isActive ? "text-pink-500" : "text-gray-300"
                  } transition-all duration-200`}
                  fill={isActive ? "currentColor" : "none"}
                  stroke={isActive ? "none" : "currentColor"}
                  strokeWidth={isActive ? 0 : 1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600">
          {rating > 0
            ? `You rated: ${rating} heart${rating !== 1 ? "s" : ""}`
            : "Hover over hearts to preview"}
        </p>
      </div>
    </div>
  );
};

export default StarRating;
