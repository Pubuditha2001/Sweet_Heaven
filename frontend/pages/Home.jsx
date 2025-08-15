import React from "react";
import Cake from "../components/Cake";

const cakes = [
  {
    name: "Vanilla Dream",
    description: "Classic vanilla cake with buttercream",
    img: "cakes/normal-cakes/vanila-cake.jpg",
  },
  {
    name: "Chocolate Decadence",
    description: "Rich chocolate cake with ganache",
    img: "cakes/normal-cakes/chocolate-cake.jpeg",
  },
  {
    name: "Strawberry Bliss",
    description: "Strawberry cake with cream cheese frosting",
    img: "cakes/normal-cakes/strawberry-cake.jpg",
  },
  {
    name: "Lemon Zest",
    description: "Tangy lemon cake with glaze",
    img: "cakes/normal-cakes/coffee-cake.jpeg",
  },
];

const Home = () => {
  return (
    <div
      className="flex flex-col min-h-screen bg-white justify-between overflow-x-hidden pt-8 pb-8"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      {/* Business Description */}
      <div className="px-4 text-center mb-2">
        <p className="text-gray-700 text-base sm:text-lg">
          Welcome to Sweet Heaven! We craft delicious cakes and cupcakes for
          every occasion, using only the finest ingredients. Whether you want a
          classic treat or a custom creation, our bakery brings joy and
          sweetness to your celebrations.
        </p>
      </div>

      {/* Call to Action */}
      <div className="flex px-4 py-3 justify-center mt-8 gap-3">
        <button className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-pink-600 text-white text-base font-bold">
          Custom Cakes
        </button>
        <button className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-pink-600 text-white text-base font-bold border border-[#eb477e]">
          Menu
        </button>
      </div>

      {/* Featured Cakes - updated to be responsive */}
      <div className="p-2 sm:p-4 md:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-t-xl pt-4 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6 text-center">
            Featured Cakes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cakes.map((cake, index) => (
              <Cake key={index} cake={cake} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
