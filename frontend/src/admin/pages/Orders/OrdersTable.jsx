import React, { useEffect, useState } from "react";
import { fetchOrders, updateOrder } from "../../../api/order";
import { useNavigate } from "react-router-dom";
import { io as ioClient } from "socket.io-client";
import OrdersFilter from "./OrdersFilter";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("sectioned"); // sectioned | requested | ongoing | actioned | all
  const [sortField, setSortField] = useState("newest");
  const [sortDir, setSortDir] = useState("asc"); // asc | desc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timePeriod, setTimePeriod] = useState("none");
  const navigate = useNavigate();

  // Format an ISO date string into Asia/Kolkata (+5:30) readable form
  function formatToIST(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchOrders();
        // Backend returns { ok: true, items: [...] } for listing.
        // Older frontend expected an array or { orders: [...] } — support both.
        if (!mounted) return;
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.items)) {
          setOrders(data.items);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError(err.message || String(err));
      }
      setLoading(false);
    }
    load();
    return () => (mounted = false);
  }, []);

  // Real-time: listen for new orders via Socket.IO
  useEffect(() => {
    // In dev, the backend runs on localhost:5000; Vite proxy doesn't forward websockets reliably,
    // so default to the backend origin unless VITE_BACKEND_URL is provided.
    const socketUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    // Use polling transport in dev to avoid transient websocket connection errors
    // (Vite proxy or local environment sometimes cause ws handshake to fail).
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    const socket = ioClient(socketUrl, {
      transports: ["polling"],
      auth: { token },
    });
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("connect_error", (err) =>
      console.warn("socket connect_error", err.message || err)
    );
    const onNew = (order) => {
      setOrders((prev) => {
        // avoid duplicates by matching _id or orderId
        const exists = prev.some(
          (p) => p._id === order._id || p.orderId === order.orderId
        );
        if (exists) return prev;
        return [order, ...prev];
      });
    };
    socket.on("new_order", onNew);
    return () => {
      socket.off("new_order", onNew);
      socket.disconnect();
    };
  }, []);

  const handleView = (o) => navigate(`/admin/orders/${o._id || o.id}`);

  const confirmOrder = async (o) => {
    try {
      const resp = await updateOrder(o._id || o.id, { status: "confirmed" });
      // Backend returns { ok: true, item: { ... } }
      const updated = resp && (resp.item || resp);
      const updatedId = updated && (updated._id || updated.id);
      if (updated) {
        setOrders((prev) =>
          prev.map((p) =>
            p._id === updatedId || p.id === updatedId ? updated : p
          )
        );
        alert("Order confirmed");
      } else {
        throw new Error("Invalid update response");
      }
    } catch (err) {
      alert("Failed to confirm order: " + (err.message || err));
    }
  };

  const rejectOrder = async (o) => {
    const ok = window.confirm(
      `Are you sure you want to reject order ${o.orderId || o._id || o.id}?`
    );
    if (!ok) return;
    try {
      const resp = await updateOrder(o._id || o.id, { status: "rejected" });
      const updated = resp && (resp.item || resp);
      const updatedId = updated && (updated._id || updated.id);
      if (updated) {
        setOrders((prev) =>
          prev.map((p) =>
            p._id === updatedId || p.id === updatedId ? updated : p
          )
        );
        alert("Order rejected");
      } else {
        throw new Error("Invalid update response");
      }
    } catch (err) {
      alert("Failed to reject order: " + (err.message || err));
    }
  };

  // no inline modal here; actions are handled on the OrderView page

  const renderRows = (list) =>
    list.map((o) => (
      <tr key={o.orderId || o._id || o.id} className="border-b last:border-b-0">
        <td className="px-4 py-2">{o.orderId || o._id || o.id}</td>
        <td className="px-4 py-2">{o.clientDetails?.name || "-"}</td>
        <td className="px-4 py-2">{o.clientDetails?.phone || "-"}</td>
        <td className="px-4 py-2">
          {formatToIST(
            o.createdAt || o.created || o.addedAt || o.orderDate || o._createdAt
          )}
        </td>
        <td className="px-4 py-2">{o.subtotal ?? "-"}</td>
        <td className="px-4 py-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              String(o.status).toLowerCase() === "confirmed"
                ? "bg-green-100 text-green-800"
                : String(o.status).toLowerCase() === "rejected"
                ? "bg-red-100 text-red-800"
                : String(o.status).toLowerCase() === "finished"
                ? "bg-blue-100 text-blue-800"
                : String(o.status).toLowerCase() === "requested"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {o.status || "-"}
          </span>
        </td>
        <td className="px-4 py-2">
          {/* If still requested, show Action button that opens the order view for actions */}
          {String(o.status || "").toLowerCase() === "requested" ? (
            <div className="flex">
              <button
                onClick={() => handleView(o)}
                className="bg-pink-400 text-white px-5 py-2 rounded-full font-semibold"
              >
                View
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => handleView(o)}
                className="bg-yellow-400 text-white px-4 py-2 rounded-full font-semibold"
              >
                Change status
              </button>
            </div>
          )}
        </td>
      </tr>
    ));

  // apply query + status filter first
  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();
  const filtered = orders.filter((o) => {
    // status filter is handled by viewMode/tabs
    if (!normalizedQuery) return true;
    // search by order id, client name or phone
    const id = String(o.orderId || o._id || o.id || "").toLowerCase();
    const name = String(o.clientDetails?.name || "").toLowerCase();
    const phone = String(o.clientDetails?.phone || "").toLowerCase();
    return (
      id.includes(normalizedQuery) ||
      name.includes(normalizedQuery) ||
      phone.includes(normalizedQuery)
    );
  });

  // apply time period filter (none | today | this_week | this_month | this_year)
  const getOrderDate = (o) => {
    const val =
      o?.createdAt || o?.addedAt || o?.orderDate || o?._createdAt || null;
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const timeFiltered = (filtered || []).filter((o) => {
    if (!timePeriod || timePeriod === "none") return true;
    const d = getOrderDate(o);
    if (!d) return false;
    const now = new Date();
    if (timePeriod === "today") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    if (timePeriod === "this_week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return d >= sevenDaysAgo && d <= now;
    }
    if (timePeriod === "this_month") {
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }
    if (timePeriod === "this_year") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // sorting helper applied to any list
  const sortList = (arr) => {
    const copy = (arr || []).slice();
    const dir = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const af = (f) => (a && a[f] != null ? a[f] : "");
      const bf = (f) => (b && b[f] != null ? b[f] : "");
      switch (sortField) {
        case "orderId":
          return (
            String(af("orderId") || af("_id") || af("id")).localeCompare(
              String(bf("orderId") || bf("_id") || bf("id"))
            ) * dir
          );
        case "subtotal":
          return (Number(a?.subtotal || 0) - Number(b?.subtotal || 0)) * dir;
        case "status":
          return (
            String(a?.status || "").localeCompare(String(b?.status || "")) * dir
          );
        case "newest":
        default:
          // try common date fields, fallback to 0
          const ad =
            new Date(
              a?.createdAt ||
                a?.addedAt ||
                a?.orderDate ||
                a?._createdAt ||
                null
            ).getTime() || 0;
          const bd =
            new Date(
              b?.createdAt ||
                b?.addedAt ||
                b?.orderDate ||
                b?._createdAt ||
                null
            ).getTime() || 0;
          return (ad - bd) * -dir; // newest first when desc
      }
    });
    return copy;
  };

  const requestedOrders = timeFiltered.filter(
    (o) => String(o.status || "").toLowerCase() === "requested"
  );
  const ongoingOrders = timeFiltered.filter(
    (o) => String(o.status || "").toLowerCase() === "confirmed"
  );
  const actionedOrders = timeFiltered.filter((o) => {
    const st = String(o.status || "").toLowerCase();
    return st !== "requested" && st !== "confirmed";
  });

  // sorted versions for each view
  const requestedSorted = sortList(requestedOrders);
  const ongoingSorted = sortList(ongoingOrders);
  const actionedSorted = sortList(actionedOrders);
  const allSorted = sortList(timeFiltered);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
        Orders
      </h2>
      <OrdersFilter
        query={query}
        onQueryChange={setQuery}
        onClear={() => {
          setQuery("");
        }}
      />
      <div className="mb-6">
        <div className="w-full overflow-x-auto">
          <div
            className="grid grid-cols-3 gap-2 px-2 sm:inline-flex sm:items-center sm:gap-2"
            role="tablist"
          >
            <button
              onClick={() => setViewMode("sectioned")}
              className={`px-4 py-2 rounded-md border text-sm font-semibold whitespace-nowrap ${
                viewMode === "sectioned"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-600"
              }`}
            >
              <span className="hidden sm:inline">Sectioned</span>
              <span className="sm:hidden">Sectioned</span>
            </button>

            <button
              onClick={() => setViewMode("requested")}
              className={`px-4 py-2 border text-sm font-semibold whitespace-nowrap ${
                viewMode === "requested"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-600"
              }`}
            >
              <span className="hidden sm:inline">
                Requested ({requestedOrders.length})
              </span>
              <span className="sm:inline hidden md:hidden">Requested</span>
              <span className="sm:hidden">Req ({requestedOrders.length})</span>
            </button>

            <button
              onClick={() => setViewMode("ongoing")}
              className={`px-4 py-2 border text-sm font-semibold whitespace-nowrap ${
                viewMode === "ongoing"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-600"
              }`}
            >
              <span className="hidden sm:inline">
                Ongoing ({ongoingOrders.length})
              </span>
              <span className="sm:hidden">Ong ({ongoingOrders.length})</span>
            </button>

            <button
              onClick={() => setViewMode("actioned")}
              className={`px-4 py-2 border text-sm font-semibold whitespace-nowrap ${
                viewMode === "actioned"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-600"
              }`}
            >
              <span className="hidden sm:inline">
                Actioned ({actionedOrders.length})
              </span>
              <span className="sm:hidden">Act ({actionedOrders.length})</span>
            </button>

            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 border text-sm font-semibold whitespace-nowrap ${
                viewMode === "all"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-600"
              }`}
            >
              <span className="hidden sm:inline">
                View All ({orders.length})
              </span>
              <span className="sm:hidden">All ({orders.length})</span>
            </button>

            {/* filter options shown above */}
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-3 justify-end flex-nowrap overflow-x-auto">
        <div className="flex flex-col items-start gap-1 w-auto">
          <label className="text-sm text-gray-600">Period</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="w-auto px-3 py-2 bg-gray-200 border rounded-md text-gray-700"
          >
            <option value="none">None</option>
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="this_year">This year</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-auto">
          <label className="text-sm text-gray-600">Sort</label>
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="w-auto px-3 py-2 bg-gray-200 border rounded-md text-gray-700"
            >
              <option value="newest">Newest</option>
              <option value="orderId">Order ID</option>
              <option value="subtotal">Subtotal</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="px-3 py-2 border rounded-md text-gray-700 bg-white"
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {viewMode === "sectioned" ? (
            <>
              <section>
                <h3 className="text-lg font-semibold text-pink-600 mb-3">
                  Requested Orders ({requestedOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                      <tr className="bg-pink-50">
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {renderRows(requestedSorted)}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-pink-600 mb-3">
                  Ongoing Orders ({ongoingOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                      <tr className="bg-pink-50">
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {renderRows(ongoingSorted)}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-pink-600 mb-3">
                  Actioned Orders ({actionedOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                      <tr className="bg-pink-50">
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {renderRows(actionedSorted)}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            // single-table modes: requested | ongoing | actioned | all
            <section>
              <h3 className="text-lg font-semibold text-pink-600 mb-3">
                {viewMode === "all"
                  ? `All Orders (${filtered.length})`
                  : viewMode === "requested"
                  ? `Requested Orders (${requestedOrders.length})`
                  : viewMode === "ongoing"
                  ? `Ongoing Orders (${ongoingOrders.length})`
                  : `Actioned Orders (${actionedOrders.length})`}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                  <thead>
                    <tr className="bg-pink-50">
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Order ID
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Subtotal
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-pink-600 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {viewMode === "all"
                      ? renderRows(allSorted)
                      : viewMode === "requested"
                      ? renderRows(requestedSorted)
                      : viewMode === "ongoing"
                      ? renderRows(ongoingSorted)
                      : renderRows(actionedSorted)}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
      {/* actions are handled on the OrderView page */}
    </div>
  );
}
