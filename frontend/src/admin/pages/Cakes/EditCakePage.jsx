import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCakeById, updateCake } from "../../../api/cake";
import ImageUploader from "../../../components/ImageUploader";
import { fetchAllToppings, fetchToppingsByRef } from "../../../api/topping";

export default function EditCakePage() {
  const [toppingOptions, setToppingOptions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCakeAndToppings() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakeById(id);
        // If cake has toppingRef, fetch that topping doc to get collectionName
        const updatedCake = { ...data };
        if (data.toppingRef) {
          try {
            const toppingDoc = await fetchToppingsByRef(data.toppingRef);
            if (toppingDoc && toppingDoc.collectionName) {
              updatedCake.toppingCategory = toppingDoc.collectionName;
            }
          } catch (e) {
            // ignore individual topping fetch errors
          }
        }
        setCake(updatedCake);
        // Fetch all topping collections for dropdown (same handling as CakesTable)
        const allToppingsDoc = await fetchAllToppings();
        let allToppings = [];
        if (allToppingsDoc && allToppingsDoc.toppings) {
          allToppings = allToppingsDoc.toppings;
        } else if (Array.isArray(allToppingsDoc)) {
          allToppings = allToppingsDoc;
        }
        const toppingCats = allToppings
          .map((t) => t.collectionName)
          .filter(Boolean);
        setToppingOptions([...new Set(toppingCats)]);
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

        <label className="font-medium text-pink-700">Category:</label>
        <input
          type="text"
          className="border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-600"
          value={cake.category}
          onChange={(e) => setCake({ ...cake, category: e.target.value })}
        />
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
          value={cake.toppingCategory || ""}
          onChange={(e) =>
            setCake({ ...cake, toppingCategory: e.target.value })
          }
        >
          <option value="">None</option>
          {toppingOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label className="font-medium text-pink-700">Image:</label>
        <ImageUploader
          value={cake.cakeImage}
          onChange={(imgData, file) => setCake({ ...cake, cakeImage: imgData })}
        />
        <label className="font-medium text-pink-700">Is Featured:</label>
        <input
          type="checkbox"
          checked={!!cake.isFeatured}
          onChange={(e) => setCake({ ...cake, isFeatured: e.target.checked })}
        />
        <label className="font-medium text-pink-700">Prices:</label>
        <div className="flex flex-col gap-2">
          {Array.isArray(cake.prices) &&
            cake.prices.map((p, idx) => (
              <div key={p._id || idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="border border-pink-300 rounded-lg px-2 py-1 w-24"
                  value={p.size}
                  onChange={(e) => {
                    const newPrices = [...cake.prices];
                    newPrices[idx].size = e.target.value;
                    setCake({ ...cake, prices: newPrices });
                  }}
                  placeholder="Size"
                />
                <input
                  type="number"
                  className="border border-pink-300 rounded-lg px-2 py-1 w-24"
                  value={p.price}
                  onChange={(e) => {
                    const newPrices = [...cake.prices];
                    newPrices[idx].price = e.target.value;
                    setCake({ ...cake, prices: newPrices });
                  }}
                  placeholder="Price"
                />
                <button
                  type="button"
                  className="text-red-500 px-2"
                  onClick={() => {
                    const newPrices = cake.prices.filter((_, i) => i !== idx);
                    setCake({ ...cake, prices: newPrices });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          <button
            type="button"
            className="bg-pink-200 text-pink-700 px-3 py-1 rounded-full font-medium mt-2"
            onClick={() =>
              setCake({
                ...cake,
                prices: [...(cake.prices || []), { size: "", price: "" }],
              })
            }
          >
            Add Price
          </button>
        </div>
        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            className="bg-pink-600 text-white px-5 py-2 rounded-full font-medium shadow hover:bg-pink-700 transition-colors"
          >
            Save
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
