import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllToppings,
  deleteToppingCollection,
} from "../../../api/topping.js";
import {
  normalizeImageUrl,
  getToppingFallback,
  handleToppingImageError,
} from "../../../utils/imageUtils.js";

export default function ToppingsTable() {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [modalDeleting, setModalDeleting] = useState(false);

  useEffect(() => {
    async function loadToppings() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllToppings();
        // The API returns a list of collections with id and collectionName
        setToppings(data || []);
      } catch (err) {
        setError("Failed to load toppings: " + (err.message || err));
      }
      setLoading(false);
    }
    loadToppings();
  }, []);

  const filteredToppings = toppings.filter((topping) => {
    // Name filter on collection name
    if (
      filter &&
      !topping.collectionName.toLowerCase().includes(filter.toLowerCase())
    )
      return false;
    return true;
  });

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
    } catch (err) {
      alert("Failed to delete topping collection: " + (err.message || err));
    }
    setModalDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        All Topping Collections
      </h2>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/toppings/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Topping Collection
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
                        <button
                          className="bg-pink-300 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-400 transition-colors focus:outline-none"
                          onClick={() =>
                            alert("Hide functionality not implemented yet.")
                          }
                          style={{
                            boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)",
                          }}
                        >
                          Hide
                        </button>
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
    </div>
  );
}
