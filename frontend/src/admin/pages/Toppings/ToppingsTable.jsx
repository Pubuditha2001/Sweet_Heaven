import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllToppings,
  fetchHiddenToppings,
  deleteToppingCollection,
  hideToppingCollection,
} from "../../../api/topping.js";
import {
  normalizeImageUrl,
  getToppingFallback,
  handleToppingImageError,
} from "../../../utils/imageUtils.js";
import FeedbackModal from "../../components/FeedbackModal";

export default function ToppingsTable() {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [modalDeleting, setModalDeleting] = useState(false);
  const [showingHidden, setShowingHidden] = useState(false);
  const [hiddenToppings, setHiddenToppings] = useState([]);
  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    async function loadToppings() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllToppings();
        // The API returns a list of collections with id and collectionName
        setToppings(data || []);
      } catch (err) {
        const errorMessage = "Failed to load toppings: " + (err.message || err);
        setError(errorMessage);
        showFeedback("error", "Loading Failed", errorMessage);
      }
      setLoading(false);
    }
    loadToppings();
  }, []);

  const filteredToppings = (showingHidden ? hiddenToppings : toppings).filter(
    (topping) => {
      // Name filter on collection name
      if (
        filter &&
        !topping.collectionName.toLowerCase().includes(filter.toLowerCase())
      )
        return false;
      return true;
    }
  );

  const showFeedback = (type, title, message) => {
    setFeedback({ show: true, type, title, message });
  };

  const handleEdit = (topping) => {
    navigate(`/admin/toppings/edit/${topping.id}`);
  };

  // Open the confirmation modal for a specific topping collection
  const handleRemove = (topping) => {
    setRemoveTarget(topping);
    setShowRemoveModal(true);
  };

  // Confirm and perform deletion
  const confirmRemove = async () => {
    if (!removeTarget) return;
    setModalDeleting(true);
    try {
      await deleteToppingCollection(removeTarget.id);
      setToppings((prev) => prev.filter((t) => t.id !== removeTarget.id));
      setShowRemoveModal(false);
      setRemoveTarget(null);
      showFeedback(
        "success",
        "Topping Collection Deleted",
        `"${removeTarget.collectionName}" has been successfully deleted.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Delete Failed",
        `Failed to delete topping collection: ${err.message || err}`
      );
    }
    setModalDeleting(false);
  };

  // Hide a topping collection
  const handleHide = async (topping) => {
    try {
      await hideToppingCollection(topping.id, true);
      setToppings((prev) => prev.filter((t) => t.id !== topping.id));
      showFeedback(
        "success",
        "Topping Collection Hidden",
        `"${topping.collectionName}" has been hidden successfully.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Hide Failed",
        `Failed to hide topping collection: ${err.message || err}`
      );
    }
  };

  // Unhide a topping collection
  const handleUnhide = async (topping) => {
    try {
      await hideToppingCollection(topping.id, false);
      setHiddenToppings((prev) => prev.filter((t) => t.id !== topping.id));
      // Refresh the main toppings to include the unhidden topping
      const toppingsData = await fetchAllToppings();
      setToppings(toppingsData || []);
      showFeedback(
        "success",
        "Topping Collection Unhidden",
        `"${topping.collectionName}" is now visible and available.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Unhide Failed",
        `Failed to unhide topping collection: ${err.message || err}`
      );
    }
  };

  // Toggle between showing regular and hidden toppings
  const toggleHiddenView = async () => {
    if (!showingHidden) {
      try {
        setLoading(true);
        const hiddenToppingsData = await fetchHiddenToppings();
        setHiddenToppings(hiddenToppingsData || []);
        setShowingHidden(true);
        if (!hiddenToppingsData || hiddenToppingsData.length === 0) {
          showFeedback(
            "info",
            "No Hidden Topping Collections",
            "There are currently no hidden topping collections."
          );
        }
      } catch (err) {
        showFeedback(
          "error",
          "Failed to Load",
          `Failed to fetch hidden topping collections: ${err.message || err}`
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
        {showingHidden
          ? "Hidden Topping Collections"
          : "All Topping Collections"}
      </h2>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/toppings/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Topping Collection
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
          {showingHidden
            ? "View Active Collections"
            : "View Hidden Collections"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by collection name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
      </div>
      {loading ? (
        <div className="text-gray-500">Loading topping collections...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredToppings.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {showingHidden
            ? "No hidden topping collections found"
            : "No topping collections found"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-pink-50">
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Collection Name
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Collection ID
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredToppings.map((topping) => {
                return (
                  <tr key={topping.id} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-medium">
                      {topping.collectionName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {topping.id}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-row gap-2 items-center">
                        <button
                          className="bg-green-400 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-green-500 transition-colors focus:outline-none"
                          onClick={() => handleEdit(topping)}
                          style={{
                            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.10)",
                          }}
                        >
                          Edit
                        </button>
                        {showingHidden ? (
                          <button
                            className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-600 transition-colors focus:outline-none"
                            onClick={() => handleUnhide(topping)}
                            style={{
                              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.10)",
                            }}
                          >
                            Unhide
                          </button>
                        ) : (
                          <button
                            className="bg-pink-300 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-400 transition-colors focus:outline-none"
                            onClick={() => handleHide(topping)}
                            style={{
                              boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)",
                            }}
                          >
                            Hide
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-red-600 transition-colors focus:outline-none"
                          onClick={() => handleRemove(topping)}
                          style={{
                            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.10)",
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
              This will permanently delete the topping collection{" "}
              {removeTarget ? removeTarget.collectionName : ""} and all toppings
              within it. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={modalDeleting}
                className="bg-red-400 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                onClick={confirmRemove}
              >
                {modalDeleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                className="bg-green-400 text-white px-4 py-2 rounded-md"
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
