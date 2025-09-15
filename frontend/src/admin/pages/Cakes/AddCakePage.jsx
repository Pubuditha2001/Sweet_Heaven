import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createCake, fetchCakes } from "../../../api/cake";
import ImageUploader from "../../../components/ImageUploader";
import { fetchAllToppings } from "../../../api/topping";
import UnsavedChangesModal from "../../components/UnsavedChangesModal";

export default function AddCakePage() {
  const [toppingOptions, setToppingOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const navigate = useNavigate();
  const emptyCake = {
    cakeName: "",
    images: [],
    cakeImage: "",
    isFeatured: false,
    category: "",
    cakeDescription: "",
    detailedDescription: "",
    toppingRef: null,
    toppingCollectionName: "",
    toppingCategory: "",
    prices: [],
    // whether this category uses size based pricing; when false use `price`
    priceBasedPricing: true,
    price: undefined,
  };

  const [cake, setCake] = useState(emptyCake);
  const [initialCake, setInitialCake] = useState(emptyCake);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  // whether the form has unsaved changes compared to the initial loaded cake
  const hasChanges = useMemo(() => {
    if (!initialCake || !cake) return false;
    try {
      return JSON.stringify(initialCake) !== JSON.stringify(cake);
    } catch (e) {
      return true;
    }
  }, [initialCake, cake]);

  // Pricing helpers moved to component scope to avoid declaring statements inside JSX
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
  const getPriceObj = (size) => {
    if (!Array.isArray(cake.prices)) return null;
    return cake.prices.find(
      (p) =>
        (p && String(p.size || "")).toLowerCase() === String(size).toLowerCase()
    );
  };
  const toggleAvailable = (size) => {
    const existing = getPriceObj(size);
    const newPrices = Array.isArray(cake.prices) ? [...cake.prices] : [];
    if (existing) {
      const idx = newPrices.findIndex(
        (p) =>
          (p && String(p.size || "")).toLowerCase() ===
          String(size).toLowerCase()
      );
      if (idx > -1) newPrices.splice(idx, 1);
    } else {
      newPrices.push({ size, sizeId: size, price: "" });
    }
    setCake({ ...cake, prices: newPrices });
  };
  const setPriceForSize = (size, value) => {
    const newPrices = Array.isArray(cake.prices) ? [...cake.prices] : [];
    const idx = newPrices.findIndex(
      (p) =>
        (p && String(p.size || "")).toLowerCase() === String(size).toLowerCase()
    );
    const numericPrice = value === "" ? "" : Number(value);
    if (idx > -1) {
      newPrices[idx] = { ...newPrices[idx], price: numericPrice };
    } else {
      newPrices.push({ size, sizeId: size, price: numericPrice });
    }
    setCake({ ...cake, prices: newPrices });
  };
  const setCupcakePrice = (v) => {
    const newPrices = Array.isArray(cake.prices) ? [...cake.prices] : [];
    const idx = newPrices.findIndex(
      (p) => (p && String(p.size || "")).toLowerCase() === "cupcake"
    );
    const numericPrice = v === "" ? "" : Number(v);
    if (idx > -1) {
      newPrices[idx] = { ...newPrices[idx], price: numericPrice };
    } else {
      newPrices.push({
        size: "cupcake",
        sizeId: "standard",
        price: numericPrice,
      });
    }
    setCake({ ...cake, prices: newPrices });
  };

  useEffect(() => {
    async function loadToppingsAndCategories() {
      setLoading(true);
      setError("");
      try {
        const allToppingsDoc = await fetchAllToppings();
        let allToppings = [];
        if (Array.isArray(allToppingsDoc)) {
          allToppings = allToppingsDoc
            .map((t) => {
              if (!t) return null;
              const id =
                t.id ||
                (t._id
                  ? typeof t._id === "string"
                    ? t._id
                    : t._id.toString()
                  : undefined);
              const collectionName = t.collectionName || t.name || null;
              return collectionName ? { id, collectionName } : null;
            })
            .filter(Boolean);
        } else if (allToppingsDoc && Array.isArray(allToppingsDoc.toppings)) {
          allToppings = allToppingsDoc.toppings
            .map((t) => ({
              id: t.id || (t._id ? t._id.toString() : undefined),
              collectionName: t.collectionName || t.name,
            }))
            .filter((t) => t.collectionName);
        }

        const uniqueMap = new Map();
        allToppings.forEach((t) => {
          if (t && t.collectionName) uniqueMap.set(t.collectionName, t);
        });
        setToppingOptions(Array.from(uniqueMap.values()));

        try {
          const allCakes = await fetchCakes();
          const cats = Array.isArray(allCakes)
            ? [...new Set(allCakes.map((c) => c.category).filter(Boolean))]
            : [];
          setCategories(cats);
          setShowCustomCategory(!cats.includes(emptyCake.category));
        } catch (e) {
          // ignore categories load errors
        }
      } catch (err) {
        setError(err.message || String(err));
      }
      setLoading(false);
    }
    loadToppingsAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!cake.cakeName?.trim()) {
      errors.cakeName = "Cake name is required";
    }

    if (!cake.cakeDescription?.trim()) {
      errors.cakeDescription = "Description is required";
    }

    if (!cake.category?.trim()) {
      errors.category = "Category is required";
    }

    const mainImage = (cake.images && cake.images[0]) || cake.cakeImage;
    if (!mainImage?.trim()) {
      errors.cakeImage = "Main image is required";
    }

    // Validate pricing
    if (cake.priceBasedPricing) {
      const validPrices = cake.prices?.filter(
        (p) => p && p.price && !isNaN(Number(p.price))
      );
      if (!validPrices?.length) {
        errors.prices = "At least one price must be set";
      }
    } else {
      if (!cake.price || isNaN(Number(cake.price))) {
        errors.price = "Price is required and must be a valid number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Submitting cake data:", cake);
      await createCake(cake);
      navigate("/admin/cakes");
    } catch (err) {
      console.error("Create cake error:", err);
      setError("Failed to create cake: " + (err.message || err));
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
        Create Cake
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleCreateSubmit}>
        <label className="font-medium text-pink-700">Name:</label>
        <input
          type="text"
          className={`bg-white border rounded-lg px-4 py-2 focus:outline-none ${
            formErrors.cakeName
              ? "border-red-300 focus:border-red-600"
              : "border-pink-300 focus:border-pink-600"
          }`}
          value={cake.cakeName}
          onChange={(e) => setCake({ ...cake, cakeName: e.target.value })}
        />
        {formErrors.cakeName && (
          <span className="text-red-500 text-sm">{formErrors.cakeName}</span>
        )}

        <label className="font-medium text-pink-700">Main Image:</label>
        <ImageUploader
          value={(cake.images && cake.images[0]) || cake.cakeImage || ""}
          onChange={(img) => {
            const others =
              cake.images && cake.images.length > 1 ? cake.images.slice(1) : [];
            const images = img ? [img, ...others] : others;
            setCake({ ...cake, images, cakeImage: img || "" });
          }}
        />
        {formErrors.cakeImage && (
          <span className="text-red-500 text-sm">{formErrors.cakeImage}</span>
        )}

        <label className="font-medium text-pink-700">Additional Photos:</label>
        <ImageUploader
          multiple
          value={
            cake.images && cake.images.length > 1 ? cake.images.slice(1) : []
          }
          onChange={(more) => {
            const main =
              cake.images && cake.images.length
                ? cake.images[0]
                : cake.cakeImage || "";
            const images = main
              ? [main, ...(Array.isArray(more) ? more : [more])]
              : Array.isArray(more)
              ? more
              : [more];
            setCake({ ...cake, images, cakeImage: main });
          }}
        />

        <div className="flex items-center gap-3">
          <span className="font-medium text-pink-700">Is Featured:</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!cake.isFeatured}
            onClick={() => setCake({ ...cake, isFeatured: !cake.isFeatured })}
            className="relative inline-flex items-center p-1 rounded-full focus:outline-none focus:ring-0"
          >
            <span
              aria-hidden
              className={`block w-14 h-8 rounded-full transition-colors z-0 ${
                cake.isFeatured ? "bg-pink-600" : "bg-gray-200"
              }`}
            />
            <span
              aria-hidden
              className={`absolute left-2 top-2 w-6 h-6 bg-white rounded-full shadow z-10 transform transition-transform ${
                cake.isFeatured ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <label className="font-medium text-pink-700">Category:</label>
        <select
          value={
            categories.includes(cake.category) ? cake.category : "__other__"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__other__") {
              setShowCustomCategory(true);
              setCake({ ...cake, category: "" });
            } else {
              setShowCustomCategory(false);
              setCake({ ...cake, category: v });
            }
          }}
          className={`bg-white border rounded-lg px-4 py-2 focus:outline-none ${
            formErrors.category
              ? "border-red-300 focus:border-red-600"
              : "border-pink-300 focus:border-pink-600"
          }`}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__other__">New Category</option>
        </select>
        {formErrors.category && (
          <span className="text-red-500 text-sm">{formErrors.category}</span>
        )}
        {showCustomCategory && (
          <input
            type="text"
            className="bg-white border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600 mt-2"
            value={cake.category}
            onChange={(e) => setCake({ ...cake, category: e.target.value })}
            placeholder="Enter custom category"
          />
        )}

        {showCustomCategory && (
          <div className="flex items-center gap-4 mt-2">
            <span className="font-medium text-pink-700">
              Size-based pricing?
            </span>
            <div className="flex items-center gap-2">
              <label
                className={`px-3 py-1 rounded-full cursor-pointer ${
                  cake.priceBasedPricing
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="priceMode"
                  checked={!!cake.priceBasedPricing}
                  onChange={() =>
                    setCake({
                      ...cake,
                      priceBasedPricing: true,
                      price: undefined,
                    })
                  }
                  className="hidden"
                />{" "}
                Yes
              </label>
              <label
                className={`px-3 py-1 rounded-full cursor-pointer ${
                  !cake.priceBasedPricing
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="priceMode"
                  checked={!cake.priceBasedPricing}
                  onChange={() =>
                    setCake({ ...cake, priceBasedPricing: false, prices: [] })
                  }
                  className="hidden"
                />{" "}
                No
              </label>
            </div>
          </div>
        )}

        <label className="font-medium text-pink-700">Description:</label>
        <input
          type="text"
          className={`bg-white border rounded-lg px-4 py-2 focus:outline-none ${
            formErrors.cakeDescription
              ? "border-red-300 focus:border-red-600"
              : "border-pink-300 focus:border-pink-600"
          }`}
          value={cake.cakeDescription}
          onChange={(e) =>
            setCake({ ...cake, cakeDescription: e.target.value })
          }
        />
        {formErrors.cakeDescription && (
          <span className="text-red-500 text-sm">
            {formErrors.cakeDescription}
          </span>
        )}

        <label className="font-medium text-pink-700">
          Detailed Description:
        </label>
        <textarea
          className="bg-white border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.detailedDescription || ""}
          onChange={(e) =>
            setCake({ ...cake, detailedDescription: e.target.value })
          }
        />

        <label className="font-medium text-pink-700">Topping Category:</label>
        <select
          className="bg-white border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.toppingRef || ""}
          onChange={(e) => {
            const v = e.target.value;
            // manage option similar to EditCakePage: show modal if unsaved
            if (v === "__manage__") {
              const hasUnsaved =
                initialCake &&
                JSON.stringify(initialCake) !== JSON.stringify(cake);
              if (hasUnsaved) {
                setShowUnsavedModal(true);
              } else {
                navigate("/admin/toppings");
              }
              return;
            }

            if (!v) {
              setCake({
                ...cake,
                toppingRef: null,
                toppingCollectionName: "",
                toppingCategory: "",
              });
              return;
            }
            const selected = toppingOptions.find(
              (t) => String(t.id) === String(v)
            );
            const collectionName = selected ? selected.collectionName : "";
            setCake({
              ...cake,
              toppingRef: v,
              toppingCollectionName: collectionName,
              toppingCategory: collectionName,
            });
          }}
        >
          <option value="">None</option>
          <option value="__manage__">Manage topping categories...</option>
          {toppingOptions
            .filter((t) => t && t.id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.collectionName}
              </option>
            ))}
        </select>

        <UnsavedChangesModal
          show={showUnsavedModal}
          saving={modalSaving}
          onClose={() => setShowUnsavedModal(false)}
          onSave={async () => {
            setModalSaving(true);
            try {
              await createCake(cake);
              setModalSaving(false);
              setShowUnsavedModal(false);
              navigate("/admin/toppings");
            } catch (err) {
              setModalSaving(false);
              alert("Failed to save changes: " + (err.message || err));
            }
          }}
          onDiscard={() => {
            setShowUnsavedModal(false);
            navigate("/admin/toppings");
          }}
          title={"You're being redirected to Toppings"}
          description={
            "Would you like to save your changes before leaving? You can edit the cake afterwards."
          }
          imageSrc="/idea.png"
        />

        <label className="font-medium text-pink-700">Prices:</label>
        {formErrors.prices && (
          <span className="text-red-500 text-sm">{formErrors.prices}</span>
        )}
        {formErrors.price && (
          <span className="text-red-500 text-sm">{formErrors.price}</span>
        )}
        {showCustomCategory && !cake.priceBasedPricing ? (
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Price
            </span>
            <input
              type="number"
              className="bg-white border border-pink-300 rounded-lg px-2 py-1 w-40"
              value={cake.price || ""}
              onChange={(e) =>
                setCake({
                  ...cake,
                  price:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="Price"
            />
          </div>
        ) : /cup/i.test(cake.category || "") ? (
          (() => {
            const cupcakePriceObj = Array.isArray(cake.prices)
              ? cake.prices.find(
                  (p) => (p && String(p.size || "")).toLowerCase() === "cupcake"
                )
              : null;
            return (
              <div className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium text-gray-700">
                  Cupcake price
                </span>
                <input
                  type="number"
                  className="bg-white border border-pink-300 rounded-lg px-2 py-1 w-40"
                  value={cupcakePriceObj ? cupcakePriceObj.price : ""}
                  onChange={(e) => setCupcakePrice(e.target.value)}
                  placeholder="Price"
                />
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {SIZE_OPTIONS.map((size) => {
              const priceObj = getPriceObj(size);
              const available = !!priceObj;
              return (
                <div key={size} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={() => toggleAvailable(size)}
                    className="!bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-sm font-medium text-gray-700 text-right">
                      {size}
                    </span>
                    <input
                      type="number"
                      className="bg-white border border-pink-300 rounded-lg px-2 py-1 w-40"
                      value={priceObj ? priceObj.price : ""}
                      onChange={(e) => setPriceForSize(size, e.target.value)}
                      placeholder="Price"
                      disabled={!available}
                    />
                  </div>
                </div>
              );
            })}
            <div className="text-sm text-gray-500">
              Only checked sizes are saved as available prices.
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={!hasChanges}
            className={
              "px-5 py-2 rounded-full font-medium shadow transition-colors " +
              (hasChanges
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed")
            }
          >
            {hasChanges ? "Create" : "No changes"}
          </button>
          <button
            type="button"
            className="bg-gray-100 text-pink-600 px-5 py-2 rounded-full font-medium shadow hover:bg-pink-100 transition-colors"
            onClick={() => navigate("/admin/cakes")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
