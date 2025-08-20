import React, { useState, useEffect } from "react";
import { fetchCakes, updateCake, deleteCake } from "../../api/cake";
// import "./dashboard.css";

const stats = [
  { label: "Total Orders", value: 1200 },
  { label: "Total Users", value: 350 },
  { label: "Products", value: 48 },
  { label: "Promotions", value: 6 },
];

const quickLinks = [
  { label: "Manage Cakes", to: "/admin/cakes" },
  { label: "Manage Accessories", to: "/admin/accessories" },
  { label: "Manage Toppings", to: "/admin/toppings" },
  { label: "View Orders", to: "/admin/orders" },
  { label: "Users", to: "/admin/users" },
];

export default function Dashboard() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editCake, setEditCake] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadCakes() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakes();
        setCakes(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakes();
  }, []);

  const handleEdit = (cake) => {
    setEditCake(cake);
    setEditModalOpen(true);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-lg">
            Welcome to Sweet Heaven Admin Panel
          </p>
        </section>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-pink-600 mb-1">
                {stat.value}
              </h2>
              <span className="text-gray-500 text-base">{stat.label}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
