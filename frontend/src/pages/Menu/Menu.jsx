// Menu.jsx - Product listing page
import React, { useState, useEffect } from "react";
import Cake from "../../components/Cake";
import { fetchCakes } from "../../api/cake";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCakes() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakes();
        setCakes(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakes();
  }, []);

  // Group cakes by category
  const cakesByCategory = {
    featured: cakes.filter((c) => c.isFeatured),
    birthday: cakes.filter((c) => c.category === "birthday"),
    cupcakes: cakes.filter((c) => c.category === "cupcakes"),
    specialty: cakes.filter((c) => c.category === "specialty"),
    normal: cakes.filter((c) => c.category === "normal"),
  };

  const getCakesToDisplay = () => {
    if (activeCategory === "all") {
      return cakes;
    }
    return cakesByCategory[activeCategory] || [];
  };

  return (
    <div className="px-4 py-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6">
        Our Cakes
      </h2>

      {/* Category tabs */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex overflow-x-auto whitespace-nowrap pb-2 mb-6 gap-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "all" ? "bg-pink-500 text-white" : "bg-pink-400"
          }`}
        >
          All Cakes
        </button>
        <button
          onClick={() => setActiveCategory("featured")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "featured"
              ? "bg-pink-500 text-white"
              : "bg-pink-400"
          }`}
        >
          Featured
        </button>
        <button
          onClick={() => setActiveCategory("birthday")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "birthday"
              ? "bg-pink-500 text-white"
              : "bg-pink-400"
          }`}
        >
          Birthday
        </button>
        <button
          onClick={() => setActiveCategory("cupcakes")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "cupcakes"
              ? "bg-pink-500 text-white"
              : "bg-pink-400"
          }`}
        >
          Cupcakes
        </button>
        <button
          onClick={() => setActiveCategory("specialty")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "specialty"
              ? "bg-pink-500 text-white"
              : "bg-pink-400"
          }`}
        >
          Specialty
        </button>
        <button
          onClick={() => setActiveCategory("normal")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "normal"
              ? "bg-pink-500 text-white"
              : "bg-pink-400"
          }`}
        >
          Normal
        </button>
      </div>

      {/* Loading/Error */}
      {loading && <div>Loading cakes...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Cake grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {getCakesToDisplay().map((cake, index) => (
          <div
            key={cake._id || cake.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Cake cake={cake} />
          </div>
        ))}
      </div>
    </div>
  );
}
