"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Phone, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react"
import OtpVerification from "./OtpVerification";

type Props = {
  role: "user" | "rider" | "business"
}

export default function RegisterForm({ role }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "otp">("form")
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const validate = () => {
    const newErrors: any = {}

    if (!form.name.trim()) newErrors.name = "Name is required"
    if (!form.email.includes("@")) newErrors.email = "Valid email required"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"
    if (form.phone.length < 10) newErrors.phone = "Valid 10-digit phone required"
    if (form.password.length < 6) newErrors.password = "Password must be 6+ characters"
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!validate()) return

    setLoading(true)
    setApiMessage(null)

    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      })

      const data = await response.json()

      if (data.success) {
        setStep("otp")
        setTimeLeft(30)
        setCanResend(false)
        setApiMessage({
          type: 'success',
          text: `OTP sent to ${form.email}`
        })
        
        // Start timer
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setApiMessage({
          type: 'error',
          text: data.error || "Failed to send OTP"
        })
      }
    } catch (error) {
      setApiMessage({
        type: 'error',
        text: 'Failed to connect to server'
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Register
  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setApiMessage({
        type: 'error',
        text: 'Please enter complete OTP'
      })
      return
    }

    setLoading(true)
    setApiMessage(null)

    try {
      // First verify OTP
      const verifyResponse = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpString })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setApiMessage({
          type: 'error',
          text: verifyData.error || "Invalid OTP"
        })
        return
      }

      // OTP verified, now register
      const registerResponse = await fetch(`${API_URL}/api/register/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }),
      })

      const registerData = await registerResponse.json()

      if (registerResponse.ok && registerData.success) {
        setApiMessage({
          type: 'success',
          text: `✅ ${role} registration successful! Redirecting to login...`
        })
        
        setTimeout(() => {
          router.push(`/login/${role}`)
        }, 2000)
      } else {
        setApiMessage({
          type: 'error',
          text: registerData.error || 'Registration failed'
        })
      }
    } catch (error) {
      setApiMessage({
        type: 'error',
        text: '❌ Failed to connect to server'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      })

      const data = await response.json()

      if (data.success) {
        setTimeLeft(30)
        setCanResend(false)
        setApiMessage({
          type: 'success',
          text: 'OTP resent successfully'
        })
      }
    } catch (error) {
      setApiMessage({
        type: 'error',
        text: 'Failed to resend OTP'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const secs = seconds % 60
    return `0:${secs.toString().padStart(2, "0")}`
  }

  // Registration Form
  if (step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 p-4">
        <div className="w-[420px] bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white capitalize">
              {role} Registration
            </h2>
          </div>

          {apiMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center ${
              apiMessage.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
            } text-white`}>
              {apiMessage.text}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-white/50" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-white/50" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-white/50" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
              {errors.phone && <p className="text-red-300 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-white/50" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-white/50 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button 
              onClick={handleSendOTP}
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold transition duration-300 shadow-lg hover:shadow-blue-500/50 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-blue-500'
              }`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className="text-white text-sm text-center mt-4">
              Already have an account?{" "}
              <Link
                href={`/login/${role}`}
                className="text-orange-200 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // OTP Verification Step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 p-4">
      <div className="w-[400px] bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">

        {/* Back Button to Form */}
        <button
          onClick={() => setStep("form")}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft size={18} />
          Back to Registration
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
          <p className="text-gray-300 text-sm mt-2">
            We've sent a code to {form.email}
          </p>
        </div>

        {apiMessage && (
          <div className={`mb-4 p-3 rounded-xl text-center ${
            apiMessage.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
          } text-white`}>
            {apiMessage.text}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-12 text-center text-xl font-semibold bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          ))}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-300">
            Time remaining: <span className="font-semibold text-blue-400">{formatTime(timeLeft)}</span>
          </p>
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.join("").length !== 6}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 mb-3"
        >
          {loading ? 'Verifying...' : 'Verify & Register'}
        </button>

        {canResend ? (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full text-blue-300 hover:text-white transition disabled:opacity-50"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-center text-sm text-gray-400">
            Didn't receive code? Wait {formatTime(timeLeft)}
          </p>
        )}
      </div>
    </div>
  );
}