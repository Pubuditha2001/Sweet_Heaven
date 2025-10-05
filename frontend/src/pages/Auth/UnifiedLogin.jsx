import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createApiUrl } from "../../utils/apiConfig";
import "./auth.css";

export default function UnifiedLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // decide mode: admin if ?admin=1 or path includes /admin/login
  const params = new URLSearchParams(location.search);
  const isAdmin =
    params.get("admin") === "1" || location.pathname.includes("/admin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(createApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (isAdmin) {
        if (!data.user || !data.user.isAdmin)
          throw new Error("Not an admin account");
        localStorage.setItem("adminToken", data.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      if (onLogin) onLogin(data.user);
      // redirect back where applicable
      const next = params.get("next") || (isAdmin ? "/admin" : "/");
      navigate(next);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isAdmin ? "Admin Login" : "Login"}</h2>
        <input
          className="bg-gray-100 border border-gray-300 rounded p-2 mb-4 w-full"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="bg-gray-100 border border-gray-300 rounded p-2 mb-4 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
}
