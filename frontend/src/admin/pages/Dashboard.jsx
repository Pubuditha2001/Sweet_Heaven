import React, { useState, useEffect, useRef } from "react";
import { fetchCakes, updateCake, deleteCake } from "../../api/cake";
import { fetchAccessories } from "../../api/accessory";
import { fetchAllToppings } from "../../api/topping";
import { fetchOrders } from "../../api/order";
import { useNavigate } from "react-router-dom";
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
  const [cakesCount, setCakesCount] = useState(0);
  const [accessoriesCount, setAccessoriesCount] = useState(0);
  const [toppingsCount, setToppingsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [ongoingOrdersCount, setOngoingOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [uniqueUsersCount, setUniqueUsersCount] = useState(0);
  const ordersSetRef = useRef(new Set());
  const usersSetRef = useRef(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCakes() {
      setLoading(true);
      setError("");
      try {
        const [cakesData, accessoriesData, toppingsData, ordersData] =
          await Promise.all([
            fetchCakes(),
            fetchAccessories(),
            fetchAllToppings(),
            fetchOrders(),
          ]);

        const cakesList = Array.isArray(cakesData) ? cakesData : [];
        setCakes(cakesList);
        setCakesCount(cakesList.length);

        setAccessoriesCount(
          Array.isArray(accessoriesData) ? accessoriesData.length : 0
        );
        setToppingsCount(Array.isArray(toppingsData) ? toppingsData.length : 0);

        // Orders can come in multiple shapes: array, { items: [...] }, { orders: [...] }
        let ordersList = [];
        if (Array.isArray(ordersData)) ordersList = ordersData;
        else if (ordersData && Array.isArray(ordersData.items))
          ordersList = ordersData.items;
        else if (ordersData && Array.isArray(ordersData.orders))
          ordersList = ordersData.orders;
        else ordersList = [];

        setOrdersCount(ordersList.length);

        // Ongoing = confirmed, Completed = completed, New Requests = requested
        const ongoing = ordersList.filter(
          (o) => (o.status || "").toString().toLowerCase() === "confirmed"
        );
        const completed = ordersList.filter((o) => {
          const s = (o.status || "").toString().toLowerCase();
          return s === "completed" || s === "finished";
        });
        const newRequests = ordersList.filter(
          (o) => (o.status || "").toString().toLowerCase() === "requested"
        );
        setOngoingOrdersCount(ongoing.length);
        setCompletedOrdersCount(completed.length);
        setNewRequestsCount(newRequests.length);

        const uniqueUsers = new Set(
          ordersList.map(
            (o) =>
              (o.user && (o.user.email || o.user._id)) ||
              o.userId ||
              o.clientDetails?.email ||
              o.clientDetails?.phone ||
              o.user
          )
        );
        setUniqueUsersCount(uniqueUsers.size);
        // Seed dedupe sets so real-time socket events don't double-count
        try {
          ordersSetRef.current = new Set(
            ordersList.map((o) => o._id || o.id || o.orderId).filter(Boolean)
          );
          usersSetRef.current = new Set(
            ordersList
              .map(
                (o) =>
                  (o.user && (o.user.email || o.user._id)) ||
                  o.userId ||
                  o.clientDetails?.email ||
                  o.clientDetails?.phone ||
                  o.user
              )
              .filter(Boolean)
          );
        } catch (e) {
          // defensive: if anything unexpected in orders shape, skip seeding
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakes();
  }, []);

  // Real-time updates: listen for new orders and update counts
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    // lazy-load socket.io-client to avoid failing in environments without it
    let socket;
    try {
      // eslint-disable-next-line no-undef
      const { io: ioClient } = require("socket.io-client");
      socket = ioClient(socketUrl, {
        transports: ["polling"],
        auth: { token },
      });
      socket.on("new_order", (order) => {
        // avoid duplicates
        const id = order._id || order.id || order.orderId;
        if (!id) return;
        if (ordersSetRef.current.has(id)) return;
        ordersSetRef.current.add(id);
        setOrdersCount((n) => n + 1);
        // update counts by status
        const s = (order.status || "").toString().toLowerCase();
        if (s === "confirmed") {
          setOngoingOrdersCount((n) => n + 1);
        } else if (s === "completed" || s === "finished") {
          setCompletedOrdersCount((n) => n + 1);
        } else if (s === "requested") {
          setNewRequestsCount((n) => n + 1);
        }
        // update unique users
        const userKey =
          (order.user && (order.user.email || order.user._id)) ||
          order.userId ||
          order.clientDetails?.email ||
          order.clientDetails?.phone ||
          order.user;
        if (userKey && !usersSetRef.current.has(userKey)) {
          usersSetRef.current.add(userKey);
          setUniqueUsersCount((n) => n + 1);
        }
      });
    } catch (e) {
      // socket not available or require failed; ignore real-time
    }
    return () => {
      try {
        socket && socket.disconnect();
      } catch (e) {}
    };
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

        <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-8">
          {/* Card */}
          <div
            role="button"
            tabIndex={0}
            aria-label="New Requests"
            onClick={() => navigate("/admin/orders?view=requested")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate("/admin/orders?view=requested")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-yellow-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-600 mb-1 sm:mb-2">
              {loading ? "..." : newRequestsCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              New Requests
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Confirmed orders (ongoing)"
            onClick={() => navigate("/admin/orders?view=confirmed")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate("/admin/orders?view=confirmed")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-pink-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 mb-1 sm:mb-2">
              {loading ? "..." : ongoingOrdersCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Confirmed (Ongoing)
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Completed orders"
            onClick={() => navigate("/admin/orders?view=completed")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate("/admin/orders?view=completed")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-green-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-green-600 mb-1 sm:mb-2">
              {loading ? "..." : completedOrdersCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Completed Orders
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Total orders"
            onClick={() => navigate("/admin/orders")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && navigate("/admin/orders")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-pink-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 mb-1 sm:mb-2">
              {loading ? "..." : ordersCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Total Orders
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Cakes"
            onClick={() => navigate("/admin/cakes")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && navigate("/admin/cakes")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-pink-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 mb-1 sm:mb-2">
              {loading ? "..." : cakesCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Cakes
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Toppings"
            onClick={() => navigate("/admin/toppings")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate("/admin/toppings")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-indigo-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1 sm:mb-2">
              {loading ? "..." : toppingsCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Toppings
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Accessories"
            onClick={() => navigate("/admin/accessories")}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate("/admin/accessories")
            }
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center border-t-4 border-pink-400 hover:scale-102 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 mb-1 sm:mb-2">
              {loading ? "..." : accessoriesCount}
            </h2>
            <span className="text-gray-500 text-sm sm:text-base font-semibold">
              Accessories
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
