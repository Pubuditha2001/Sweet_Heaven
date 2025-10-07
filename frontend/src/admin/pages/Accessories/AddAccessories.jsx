import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAccessory } from "../../../api/accessory.js";
import ImageUploader from "../../../components/ImageUploader.jsx";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../../../utils/imageUtils.js";

export default function AddAccessories() {
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!accessory.name.trim()) {
      errors.name = "Accessory name is required";
    }

    if (!accessory.price || Number(accessory.price) <= 0) {
      errors.price = "Valid price is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const accessoryData = {
        name: accessory.name.trim(),
        description: accessory.description.trim(),
        price: Number(accessory.price),
        image: accessory.image,
      };

      await createAccessory(accessoryData);
      navigate("/admin/accessories");
    } catch (err) {
      setError("Failed to create accessory: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setAccessory((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (imageUrl) => {
    handleChange("image", imageUrl);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin/accessories")}
          className="mr-4 p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-pink-600">
          Add New Accessory
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Accessory Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessory Name *
                </label>
                <input
                  type="text"
                  value={accessory.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter accessory name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={accessory.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  placeholder="Enter accessory description"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={accessory.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter price"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessory Image
                </label>
                <ImageUploader
                  value={accessory.image}
                  onChange={handleImageChange}
                />
              </div>

              {/* Image Preview */}
              {accessory.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Image
                  </label>
                  <img
                    src={normalizeImageUrl(accessory.image)}
                    alt="Accessory preview"
                    className="w-full max-w-xs h-48 object-cover rounded-md border"
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/accessories")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Accessory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
