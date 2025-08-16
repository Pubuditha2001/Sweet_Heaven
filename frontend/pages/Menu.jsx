// Menu.jsx - Product listing page
import React, { useState } from "react";
import Cake from "../components/Cake";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");

  const cakes = {
    featured: [
      {
        id: 1,
        name: "Vanilla Dream",
        description: "Classic vanilla cake with buttercream",
        img: "cakes/normal-cakes/vanila-cake.jpg",
        category: "featured",
        price: 350,
      },
      {
        id: 2,
        name: "Chocolate Decadence",
        description: "Rich chocolate cake with ganache",
        img: "cakes/normal-cakes/chocolate-cake.jpeg",
        category: "featured",
        price: 400,
      },
      {
        id: 3,
        name: "Strawberry Bliss",
        description: "Strawberry cake with cream cheese frosting",
        img: "cakes/normal-cakes/strawberry-cake.jpg",
        category: "featured",
        price: 380,
      },
      {
        id: 4,
        name: "Lemon Zest",
        description: "Tangy lemon cake with glaze",
        img: "cakes/normal-cakes/coffee-cake.jpeg", // Using coffee cake as a substitute
        category: "featured",
        price: 360,
      },
    ],
    birthday: [
      {
        id: 5,
        name: "Birthday Special",
        description: "Festive cake perfect for celebrations",
        img: "cakes/birthday-cakes/Birthday-Cake-1.webp",
        category: "birthday",
        price: 420,
      },
      {
        id: 6,
        name: "Celebration Cake",
        description: "Colorful and fun birthday design",
        img: "cakes/birthday-cakes/Birthday-Cake-2.webp",
        category: "birthday",
        price: 450,
      },
      {
        id: 7,
        name: "Party Perfect",
        description: "The ultimate birthday treat",
        img: "cakes/birthday-cakes/Birthday-Cake-3.webp",
        category: "birthday",
        price: 470,
      },
    ],
    cupcakes: [
      {
        id: 8,
        name: "Mini Delight",
        description: "Perfect bite-sized treats",
        img: "cakes/cup-cakes/cup-cake-1.jpeg",
        category: "cupcakes",
        price: 120,
      },
      {
        id: 9,
        name: "Frosting Heaven",
        description: "Cupcakes with premium frosting",
        img: "cakes/cup-cakes/cup-cake-2.jpeg",
        category: "cupcakes",
        price: 140,
      },
      {
        id: 10,
        name: "Assorted Cupcakes",
        description: "Variety of flavors in one pack",
        img: "cakes/cup-cakes/cup-cake-3.jpeg",
        category: "cupcakes",
        price: 160,
      },
    ],
    specialty: [
      {
        id: 11,
        name: "Chocolate Mousse",
        description: "Light and fluffy chocolate perfection",
        img: "cakes/normal-cakes/chocolate-mousse-cake.jpeg",
        category: "specialty",
        price: 500,
      },
      {
        id: 12,
        name: "Strawberry Cream",
        description: "Fresh strawberries and whipped cream",
        img: "cakes/normal-cakes/strawberry-whipped-cream-mousse-cake.jpg",
        category: "specialty",
        price: 520,
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
      </div>

      {/* Cake grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {getCakesToDisplay().map((cake) => (
          <Cake key={cake.id} cake={cake} />
        ))}
      </div>
    </div>
  );
}
