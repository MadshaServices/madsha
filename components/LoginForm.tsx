"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Unlock, Mail, Eye, EyeOff } from "lucide-react";
import OtpModal from "./OtpVerification";

export default function LoginPage({ role = "user" }: { role?: string }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otpType, setOtpType] = useState<"login" | "forgot">("login");
  const [unlocked, setUnlocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/login/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUnlocked(true);
        setSuccess(true);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userEmail", data.user.email);

        setTimeout(() => {
          if (role === "user") router.push("/");
          else if (role === "rider") router.push("/dashboard/rider");
          else if (role === "business") router.push("/dashboard/business");
          else router.push("/");
        }, 1500);
      } else {
        setError(data.error || "Invalid email or password");
        setUnlocked(false);
      }
    } catch (error) {
      setError("Failed to connect to server");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter email first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setOtpType("login");
        setOtpModal(true);
        setError("");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    // Directly redirect to forgot password page
    router.push(`/forgot-password?email=${encodeURIComponent(email)}`);
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        setOtpModal(false);
        if (otpType === "login") {
          // For OTP login, we need to auto-login or show success
          alert("OTP verified! Please login with password.");
        } else {
          // For forgot password, redirect to reset page
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }
      } else {
        throw new Error(data.error || "Invalid OTP");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="w-[1100px] h-[600px] bg-white/10 backdrop-blur-lg rounded-2xl flex shadow-2xl overflow-hidden">
          {/* LEFT SIDE */}
          <div className="w-1/2 text-white p-16 flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-6">Welcome !</h1>
            <p className="text-lg opacity-90 mb-8">
              Login to access your {role} dashboard. 
              Secure OTP verification available.
            </p>
            <Link 
              href="/forgot-password"
              className="border w-fit px-6 py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-1/2 flex items-center justify-center">
            <div className={`w-[350px] p-8 rounded-xl bg-white/20 backdrop-blur-lg shadow-xl transition ${
              success ? "shadow-green-400/80" : ""
            }`}>
              {/* LOCK ICON */}
              <div className="flex justify-center mb-6">
                {unlocked ? (
                  <Unlock size={50} className="text-green-400 animate-bounce" />
                ) : (
                  <Lock size={50} className="text-yellow-400" />
                )}
              </div>

              <h2 className="text-white text-2xl text-center mb-6 font-semibold capitalize">
                {role} Login
              </h2>

              {error && (
                <div className="mb-4 p-2 bg-red-500/80 text-white text-sm rounded text-center">
                  {error}
                </div>
              )}

              <input
                type="email"
                placeholder="Enter Email"
                className="w-full p-3 rounded-md mb-4 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 rounded-md outline-none pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-between text-sm text-white mb-5">
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="mr-1" />
                  Remember me
                </label>

                <button
                  onClick={handleForgotPassword}
                  className="hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* OTP Login Option */}
              <div className="mt-4">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border border-white/30 text-white py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <Mail size={18} />
                  Login with OTP
                </button>
              </div>

              <p className="text-white text-sm text-center mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push(`/register/${role}`)}
                  className="text-orange-200 hover:underline"
                >
                  Register here
                </button>
              </p>

              <div className="mt-4 text-center">
                <Link 
                  href="/" 
                  className="text-white/70 text-sm hover:text-white transition"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={otpModal}
        onClose={() => setOtpModal(false)}
        email={email}
        onVerify={handleVerifyOTP}
        type={otpType}
      />
    </>
  );
}