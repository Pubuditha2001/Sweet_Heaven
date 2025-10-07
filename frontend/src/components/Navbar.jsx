// Navbar.jsx - Main navigation bar
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdminLoggedIn, isUserLoggedIn, logout } from "../utils/auth";
import headerLogo from "../assets/header_logo.png";

export default function Navbar({ homeRef }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn() || isAdminLoggedIn());
  }, [location]); // Re-check when location changes
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
      // Navigate to home page with hash - use current origin + base path
      const basePath = import.meta.env.PROD ? "/Sweet_Heaven/" : "/";
      window.location.href = `${window.location.origin}${basePath}#contact-section`;
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
      // Navigate to home page with hash - use current origin + base path
      const basePath = import.meta.env.PROD ? "/Sweet_Heaven/" : "/";
      window.location.href = `${window.location.origin}${basePath}#faq-section`;
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
    location.pathname === "/" && activeSection === "contact";
  const isFAQActive = location.pathname === "/" && activeSection === "faq";
  const isHomeActive = location.pathname === "/" && activeSection === "home";

  // Observe scroll position to highlight correct tab
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }
    const contactEl = document.querySelector("[data-section='contact']");
    const faqEl = document.querySelector("[data-section='faq']");
    const homeEl = document.querySelector("[data-section='home']");
    const options = {
      root: null,
      rootMargin: "-50px 0px 0px 0px", // account for navbar height
      threshold: 0.3,
    };
    const callback = (entries) => {
      let found = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === contactEl) {
            setActiveSection("contact");
            found = true;
          } else if (entry.target === faqEl) {
            setActiveSection("faq");
            found = true;
          } else if (entry.target === homeEl) {
            setActiveSection("home");
            found = true;
          }
        }
      });
      if (!found) setActiveSection("home");
    };
    const observer = new window.IntersectionObserver(callback, options);
    if (contactEl) observer.observe(contactEl);
    if (faqEl) observer.observe(faqEl);
    if (homeEl) observer.observe(homeEl);
    return () => observer.disconnect();
  }, [location.pathname]);

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
              <img
                src={headerLogo}
                alt="Sweet Heaven"
                className="h-12 w-auto"
              />
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
              to="/accessories"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                location.pathname === "/accessories"
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Accessories
            </Link>
            {/* <Link
              to="/custom-cake"
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                location.pathname === "/custom-cake"
                  ? "text-pink-600 bg-pink-50 border-b-2 border-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              Custom Cake Creator
            </Link> */}
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
            {/* Admin Dashboard Link - only show if user is admin */}
            {isAdminLoggedIn() && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-md font-medium transition-colors duration-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                Admin Dashboard
              </Link>
            )}
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
            {/* Login/Logout buttons temporarily commented out
            {isLoggedIn ? (
              <button
                onClick={() => logout(navigate, isAdminLoggedIn())}
                className="text-white bg-red-600 hover:bg-red-700 focus:bg-red-700 focus:outline-none active:bg-red-800 px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
              >
                <span className="text-white">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white bg-pink-600 hover:bg-pink-700 focus:bg-pink-700 focus:outline-none active:bg-pink-800 px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
                style={{ color: "white !important" }}
              >
                <span className="text-white">Login / Register</span>
              </Link>
            )}
            */}
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
            to="/accessories"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/accessories"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Accessories
          </Link>
          {/* <Link
            to="/custom-cake"
            className={`block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 ${
              location.pathname === "/custom-cake"
                ? "text-pink-600 bg-pink-50 border-l-4 border-pink-600"
                : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            }`}
            onClick={toggleMenu}
          >
            Custom Cake Creator
          </Link> */}
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
          {/* Admin Dashboard Link - Mobile - only show if user is admin */}
          {isAdminLoggedIn() && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              onClick={toggleMenu}
            >
              Admin Dashboard
            </Link>
          )}
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

          {/* Mobile Login/Logout buttons temporarily commented out
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout(navigate, isAdminLoggedIn());
                toggleMenu();
              }}
              className="block w-full px-3 py-2 rounded-md font-medium text-center transition-colors duration-200 text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
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
          )}
          */}
        </div>
      </div>
    </nav>
  );
}
