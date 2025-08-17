// Contact.jsx - Sweet Heaven Contact page
import React, { useState } from "react";

const StarRating = ({ rating, setRating, hoveredRating, setHoveredRating }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-5 mb-7 col-span-1">
      {/* <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        Rate your experience
      </h2> */}
      <div className="flex space-x-1 justify-center">
        {[1, 2, 3, 4, 5].map((heart) => {
          const isActive = heart <= (hoveredRating || rating);

          return (
            <button
              key={heart}
              type="button"
              onClick={() => setRating(heart)}
              onMouseEnter={() => setHoveredRating(heart)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 bg-transparent hover:bg-transparent focus:bg-transparent transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-0 focus:ring-pink-300 focus:ring-opacity-50 rounded"
            >
              <svg
                className={`w-9 h-9 ${
                  isActive ? "text-pink-500" : "text-gray-300"
                } transition-all duration-200`}
                fill={isActive ? "currentColor" : "white"}
                stroke={isActive ? "white" : "currentColor"}
                strokeWidth={isActive ? 0 : 1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function Contact() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Contact <span className="text-pink-600">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have a question about our
            cakes, custom orders, or anything else, our team is ready to help.
          </p>
        </div>

        {/* Quick Response Section */}
        <div className="rounded-2xl p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need a Quick Response?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Chat with us directly on WhatsApp for immediate assistance with your
            orders or questions.
          </p>
          <a
            href="http://wa.me/94725600586?text=Hello%20Sweet%20Heaven,%20I%20have%20a%20question%20about%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center py-4 px-8 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg
              className="h-6 w-6 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.028-.967-.271-.099-.469-.148-.668.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.668-1.611-.915-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.356.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.271-.198-.571-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.957.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.437-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.991c-.002 5.455-4.437 9.89-9.893 9.89zm8.413-18.282A11.815 11.815 0 0012.048 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.149 1.588 5.967L0 24l6.305-1.682a11.89 11.89 0 005.719 1.463h.005c6.552 0 11.887-5.335 11.89-11.893a11.82 11.82 0 00-3.489-8.463z" />
            </svg>
            Chat on WhatsApp
          </a>
          <p className="text-sm text-gray-500 mt-6">
            We're typically available from 9:00 AM to 8:00 PM
          </p>
        </div>

        {/* Contact Details & Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-gray-900">Visit Us</p>
                  <p className="mt-1 text-gray-600">
                    57/29, Sapumal Mavatha, Wilgoda Road, Kurunegala
                  </p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-gray-900">Call Us</p>
                  <p className="mt-1">
                    <a
                      href="tel:+94725600586"
                      className="text-pink-600 hover:text-pink-800 transition-colors font-medium"
                    >
                      +94 72 560 0586
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-gray-900">Email Us</p>
                  <p className="mt-1">
                    <a
                      href="mailto:sweetheaven.lk.contact"
                      className="text-pink-600 hover:text-pink-800 transition-colors font-medium"
                    >
                      sweetheaven.lk.contact
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-gray-900">Business Hours</p>
                  <p className="mt-1 text-gray-600">
                    Monday - Saturday: 9:00 AM - 8:00 PM
                  </p>
                  <p className="text-gray-600">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                {/* TikTok */}
                <a
                  href="http://tiktok.com/@_.sweet_heaven_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-5 w-5"
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
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-5 w-5"
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
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-5 w-5"
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
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.028-.967-.271-.099-.469-.148-.668.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.668-1.611-.915-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.356.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.271-.198-.571-.347z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Leave Your Feedback
            </h2>
            <p className="text-gray-600 mb-6">
              We value your opinions! Share your experience with our products
              and services.
            </p>
            <form className="space-y-6">
              <div>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  hoveredRating={hoveredRating}
                  setHoveredRating={setHoveredRating}
                />
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    You rated us {rating} out of 5 heart
                    {rating !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tell us more about your experience
                </h3>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows="5"
                  className="w-full border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors p-4 resize-none"
                  placeholder="Tell us about your experience with Sweet Heaven..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
