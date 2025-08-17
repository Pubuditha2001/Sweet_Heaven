// Navbar.jsx - Main navigation bar
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ homeRef }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const location = useLocation();
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowNavbar(true);
        lastScrollY = window.scrollY;
        return;
      }
      if (window.scrollY < lastScrollY) {
        setShowNavbar(true);
      } else if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to scroll to contact section on home page
  const scrollToContact = (e) => {
    e.preventDefault();

    if (location.pathname === "/" && homeRef?.current) {
      // Use ref method for direct scrolling
      homeRef.current.scrollToContact();

      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    } else {
      // Navigate to home page with hash
      window.location.href = "/#contact-section";
    }
  };

  // Function to scroll to FAQ section on home page
  const scrollToFAQ = (e) => {
    e.preventDefault();

    if (location.pathname === "/" && homeRef?.current) {
      // Use ref method for direct scrolling
      homeRef.current.scrollToFAQ();

      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    } else {
      // Navigate to home page with hash
      window.location.href = "/#faq-section";
    }
  };

  // Scroll to top when Home is clicked and already on Home page
  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (isMenuOpen) setIsMenuOpen(false);
    }
  };

  // Helper to check if hash is empty or just "#"
  const isContactActive =
    location.pathname === "/" && location.hash === "#contact-section";
  const isFAQActive =
    location.pathname === "/" && location.hash === "#faq-section";
  const isHomeActive =
    location.pathname === "/" &&
    !isContactActive &&
    !isFAQActive &&
    (!location.hash || location.hash === "#");

  return (
    <nav
      className={`bg-white shadow-md sticky top-0 z-50 transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo section */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center"
              onClick={handleHomeClick}
            >
              {/* You can replace this with an actual logo image */}
              <span
                className="text-pink-600 font-bold text-2xl logo-text"
                data-content="Sweet Heaven"
              >
                S<span className="lowercase">w</span>
                <span className="lowercase">e</span>
                <span className="lowercase">e</span>T H
                <span className="lowercase">e</span>A
                <span className="lowercase">v</span>
                <span className="lowercase">e</span>
                <span className="lowercase">n</span>
              </span>
            </Link>
          </div>
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                isHomeActive
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
              onClick={handleHomeClick}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                location.pathname === "/menu"
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Menu
            </Link>
            <Link
              to="/custom-cake"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                location.pathname === "/custom-cake"
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Custom Cake Creator
            </Link>
            {/* Changed to use onClick instead of Link */}
            <a
              href="#contact-section"
              onClick={scrollToContact}
              className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-200 ${
                isContactActive
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Contact Us
            </a>
            {/* Added FAQ link */}
            <a
              href="#faq-section"
              onClick={scrollToFAQ}
              className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-200 ${
                isFAQActive
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              FAQ
            </a>
            <Link
              to="/cart"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                location.pathname === "/cart"
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Cart
            </Link>
            <Link
              to="/login"
              className="text-white bg-pink-600 hover:bg-pink-700 focus:bg-pink-700 focus:outline-none active:bg-pink-800 px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
              style={{ color: "white !important" }}
            >
              <span className="text-white">Login / Register</span>
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:text-pink-500 focus:bg-pink-50 active:text-pink-600 active:bg-pink-100 transition-all duration-200"
              aria-expanded="false"
              style={{ backgroundColor: "transparent" }}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${
                  isMenuOpen ? "hidden" : "block"
                } h-6 w-6 transition-colors duration-200`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                style={{ color: "inherit" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* X icon for closing */}
              <svg
                className={`${
                  isMenuOpen ? "block" : "hidden"
                } h-6 w-6 transition-colors duration-200`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                style={{ color: "inherit" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMenuOpen ? "block mobile-menu-animate" : "hidden"
        } md:hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              isHomeActive
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={(e) => {
              handleHomeClick(e);
              toggleMenu();
            }}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/menu"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Menu
          </Link>
          <Link
            to="/custom-cake"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/custom-cake"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Custom Cake Creator
          </Link>
          {/* Changed to use onClick instead of Link */}
          <a
            href="#contact-section"
            onClick={scrollToContact}
            className={`block px-3 py-2 rounded-md font-medium text-center cursor-pointer transition-colors duration-200 ${
              isContactActive
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
          >
            Contact Us
          </a>
          {/* Added FAQ link */}
          <a
            href="#faq-section"
            onClick={scrollToFAQ}
            className={`block px-3 py-2 rounded-md font-medium text-center cursor-pointer transition-colors duration-200 ${
              isFAQActive
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
          >
            FAQ
          </a>
          <Link
            to="/cart"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/cart"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Cart
          </Link>

          <Link
            to="/login"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/login"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Login / Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
