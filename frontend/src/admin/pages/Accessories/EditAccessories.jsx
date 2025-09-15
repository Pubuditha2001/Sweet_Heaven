import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAccessoryById, updateAccessory } from "../../../api/accessory.js";
import ImageUploader from "../../../components/ImageUploader.jsx";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../../../utils/imageUtils.js";

export default function EditAccessories() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [initialAccessory, setInitialAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!initialAccessory || !accessory) return false;
    return (
      initialAccessory.name !== accessory.name ||
      initialAccessory.description !== accessory.description ||
      initialAccessory.price !== accessory.price ||
      initialAccessory.image !== accessory.image
    );
  }, [initialAccessory, accessory]);

  useEffect(() => {
    async function loadAccessory() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAccessoryById(id);
        if (!data) {
          setError("Accessory not found");
          return;
        }
        setAccessory(data);
        setInitialAccessory(data);
      } catch (err) {
        setError("Failed to load accessory: " + (err.message || err));
      }
      setLoading(false);
    }
    loadAccessory();
  }, [id]);

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

    setSaving(true);
    setError("");

    try {
      const accessoryData = {
        name: accessory.name.trim(),
        description: accessory.description.trim(),
        price: Number(accessory.price),
        image: accessory.image,
      };

      await updateAccessory(id, accessoryData);
      navigate("/admin/accessories");
    } catch (err) {
      setError("Failed to update accessory: " + (err.message || err));
    }
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setAccessory((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate("/admin/accessories");
    }
  };

  const confirmLeave = () => {
    navigate("/admin/accessories");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-gray-500">Loading accessory...</div>
      </div>
    );
  }

  if (error && !accessory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => navigate("/admin/accessories")}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          Back to Accessories
        </button>
      </div>
    );
  }

  if (!accessory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-gray-500">Accessory not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleCancel}
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
          Edit Accessory
        </h2>
        {hasChanges && (
          <span className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            Unsaved changes
          </span>
        )}
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
                  value={accessory.description || ""}
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
                  onChange={(img) => handleChange("image", img)}
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
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowUnsavedModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
              <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
                <img src="/idea.png" alt="Warning" className="w-16 h-16" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
              Unsaved Changes
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You have unsaved changes. Are you sure you want to leave without
              saving?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="bg-red-400 text-white px-4 py-2 rounded-md font-medium"
                onClick={confirmLeave}
              >
                Yes, leave
              </button>
              <button
                type="button"
                className="bg-green-400 text-white px-4 py-2 rounded-md"
                onClick={() => setShowUnsavedModal(false)}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
