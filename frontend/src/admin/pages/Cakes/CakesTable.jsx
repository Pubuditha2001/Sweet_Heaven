import React, { useState, useEffect } from "react";
import { fetchCakes, updateCake, deleteCake } from "../../../api/cake";
import { useNavigate } from "react-router-dom";
import { fetchAllToppings, fetchToppingsByRef } from "../../../api/topping";

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
            return { ...cake, toppingCollectionName };
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

  const filteredCakes = cakes.filter((cake) => {
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

  const handleEdit = (cake) => {
    navigate(`/admin/cakes/edit/${cake._id}`);
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cake?")) return;
    try {
      await deleteCake(id);
      setCakes((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete cake: " + err.message);
    }
  };

  const handleEditSubmit = async (updatedCake) => {
    try {
      const res = await updateCake(updatedCake._id, updatedCake);
      setCakes((prev) => prev.map((c) => (c._id === res._id ? res : c)));
      setEditModalOpen(false);
      setEditCake(null);
    } catch (err) {
      alert("Failed to update cake: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        All Cakes
      </h2>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
          onClick={() => navigate("/admin/cakes/new")}
          style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
        >
          Add Cake
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        >
          <option value="">All Categories</option>
          {[...new Set(cakes.map((c) => c.category))].map((cat) => (
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
          className="border border-pink-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
        />
        <select
          value={toppingFilter}
          onChange={(e) => setToppingFilter(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
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
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-pink-50">
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
                  Toppin Type
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
                    <td className="px-4 py-2">{cake.cakeName}</td>
                    <td className="px-4 py-2">{cake.cakeDescription}</td>
                    <td className="px-4 py-2">{cake.category}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(cake.prices) && cake.prices.length > 0
                        ? Math.min(...cake.prices.map((p) => p.price))
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {cake.toppingCollectionName || "-"}
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
                        <button
                          className="bg-pink-300 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-yellow-200 transition-colors focus:outline-none"
                          onClick={() =>
                            alert("Hide functionality not implemented yet.")
                          }
                          style={{
                            boxShadow: "0 2px 8px rgba(251, 191, 36, 0.10)",
                          }}
                        >
                          Hide
                        </button>
                        <button
                          className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-gray-200 transition-colors focus:outline-none"
                          onClick={() => handleRemove(cake._id)}
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
    </div>
  );
}
