import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
// import "../admin.css";

export default function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    Boolean(localStorage.getItem("adminToken"))
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "adminToken") {
        setIsAdminLoggedIn(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // When the route changes (e.g. after login navigates), re-check localStorage
  useEffect(() => {
    setIsAdminLoggedIn(Boolean(localStorage.getItem("adminToken")));
  }, [location]);

  const handleLogout = (e) => {
    e && e.preventDefault();
    logout(navigate, true); // Use shared logout function for admin
    setIsAdminLoggedIn(false);
    // close mobile menu if open
    setMenuOpen(false);
  };
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex items-center">
          <span className="text-pink-600 font-bold text-2xl logo-text">
            Admin Panel
          </span>
        </div>
        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 items-center">
          <li>
            <Link
              to="/"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
              title="Go to customer-facing landing page"
            >
              Customer Site
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/cakes"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Cakes
            </Link>
          </li>
          <li>
            <Link
              to="/admin/accessories"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Accessories
            </Link>
          </li>
          <li>
            <Link
              to="/admin/toppings"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Toppings
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Users
            </Link>
          </li>
          <li>
            {isAdminLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="px-3 py-2 rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden flex items-center px-3 py-2 border rounded text-pink-600 border-pink-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 shadow-lg">
          <ul className="flex flex-col gap-2 py-2 px-4">
            <li>
              <Link
                to="/"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
                title="Go to customer-facing landing page"
              >
                Customer Site
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cakes"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Cakes
              </Link>
            </li>
            <li>
              <Link
                to="/admin/accessories"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Accessories
              </Link>
            </li>
            <li>
              <Link
                to="/admin/toppings"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Toppings
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Users
              </Link>
            </li>
            <li>
              {isAdminLoggedIn ? (
                <button
                  className="block px-3 py-2 rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors text-left w-full"
                  onClick={(e) => handleLogout(e)}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  className="block px-3 py-2 rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
