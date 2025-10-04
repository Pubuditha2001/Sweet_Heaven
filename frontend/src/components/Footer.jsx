// Footer.jsx - Sweet Heaven Footer component
import React from "react";
import { Link } from "react-router-dom";
import headerLogo from "../assets/header_logo.png";

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner pt-10 pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Brand section */}
          <div className="flex flex-col">
            <img
              src={headerLogo}
              alt="Sweet Heaven"
              className="h-12 w-auto object-contain mb-4 self-start"
            />
            <p className="text-gray-600 ">Heavenly cakes for every occasion.</p>
            <p className="text-gray-600">
              Handcrafted with love and premium ingredients.
            </p>
          </div>
          {/* Quick Links
          <div>
            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/custom-cake"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Custom Cake Creator
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div> */}

          <div className="mt-5 lg:text-right">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Connect With Us
            </h3>
            <p className="text-gray-600 mb-4">
              57/29, Sapumal Mavatha, Wilgoda Road, Kurunegala
              <br />
              Phone:{" "}
              <a
                href="tel:+94725600586"
                className="text-gray-600 hover:text-pink-700 transition-colors"
              >
                +94 72 560 0586
              </a>
              <br />
              Email:{" "}
              <a
                href="mailto:sweetheaven.lk.contact"
                className="text-gray-600 hover:text-pink-700 transition-colors"
              >
                sweetheaven.lk.contact
              </a>
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-2 lg:justify-end">
              {/* TikTok */}
              <a
                href="http://tiktok.com/@_.sweet_heaven_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.5 2h2.25c.138 2.03 1.68 3.57 3.71 3.71v2.27c-.82-.09-1.61-.32-2.33-.68v7.8c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5c.17 0 .34.01.5.03v2.06c-.16-.02-.33-.03-.5-.03-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3V2z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="http://facebook.com/share/1AKRX551GQ/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/_.sweet_heaven_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="http://wa.me/94725600586"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.028-.967-.271-.099-.469-.148-.668.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.668-1.611-.915-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.356.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.271-.198-.571-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.957.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.437-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.991c-.002 5.455-4.437 9.89-9.893 9.89zm8.413-18.282A11.815 11.815 0 0012.048 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.149 1.588 5.967L0 24l6.305-1.682a11.89 11.89 0 005.719 1.463h.005c6.552 0 11.887-5.335 11.89-11.893a11.82 11.82 0 00-3.489-8.463z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section with additional links */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-2 md:mb-0 flex items-center">
            Made with ❤️ by{" "}
            <img
              src={headerLogo}
              alt="Sweet Heaven"
              className="h-6 w-auto object-contain mx-1"
            />
            Team
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-pink-500">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-pink-500">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-500 hover:text-pink-500">
              FAQ
            </Link>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-4 md:mb-0 text-center">
          © {new Date().getFullYear()} Sweet Heaven. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
