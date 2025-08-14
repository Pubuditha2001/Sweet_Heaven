// Navbar.jsx - Main navigation bar
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow flex justify-between items-center px-8 py-4">
      <Link to="/" className="text-pink-600 font-bold text-2xl">
        Sweet Heaven
      </Link>
      <div className="space-x-6">
        <Link to="/products" className="hover:text-pink-500">
          Products
        </Link>
        <Link to="/custom-cake" className="hover:text-pink-500">
          Custom Cake
        </Link>
        <Link to="/cart" className="hover:text-pink-500">
          Cart
        </Link>
        <Link to="/admin" className="hover:text-pink-500">
          Admin
        </Link>
      </div>
    </nav>
  );
}
