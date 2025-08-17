// CustomCake.jsx - 3D custom cake creator page
import React from "react";
import Designer from "../../components/CakeDesigner/Designer";

export default function CustomCake() {
  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4 md:mb-6">
        Create Your Custom Cake
      </h2>
      <Designer />
    </div>
  );
}
