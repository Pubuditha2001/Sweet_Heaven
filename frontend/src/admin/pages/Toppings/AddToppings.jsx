import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createToppingCollection } from "../../../api/topping.js";
import ImageUploader from "../../../components/ImageUploader.jsx";
import {
  normalizeImageUrl,
  getToppingFallback,
  handleToppingImageError,
} from "../../../utils/imageUtils.js";

export default function AddToppings() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState({
    collectionName: "",
    toppings: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const SIZE_OPTIONS = [
    "500g",
    "1kg",
    "1.5kg",
    "2kg",
    "2.5kg",
    "3kg",
    "3.5kg",
    "4kg",
    "4.5kg",
    "5kg",
  ];

  const validateForm = () => {
    const errors = {};

    if (!collection.collectionName.trim()) {
      errors.collectionName = "Collection name is required";
    }

    if (collection.toppings.length === 0) {
      errors.toppings = "At least one topping is required";
    }

    collection.toppings.forEach((topping, index) => {
      if (!topping.name.trim()) {
        errors[`topping_${index}_name`] = "Topping name is required";
      }
      if (topping.prices.length === 0) {
        errors[`topping_${index}_prices`] = "At least one price is required";
      }
      topping.prices.forEach((price, priceIndex) => {
        if (!price.price || Number(price.price) <= 0) {
          errors[`topping_${index}_price_${priceIndex}`] =
            "Valid price is required";
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const collectionData = {
        collectionName: collection.collectionName.trim(),
        toppings: collection.toppings.map((topping) => ({
          name: topping.name.trim(),
          description: topping.description.trim(),
          image: topping.image,
          prices: topping.prices.filter((p) => p.size && p.price > 0),
        })),
      };

      await createToppingCollection(collectionData);
      navigate("/admin/toppings");
    } catch (err) {
      setError("Failed to create topping collection: " + (err.message || err));
    }
    setLoading(false);
  };

  const addTopping = () => {
    setCollection((prev) => ({
      ...prev,
      toppings: [
        ...prev.toppings,
        {
          name: "",
          description: "",
          image: "",
          prices: [{ size: "1kg", price: "" }],
        },
      ],
    }));
  };

  const removeTopping = (index) => {
    setCollection((prev) => ({
      ...prev,
      toppings: prev.toppings.filter((_, i) => i !== index),
    }));
  };

  const updateTopping = (index, field, value) => {
    setCollection((prev) => ({
      ...prev,
      toppings: prev.toppings.map((topping, i) =>
        i === index ? { ...topping, [field]: value } : topping
      ),
    }));
  };

  const addPriceToTopping = (toppingIndex) => {
    setCollection((prev) => ({
      ...prev,
      toppings: prev.toppings.map((topping, i) =>
        i === toppingIndex
          ? {
              ...topping,
              prices: [...topping.prices, { size: "1kg", price: "" }],
            }
          : topping
      ),
    }));
  };

  const removePriceFromTopping = (toppingIndex, priceIndex) => {
    setCollection((prev) => ({
      ...prev,
      toppings: prev.toppings.map((topping, i) =>
        i === toppingIndex
          ? {
              ...topping,
              prices: topping.prices.filter((_, pi) => pi !== priceIndex),
            }
          : topping
      ),
    }));
  };

  const updateToppingPrice = (toppingIndex, priceIndex, field, value) => {
    setCollection((prev) => ({
      ...prev,
      toppings: prev.toppings.map((topping, i) =>
        i === toppingIndex
          ? {
              ...topping,
              prices: topping.prices.map((price, pi) =>
                pi === priceIndex ? { ...price, [field]: value } : price
              ),
            }
          : topping
      ),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin/toppings")}
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
          Add New Topping Collection
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Collection Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={collection.collectionName}
              onChange={(e) =>
                setCollection((prev) => ({
                  ...prev,
                  collectionName: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                formErrors.collectionName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Birthday Cake Toppings, Wedding Cake Toppings"
            />
            {formErrors.collectionName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.collectionName}
              </p>
            )}
          </div>

          {/* Toppings */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Toppings in Collection
              </h3>
              <button
                type="button"
                onClick={addTopping}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Topping
              </button>
            </div>

            {collection.toppings.map((topping, toppingIndex) => (
              <div
                key={toppingIndex}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium text-gray-700">
                    Topping {toppingIndex + 1}
                  </h4>
                  {collection.toppings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopping(toppingIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Topping Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topping Name *
                      </label>
                      <input
                        type="text"
                        value={topping.name}
                        onChange={(e) =>
                          updateTopping(toppingIndex, "name", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white ${
                          formErrors[`topping_${toppingIndex}_name`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter topping name"
                      />
                      {formErrors[`topping_${toppingIndex}_name`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors[`topping_${toppingIndex}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={topping.description}
                        onChange={(e) =>
                          updateTopping(
                            toppingIndex,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        placeholder="Enter topping description"
                      />
                    </div>

                    {/* Prices */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Prices by Size *
                        </label>
                        <button
                          type="button"
                          onClick={() => addPriceToTopping(toppingIndex)}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Add Size
                        </button>
                      </div>
                      {topping.prices.map((price, priceIndex) => (
                        <div key={priceIndex} className="flex gap-2 mb-2">
                          <select
                            value={price.size}
                            onChange={(e) =>
                              updateToppingPrice(
                                toppingIndex,
                                priceIndex,
                                "size",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                          >
                            {SIZE_OPTIONS.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price.price}
                            onChange={(e) =>
                              updateToppingPrice(
                                toppingIndex,
                                priceIndex,
                                "price",
                                e.target.value
                              )
                            }
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white ${
                              formErrors[
                                `topping_${toppingIndex}_price_${priceIndex}`
                              ]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Price"
                          />
                          {topping.prices.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removePriceFromTopping(toppingIndex, priceIndex)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      {formErrors[`topping_${toppingIndex}_prices`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors[`topping_${toppingIndex}_prices`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topping Image
                      </label>
                      <ImageUploader
                        value={topping.image}
                        onChange={(img) =>
                          updateTopping(toppingIndex, "image", img)
                        }
                      />
                    </div>

                    {/* Image Preview */}
                    {topping.image && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Image
                        </label>
                        <img
                          src={normalizeImageUrl(topping.image)}
                          alt="Topping preview"
                          className="w-full max-w-xs h-32 object-cover rounded-md border"
                          onError={handleToppingImageError}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {formErrors.toppings && (
              <p className="text-red-500 text-sm mt-1">{formErrors.toppings}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/toppings")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
