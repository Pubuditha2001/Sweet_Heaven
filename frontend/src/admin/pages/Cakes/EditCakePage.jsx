import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCakeById, updateCake, fetchCakes } from "../../../api/cake";
import ImageUploader from "../../../components/ImageUploader";
import { fetchAllToppings, fetchToppingsByRef } from "../../../api/topping";

export default function EditCakePage() {
  // toppingOptions will be an array of { id, collectionName }
  const [toppingOptions, setToppingOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [cake, setCake] = useState(null);
  const [initialCake, setInitialCake] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // whether the form has unsaved changes compared to the initial loaded cake
  const hasChanges = useMemo(() => {
    if (!initialCake || !cake) return false;
    try {
      return JSON.stringify(initialCake) !== JSON.stringify(cake);
    } catch (e) {
      // if stringify fails for some reason, assume changed to be safe
      return true;
    }
  }, [initialCake, cake]);

  useEffect(() => {
    async function loadCakeAndToppings() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakeById(id);
        // If cake has toppingRef, fetch that topping doc to get collectionName
        const updatedCake = { ...data };
        // normalize toppingRef to string when present
        if (updatedCake.toppingRef)
          updatedCake.toppingRef = String(updatedCake.toppingRef);
        if (data.toppingRef) {
          try {
            const toppingDoc = await fetchToppingsByRef(data.toppingRef);
            if (toppingDoc && toppingDoc.collectionName) {
              // store the human-friendly collection name used by CakesTable
              updatedCake.toppingCollectionName = toppingDoc.collectionName;
              // keep toppingCategory for backward compatibility with existing code
              updatedCake.toppingCategory = toppingDoc.collectionName;
            }
          } catch (e) {
            // ignore individual topping fetch errors
          }
        }
        // determine priceBasedPricing if not explicitly set
        if (data.hasOwnProperty("priceBasedPricing")) {
          updatedCake.priceBasedPricing = data.priceBasedPricing;
        } else {
          updatedCake.priceBasedPricing =
            Array.isArray(data.prices) && data.prices.length > 0;
        }
        // preserve single price when present
        if (data.hasOwnProperty("price")) updatedCake.price = data.price;

        setCake(updatedCake);
        setInitialCake(updatedCake);
        // Fetch all topping collections for dropdown and normalize to collectionName strings
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
        // dedupe by collectionName and keep {id, collectionName}
        const uniqueMap = new Map();
        allToppings.forEach((t) => {
          if (t && t.collectionName) uniqueMap.set(t.collectionName, t);
        });
        const uniqueToppings = Array.from(uniqueMap.values());
        setToppingOptions(uniqueToppings);
        // Fetch categories (unique) from all cakes for category select
        try {
          const allCakes = await fetchCakes();
          const cats = Array.isArray(allCakes)
            ? [...new Set(allCakes.map((c) => c.category).filter(Boolean))]
            : [];
          setCategories(cats);
          setShowCustomCategory(!cats.includes(updatedCake.category));
        } catch (e) {
          // ignore categories load errors
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakeAndToppings();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCake(cake._id, cake);
      navigate("/admin/cakes");
    } catch (err) {
      alert("Failed to update cake: " + err.message);
    }
  };

  // Price helpers (used in render)
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
    if (!cake || !Array.isArray(cake.prices)) return null;
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
    if (idx > -1) {
      newPrices[idx] = { ...newPrices[idx], price: value };
    } else {
      newPrices.push({ size, sizeId: size, price: value });
    }
    setCake({ ...cake, prices: newPrices });
  };

  const setCupcakePrice = (v) => {
    const newPrices = Array.isArray(cake.prices) ? [...cake.prices] : [];
    const idx = newPrices.findIndex(
      (p) => (p && String(p.size || "")).toLowerCase() === "cupcake"
    );
    if (idx > -1) {
      newPrices[idx] = { ...newPrices[idx], price: v };
    } else {
      newPrices.push({ size: "cupcake", sizeId: "standard", price: v });
    }
    setCake({ ...cake, prices: newPrices });
  };

  if (loading) return <div className="text-gray-500">Loading cake...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!cake) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
        Edit Cake
      </h2>
      <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
        <label className="font-medium text-pink-700">Name:</label>
        <input
          type="text"
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.cakeName}
          onChange={(e) => setCake({ ...cake, cakeName: e.target.value })}
        />
        <label className="font-medium text-pink-700">Main Image:</label>
        <ImageUploader
          value={(cake.images && cake.images[0]) || cake.cakeImage || ""}
          onChange={(img) => {
            const others =
              cake.images && cake.images.length > 1 ? cake.images.slice(1) : [];
            const images = img ? [img, ...others] : others;
            setCake({ ...cake, images });
          }}
        />

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
            setCake({ ...cake, images });
          }}
        />
        <div className="flex items-center gap-3">
          <span className="font-medium text-pink-700">Is Featured:</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!cake.isFeatured}
            onClick={() => setCake({ ...cake, isFeatured: !cake.isFeatured })}
            className="relative inline-flex items-center p-1 rounded-full focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none active:ring-0"
          >
            {/* track */}
            <span
              aria-hidden
              className={
                `block w-14 h-8 rounded-full transition-colors z-0 ` +
                (cake.isFeatured ? "bg-pink-600" : "bg-gray-200")
              }
            />
            {/* knob */}
            <span
              aria-hidden
              className={
                `absolute left-2 top-2 w-6 h-6 bg-white rounded-full shadow z-10 transform transition-transform ` +
                (cake.isFeatured ? "translate-x-6" : "translate-x-0")
              }
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
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__other__">New Category</option>
        </select>
        {showCustomCategory && (
          <input
            type="text"
            className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600 mt-2"
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
                  name="priceModeEdit"
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
                  name="priceModeEdit"
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
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.cakeDescription}
          onChange={(e) =>
            setCake({ ...cake, cakeDescription: e.target.value })
          }
        />

        <label className="font-medium text-pink-700">
          Detailed Description:
        </label>
        <textarea
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.detailedDescription || ""}
          onChange={(e) =>
            setCake({ ...cake, detailedDescription: e.target.value })
          }
        />
        <label className="font-medium text-pink-700">Topping Category:</label>
        <select
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.toppingRef || ""}
          onChange={(e) => {
            const v = e.target.value;
            // special option to manage topping collections in the admin UI
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

            // if empty, clear toppingRef and names
            if (!v) {
              setCake({
                ...cake,
                toppingRef: null,
                toppingCollectionName: "",
                toppingCategory: "",
              });
              return;
            }

            // find the selected topping object to get its collectionName
            const selected = toppingOptions.find(
              (t) => String(t.id) === String(v)
            );
            const collectionName = selected ? selected.collectionName : "";

            // update cake with the topping id (toppingRef) and human-friendly names
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
        {/* Unsaved changes modal */}
        {showUnsavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setShowUnsavedModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
              {/* Pop-out icon: positioned above the modal so it overlaps the top border */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
                <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
                  <img
                    src="/idea.png"
                    alt="Unsaved changes"
                    className="w-16 h-16"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
                You're being redirected to Toppings
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Would you like to save your changes before leaving? You can edit
                the cake afterwards.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={modalSaving}
                  className="bg-green-400 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  onClick={async () => {
                    setModalSaving(true);
                    try {
                      await updateCake(cake._id, cake);
                      setModalSaving(false);
                      setShowUnsavedModal(false);
                      navigate("/admin/toppings");
                    } catch (err) {
                      setModalSaving(false);
                      alert("Failed to save changes: " + (err.message || err));
                    }
                  }}
                >
                  {modalSaving ? "Saving..." : "Save and Leave"}
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    // discard and go to toppings
                    setShowUnsavedModal(false);
                    navigate("/admin/toppings");
                  }}
                >
                  Discard and Leave
                </button>
                <button
                  type="button"
                  className="bg-pink-100 text-gray-700 px-4 py-2 rounded-md border"
                  onClick={() => setShowUnsavedModal(false)}
                >
                  Stay on this page
                </button>
              </div>
            </div>
          </div>
        )}
        <label className="font-medium text-pink-700">Prices:</label>
        {/* Fixed size options: 500g to 5kg by 500g. No size selection for cupcakes. */}
        {showCustomCategory && !cake.priceBasedPricing ? (
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Price
            </span>
            <input
              type="number"
              className="border border-pink-300 rounded-lg px-2 py-1 w-40"
              value={cake.price || ""}
              onChange={(e) => setCake({ ...cake, price: e.target.value })}
              placeholder="Price"
            />
          </div>
        ) : (
          <>
            {/cup/i.test(cake.category || "") ? (
              (() => {
                const cupcakePriceObj = Array.isArray(cake.prices)
                  ? cake.prices.find(
                      (p) =>
                        (p && String(p.size || "")).toLowerCase() === "cupcake"
                    )
                  : null;
                return (
                  <div className="flex items-center gap-3">
                    <span className="w-32 text-sm font-medium text-gray-700">
                      Cupcake price
                    </span>
                    <input
                      type="number"
                      className="border border-pink-300 rounded-lg px-2 py-1 w-40"
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
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-sm font-medium text-gray-700 text-right">
                          {size}
                        </span>
                        <input
                          type="number"
                          className="border border-pink-300 rounded-lg px-2 py-1 w-40"
                          value={priceObj ? priceObj.price : ""}
                          onChange={(e) =>
                            setPriceForSize(size, e.target.value)
                          }
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
          </>
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
            {hasChanges ? "Save" : "No changes"}
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
