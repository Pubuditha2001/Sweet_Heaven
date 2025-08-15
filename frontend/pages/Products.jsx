// Products.jsx - Product listing page
import React, { useState } from "react";
import Cake from "../components/Cake";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("all");

  const cakes = {
    featured: [
      {
        id: 1,
        name: "Vanilla Dream",
        description: "Classic vanilla cake with buttercream",
        img: "cakes/normal-cakes/vanila-cake.jpg",
        category: "featured",
      },
      {
        id: 2,
        name: "Chocolate Decadence",
        description: "Rich chocolate cake with ganache",
        img: "cakes/normal-cakes/chocolate-cake.jpeg",
        category: "featured",
      },
      {
        id: 3,
        name: "Strawberry Bliss",
        description: "Strawberry cake with cream cheese frosting",
        img: "cakes/normal-cakes/strawberry-cake.jpg",
        category: "featured",
      },
      {
        id: 4,
        name: "Lemon Zest",
        description: "Tangy lemon cake with glaze",
        img: "cakes/normal-cakes/coffee-cake.jpeg", // Using coffee cake as a substitute
        category: "featured",
      },
    ],
    birthday: [
      {
        id: 5,
        name: "Birthday Special",
        description: "Festive cake perfect for celebrations",
        img: "cakes/birthday-cakes/Birthday-Cake-1.webp",
        category: "birthday",
      },
      {
        id: 6,
        name: "Celebration Cake",
        description: "Colorful and fun birthday design",
        img: "cakes/birthday-cakes/Birthday-Cake-2.webp",
        category: "birthday",
      },
      {
        id: 7,
        name: "Party Perfect",
        description: "The ultimate birthday treat",
        img: "cakes/birthday-cakes/Birthday-Cake-3.webp",
        category: "birthday",
      },
    ],
    cupcakes: [
      {
        id: 8,
        name: "Mini Delight",
        description: "Perfect bite-sized treats",
        img: "cakes/cup-cakes/cup-cake-1.jpeg",
        category: "cupcakes",
      },
      {
        id: 9,
        name: "Frosting Heaven",
        description: "Cupcakes with premium frosting",
        img: "cakes/cup-cakes/cup-cake-2.jpeg",
        category: "cupcakes",
      },
      {
        id: 10,
        name: "Assorted Cupcakes",
        description: "Variety of flavors in one pack",
        img: "cakes/cup-cakes/cup-cake-3.jpeg",
        category: "cupcakes",
      },
    ],
    specialty: [
      {
        id: 11,
        name: "Chocolate Mousse",
        description: "Light and fluffy chocolate perfection",
        img: "cakes/normal-cakes/chocolate-mousse-cake.jpeg",
        category: "specialty",
      },
      {
        id: 12,
        name: "Strawberry Cream",
        description: "Fresh strawberries and whipped cream",
        img: "cakes/normal-cakes/strawberry-whipped-cream-mousse-cake.jpg",
        category: "specialty",
      },
    ],
  };

  // Filter cakes based on the active category
  const getCakesToDisplay = () => {
    if (activeCategory === "all") {
      return Object.values(cakes).flat();
    }
    return cakes[activeCategory] || [];
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-2xl mx-auto">
      <h2 className="p-2 text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6">
        Our Cakes
      </h2>

      {/* Category tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap pb-2 mb-6 gap-2 no-scrollbar">
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
      </div>

      {/* Cake grid */}
      <div className="grid grid-cols-2 gap-6">
        {getCakesToDisplay().map((cake) => (
          <Cake key={cake.id} cake={cake} />
        ))}
      </div>
    </div>
  );
}
