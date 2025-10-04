import React, { useState, useEffect } from "react";
import {
  fetchCakes,
  fetchHiddenCakes,
  updateCake,
  deleteCake,
  hideCake,
} from "../../../api/cake";
import { useNavigate } from "react-router-dom";
import { fetchAllToppings, fetchToppingsByRef } from "../../../api/topping";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../../../utils/imageUtils.js";
import FeedbackModal from "../../components/FeedbackModal";

export default function CakesTable() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const [toppings, setToppings] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [toppingFilter, setToppingFilter] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [modalDeleting, setModalDeleting] = useState(false);
  const [showingHidden, setShowingHidden] = useState(false);
  const [hiddenCakes, setHiddenCakes] = useState([]);
  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    async function loadCakesAndToppings() {
      setLoading(true);
      setError("");
      try {
        // Fetch all topping collections first so we can detect which toppingRef ids exist.
        const allToppingsDoc = await fetchAllToppings();
        let allToppings = [];
        if (Array.isArray(allToppingsDoc)) {
          allToppings = allToppingsDoc
            .map((t) => {
              if (!t) return null;
              if (t.collectionName)
                return {
                  id: t.id || t._id || (t._id ? t._id.toString() : undefined),
                  collectionName: t.collectionName,
                };
              return {
                id: t.id || t._id,
                collectionName: t.name || t.collectionName,
              };
            })
            .filter(Boolean);
        } else if (allToppingsDoc && Array.isArray(allToppingsDoc.toppings)) {
          allToppings = allToppingsDoc.toppings
            .map((t) => ({
              id: t.id || t._id,
              collectionName: t.collectionName || t.name,
            }))
            .filter(Boolean);
        }
        setToppings(allToppings);

        const validToppingIds = new Set(allToppings.map((t) => String(t.id)));

        const cakesData = await fetchCakes();
        // Fetch topping names only for cakes that reference an existing topping doc
        const cakesWithTopping = await Promise.all(
          cakesData.map(async (cake) => {
            let toppingCollectionName = "";
            if (
              cake.toppingRef &&
              validToppingIds.has(String(cake.toppingRef))
            ) {
              try {
                const toppingDoc = await fetchToppingsByRef(cake.toppingRef);
                if (toppingDoc && toppingDoc.collectionName) {
                  toppingCollectionName = toppingDoc.collectionName;
                }
              } catch {}
            }
            // If cake has a toppings array of strings (new backend shape), prefer that for display.
            const toppingsPreview = Array.isArray(cake.toppings)
              ? cake.toppings.join(", ")
              : toppingCollectionName;
            return { ...cake, toppingCollectionName, toppingsPreview };
          })
        );
        setCakes(cakesWithTopping);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakesAndToppings();
  }, []);

  const filteredCakes = (showingHidden ? hiddenCakes : cakes).filter((cake) => {
    // Name filter
    if (filter && !cake.cakeName.toLowerCase().includes(filter.toLowerCase()))
      return false;
    // Category filter
    if (categoryFilter && cake.category !== categoryFilter) return false;
    // Price range filter
    const minPrice =
      Array.isArray(cake.prices) && cake.prices.length > 0
        ? Math.min(...cake.prices.map((p) => p.price))
        : null;
    if (priceMin && (minPrice === null || minPrice < Number(priceMin)))
      return false;
    if (priceMax && (minPrice === null || minPrice > Number(priceMax)))
      return false;
    // Topping filter (compare against toppingCollectionName produced earlier)
    if (toppingFilter && cake.toppingCollectionName !== toppingFilter)
      return false;
    return true;
  });

  const showFeedback = (type, title, message) => {
    setFeedback({ show: true, type, title, message });
  };

  const handleEdit = (cake) => {
    navigate(`/admin/cakes/edit/${cake._id}`);
  };

  // Open the confirmation modal for a specific cake
  const handleRemove = (cake) => {
    setRemoveTarget(cake);
    setShowRemoveModal(true);
  };

  // Confirm and perform deletion
  const confirmRemove = async () => {
    if (!removeTarget) return;
    setModalDeleting(true);
    try {
      await deleteCake(removeTarget._id);
      setCakes((prev) => prev.filter((c) => c._id !== removeTarget._id));
      setShowRemoveModal(false);
      setRemoveTarget(null);
      showFeedback(
        "success",
        "Cake Deleted",
        `"${removeTarget.cakeName}" has been successfully deleted.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Delete Failed",
        `Failed to delete cake: ${err.message || err}`
      );
    }
    setModalDeleting(false);
  };

  // Hide/unhide a cake
  const handleHide = async (cake) => {
    try {
      await hideCake(cake._id, true);
      // Remove from the current list since we filter out hidden cakes
      setCakes((prev) => prev.filter((c) => c._id !== cake._id));
      showFeedback(
        "success",
        "Cake Hidden",
        `"${cake.cakeName}" has been hidden successfully.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Hide Failed",
        `Failed to hide cake: ${err.message || err}`
      );
    }
  };

  // Unhide a cake
  const handleUnhide = async (cake) => {
    try {
      await hideCake(cake._id, false);
      // Remove from hidden cakes list and add to main cakes list
      setHiddenCakes((prev) => prev.filter((c) => c._id !== cake._id));
      // Refresh the main cakes to include the unhidden cake
      const cakesData = await fetchCakes();
      const validToppingIds = new Set(toppings.map((t) => String(t.id)));
      const cakesWithTopping = await Promise.all(
        cakesData.map(async (cakeItem) => {
          let toppingCollectionName = "";
          if (
            cakeItem.toppingRef &&
            validToppingIds.has(String(cakeItem.toppingRef))
          ) {
            try {
              const { fetchToppingsByRef } = await import(
                "../../../api/topping"
              );
              const toppingDoc = await fetchToppingsByRef(cakeItem.toppingRef);
              if (toppingDoc && toppingDoc.collectionName) {
                toppingCollectionName = toppingDoc.collectionName;
              }
            } catch {}
          }
          const toppingsPreview = Array.isArray(cakeItem.toppings)
            ? cakeItem.toppings.join(", ")
            : toppingCollectionName;
          return { ...cakeItem, toppingCollectionName, toppingsPreview };
        })
      );
      setCakes(cakesWithTopping);
      showFeedback(
        "success",
        "Cake Unhidden",
        `"${cake.cakeName}" is now visible and available.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Unhide Failed",
        `Failed to unhide cake: ${err.message || err}`
      );
    }
  };

  // Toggle between showing regular and hidden cakes
  const toggleHiddenView = async () => {
    if (!showingHidden) {
      // Load hidden cakes
      try {
        setLoading(true);
        const hiddenCakesData = await fetchHiddenCakes();
        const validToppingIds = new Set(toppings.map((t) => String(t.id)));
        const hiddenCakesWithTopping = await Promise.all(
          hiddenCakesData.map(async (cake) => {
            let toppingCollectionName = "";
            if (
              cake.toppingRef &&
              validToppingIds.has(String(cake.toppingRef))
            ) {
              try {
                const { fetchToppingsByRef } = await import(
                  "../../../api/topping"
                );
                const toppingDoc = await fetchToppingsByRef(cake.toppingRef);
                if (toppingDoc && toppingDoc.collectionName) {
                  toppingCollectionName = toppingDoc.collectionName;
                }
              } catch {}
            }
            const toppingsPreview = Array.isArray(cake.toppings)
              ? cake.toppings.join(", ")
              : toppingCollectionName;
            return { ...cake, toppingCollectionName, toppingsPreview };
          })
        );
        setHiddenCakes(hiddenCakesWithTopping);
        setShowingHidden(true);
        if (hiddenCakesData.length === 0) {
          showFeedback(
            "info",
            "No Hidden Cakes",
            "There are currently no hidden cakes."
          );
        }
      } catch (err) {
        showFeedback(
          "error",
          "Failed to Load",
          `Failed to fetch hidden cakes: ${err.message || err}`
        );
      } finally {
        setLoading(false);
      }
    } else {
      setShowingHidden(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        {showingHidden ? "Hidden Cakes" : "All Cakes"}
      </h2>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/cakes/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Cake
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold shadow transition-colors focus:outline-none ${
            showingHidden
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-500 text-white hover:bg-gray-700"
          }`}
          onClick={toggleHiddenView}
          style={{
            boxShadow: showingHidden
              ? "0 2px 8px rgba(34, 197, 94, 0.10)"
              : "0 2px 8px rgba(234, 88, 12, 0.10)",
          }}
        >
          {showingHidden ? "View Active Cakes" : "View Hidden Cakes"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        >
          <option value="">All Categories</option>
          {[
            ...new Set(
              (showingHidden ? hiddenCakes : cakes).map((c) => c.category)
            ),
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <select
          value={toppingFilter}
          onChange={(e) => setToppingFilter(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        >
          <option value="">All Topping Types</option>
          {toppings.map((t) => (
            <option key={t.id} value={t.collectionName}>
              {t.collectionName}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading cakes...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredCakes.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {showingHidden ? "No hidden cakes found" : "No cakes found"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-pink-50">
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Image
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Price (Min)
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Toppings
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredCakes.map((cake) => {
                return (
                  <tr key={cake._id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">
                      {(() => {
                        // Determine main image from multiple possible shapes
                        let raw = null;
                        if (
                          Array.isArray(cake.images) &&
                          cake.images.length > 0
                        )
                          raw = cake.images[0];
                        if (!raw && cake.cakeImage) raw = cake.cakeImage;
                        if (!raw && cake.image) raw = cake.image;
                        // If raw is an object, try common fields
                        if (raw && typeof raw === "object") {
                          raw =
                            raw.url ||
                            raw.src ||
                            raw.path ||
                            raw.publicUrl ||
                            raw.public_url ||
                            raw;
                        }
                        const imgSrc =
                          normalizeImageUrl(
                            typeof raw === "string" ? raw : ""
                          ) || getAccessoryFallback();
                        return (
                          <img
                            src={imgSrc}
                            alt={cake.cakeName}
                            className="w-12 h-12 object-cover rounded"
                            onError={handleImageError}
                          />
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2">{cake.cakeName}</td>
                    <td className="px-4 py-2">{cake.cakeDescription}</td>
                    <td className="px-4 py-2">{cake.category}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(cake.prices) && cake.prices.length > 0
                        ? Math.min(...cake.prices.map((p) => p.price))
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {cake.toppingsPreview ||
                        cake.toppingCollectionName ||
                        "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-row gap-2 items-center">
                        <button
                          className="bg-green-400 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-600 transition-colors focus:outline-none"
                          onClick={() => handleEdit(cake)}
                          style={{
                            boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)",
                          }}
                        >
                          Edit
                        </button>
                        {showingHidden ? (
                          <button
                            className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-600 transition-colors focus:outline-none"
                            onClick={() => handleUnhide(cake)}
                            style={{
                              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.10)",
                            }}
                          >
                            Unhide
                          </button>
                        ) : (
                          <button
                            className="bg-pink-300 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-yellow-200 transition-colors focus:outline-none"
                            onClick={() => handleHide(cake)}
                            style={{
                              boxShadow: "0 2px 8px rgba(251, 191, 36, 0.10)",
                            }}
                          >
                            Hide
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-gray-200 transition-colors focus:outline-none"
                          onClick={() => handleRemove(cake)}
                          style={{
                            boxShadow: "0 2px 8px rgba(233, 30, 99, 0.07)",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit Modal removed. Navigation to EditCakePage instead. */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowRemoveModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
              <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
                <img src="/idea.png" alt="Remove" className="w-16 h-16" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
              Confirm removal
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the cake{" "}
              {removeTarget ? removeTarget.cakeName : ""}. You can hide it
              instead. Are you sure?
            </p>
            <div className="flex justify-center gap-2 w-full">
              <button
                type="button"
                disabled={modalDeleting}
                className="flex-1 min-w-0 bg-red-400 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 text-center"
                onClick={confirmRemove}
              >
                {modalDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                className="flex-1 min-w-0 bg-green-400 text-white px-4 py-2 rounded-md text-center"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <FeedbackModal
        show={feedback.show}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, show: false })}
      />
    </div>
  );
}
