"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("admin", JSON.stringify(data.admin));
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Secret Admin Access</p>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </div>
    </div>
  );
}