// Home.jsx - Sweet Heaven landing page
import React from "react";

export default function Home() {
  return (
    <div className="bg-pink-50 min-h-screen">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-pink-600">Sweet Heaven</h1>
        <p className="mt-4 text-xl text-gray-700">
          Heavenly cakes for every occasion
        </p>
        <button className="mt-8 px-6 py-3 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition">
          Shop Now
        </button>
      </section>
      {/* Featured Cakes section will go here */}
    </div>
  );
}
