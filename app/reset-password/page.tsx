"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
          newPassword: form.password
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Password reset! Redirecting...");
        setTimeout(() => router.push("/login/user"), 2000);
      } else {
        setMessage(data.error || "❌ Failed");
      }
    } catch (err) {
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        
        {message && <p className="text-center mb-4 p-2 bg-gray-100 rounded">{message}</p>}
        
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          className="w-full p-3 border rounded-lg mb-3"
          required
        />
        <input
          type="text"
          placeholder="OTP"
          value={form.otp}
          onChange={(e) => setForm({...form, otp: e.target.value})}
          className="w-full p-3 border rounded-lg mb-3"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          className="w-full p-3 border rounded-lg mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
        >
          {loading ? "Please wait..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}