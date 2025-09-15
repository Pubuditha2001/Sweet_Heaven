import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccessories, deleteAccessory } from "../../../api/accessory.js";
import {
  normalizeImageUrl,
  getAccessoryFallback,
  handleImageError,
} from "../../../utils/imageUtils.js";

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

  useEffect(() => {
    async function loadAccessories() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAccessories();
        setAccessories(data);
      } catch (err) {
        setError("Failed to load accessories: " + (err.message || err));
      }
      setLoading(false);
    }
    loadAccessories();
  }, []);

  const filteredAccessories = accessories.filter((accessory) => {
    // Name filter
    if (filter && !accessory.name.toLowerCase().includes(filter.toLowerCase()))
      return false;
    // Price range filter
    if (priceMin && accessory.price < Number(priceMin)) return false;
    if (priceMax && accessory.price > Number(priceMax)) return false;
    return true;
  });

  const handleEdit = (accessory) => {
    navigate(`/admin/accessories/edit/${accessory._id}`);
  };

  // Open the confirmation modal for a specific accessory
  const handleRemove = (accessory) => {
    setRemoveTarget(accessory);
    setShowRemoveModal(true);
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
    } catch (err) {
      alert("Failed to delete accessory: " + (err.message || err));
    }
    setModalDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        All Accessories
      </h2>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/accessories/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Accessory
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
    </div>
  );
}
