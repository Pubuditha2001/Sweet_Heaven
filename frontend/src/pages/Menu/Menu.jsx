// Menu.jsx - Product listing page
import React, { useState, useEffect } from "react";
import Cake from "../../components/Cake";
import { fetchCakes } from "../../api/cake";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // derive unique categories from fetched cakes (same strategy as EditCakePage)
  useEffect(() => {
    if (!Array.isArray(cakes)) {
      setCategories([]);
      return;
    }
    const cats = [...new Set(cakes.map((c) => c.category).filter(Boolean))];
    setCategories(cats);
  }, [cakes]);

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

      {/* Category tabs (dynamically derived from cake data) */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex overflow-x-auto whitespace-nowrap pt-2 pb-2 mb-6 gap-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
            activeCategory === "all"
              ? "bg-pink-500 text-white"
              : "bg-gray-300 text-white"
          }`}
        >
          All Cakes
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-3 text-base rounded-xl transition ${
              activeCategory === cat
                ? "bg-pink-500 text-white"
                : "bg-gray-300 text-white"
            }`}
          >
            {cat}
          </button>
        ))}
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
