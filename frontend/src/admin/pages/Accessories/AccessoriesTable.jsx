import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAccessories,
  fetchHiddenAccessories,
  deleteAccessory,
  hideAccessory,
} from "../../../api/accessory.js";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../../../utils/imageUtils.js";
import FeedbackModal from "../../components/FeedbackModal";

export default function AccessoriesTable() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [modalDeleting, setModalDeleting] = useState(false);
  const [showingHidden, setShowingHidden] = useState(false);
  const [hiddenAccessories, setHiddenAccessories] = useState([]);
  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    async function loadAccessories() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAccessories();
        setAccessories(data);
      } catch (err) {
        const errorMessage =
          "Failed to load accessories: " + (err.message || err);
        setError(errorMessage);
        showFeedback("error", "Loading Failed", errorMessage);
      }
      setLoading(false);
    }
    loadAccessories();
  }, []);

  const filteredAccessories = (
    showingHidden ? hiddenAccessories : accessories
  ).filter((accessory) => {
    // Name filter
    if (filter && !accessory.name.toLowerCase().includes(filter.toLowerCase()))
      return false;
    // Price range filter
    if (priceMin && accessory.price < Number(priceMin)) return false;
    if (priceMax && accessory.price > Number(priceMax)) return false;
    return true;
  });

  const showFeedback = (type, title, message) => {
    setFeedback({ show: true, type, title, message });
  };

  const handleEdit = (accessory) => {
    navigate(`/admin/accessories/edit/${accessory._id}`);
  };

  // Open the confirmation modal for a specific accessory
  const handleRemove = (accessory) => {
    setRemoveTarget(accessory);
    setShowRemoveModal(true);
  };

  // Hide an accessory
  const handleHide = async (accessory) => {
    try {
      await hideAccessory(accessory._id, true);
      setAccessories((prev) => prev.filter((a) => a._id !== accessory._id));
      showFeedback(
        "success",
        "Accessory Hidden",
        `"${accessory.name}" has been hidden successfully.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Hide Failed",
        `Failed to hide accessory: ${err.message || err}`
      );
    }
  };

  // Unhide an accessory
  const handleUnhide = async (accessory) => {
    try {
      await hideAccessory(accessory._id, false);
      setHiddenAccessories((prev) =>
        prev.filter((a) => a._id !== accessory._id)
      );
      // Refresh the main accessories to include the unhidden accessory
      const accessoriesData = await fetchAccessories();
      setAccessories(accessoriesData);
      showFeedback(
        "success",
        "Accessory Unhidden",
        `"${accessory.name}" is now visible and available.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Unhide Failed",
        `Failed to unhide accessory: ${err.message || err}`
      );
    }
  };

  // Toggle between showing regular and hidden accessories
  const toggleHiddenView = async () => {
    if (!showingHidden) {
      try {
        setLoading(true);
        const hiddenAccessoriesData = await fetchHiddenAccessories();
        setHiddenAccessories(hiddenAccessoriesData);
        setShowingHidden(true);
        if (hiddenAccessoriesData.length === 0) {
          showFeedback(
            "info",
            "No Hidden Accessories",
            "There are currently no hidden accessories."
          );
        }
      } catch (err) {
        showFeedback(
          "error",
          "Failed to Load",
          `Failed to fetch hidden accessories: ${err.message || err}`
        );
      } finally {
        setLoading(false);
      }
    } else {
      setShowingHidden(false);
    }
  };

  // Confirm and perform deletion
  const confirmRemove = async () => {
    if (!removeTarget) return;
    setModalDeleting(true);
    try {
      await deleteAccessory(removeTarget._id);
      setAccessories((prev) => prev.filter((a) => a._id !== removeTarget._id));
      setShowRemoveModal(false);
      setRemoveTarget(null);
      showFeedback(
        "success",
        "Accessory Deleted",
        `"${removeTarget.name}" has been successfully deleted.`
      );
    } catch (err) {
      showFeedback(
        "error",
        "Delete Failed",
        `Failed to delete accessory: ${err.message || err}`
      );
    }
    setModalDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        {showingHidden ? "Hidden Accessories" : "All Accessories"}
      </h2>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/accessories/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Accessory
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
            ? "View Active Accessories"
            : "View Hidden Accessories"}
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
      </div>
      {loading ? (
        <div className="text-gray-500">Loading accessories...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredAccessories.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {showingHidden
            ? "No hidden accessories found"
            : "No accessories found"}
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
                  Price
                </th>
                <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredAccessories.map((accessory) => {
                return (
                  <tr key={accessory._id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">
                      <img
                        src={
                          normalizeImageUrl(accessory.image) ||
                          getAccessoryFallback()
                        }
                        alt={accessory.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={handleImageError}
                      />
                    </td>
                    <td className="px-4 py-2">{accessory.name}</td>
                    <td className="px-4 py-2">
                      {accessory.description || "-"}
                    </td>
                    <td className="px-4 py-2">{accessory.price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-row gap-2 items-center">
                        <button
                          className="bg-green-400 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-green-500 transition-colors focus:outline-none"
                          onClick={() => handleEdit(accessory)}
                          style={{
                            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.10)",
                          }}
                        >
                          Edit
                        </button>
                        {showingHidden ? (
                          <button
                            className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-600 transition-colors focus:outline-none"
                            onClick={() => handleUnhide(accessory)}
                            style={{
                              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.10)",
                            }}
                          >
                            Unhide
                          </button>
                        ) : (
                          <button
                            className="bg-pink-300 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-400 transition-colors focus:outline-none"
                            onClick={() => handleHide(accessory)}
                            style={{
                              boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)",
                            }}
                          >
                            Hide
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-red-600 transition-colors focus:outline-none"
                          onClick={() => handleRemove(accessory)}
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
              This will permanently delete the accessory{" "}
              {removeTarget ? removeTarget.name : ""}. You can hide it instead.
              Are you sure?
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
