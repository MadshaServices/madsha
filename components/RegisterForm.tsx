"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, KeyRound } from "lucide-react"
import OtpVerification from "./OtpVerification";

type Props = {
  role: "user" | "rider" | "business"
}

export default function RegisterForm({ role }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "otp">("form")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  // 🔥 FIX 1: Changed from 600 to 30 seconds
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds
  const [canResend, setCanResend] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const validate = () => {
    const newErrors: any = {}

    if (!form.name) newErrors.name = "Name is required"
    if (!form.email.includes("@")) newErrors.email = "Valid email required"
    if (form.phone.length < 10) newErrors.phone = "Valid phone required"
    if (form.password.length < 6)
      newErrors.password = "Password must be 6+ characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!validate()) return

    setLoading(true)
    setApiMessage(null)

    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      })

      const data = await response.json()

      if (data.success) {
        setStep("otp")
        // 🔥 FIX 2: Reset timer to 30 seconds
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
      const verifyResponse = await fetch("http://localhost:5000/api/verify-otp", {
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
      const registerResponse = await fetch(`http://localhost:5000/api/register/${role}`, {
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
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      })

      const data = await response.json()

      if (data.success) {
        // 🔥 FIX 3: Reset timer to 30 seconds on resend
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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    // 🔥 FIX: Better formatting for seconds less than 60
    if (seconds < 60) {
      return `0:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Registration Form
  if (step === "form") {
    return (
      <div className="relative w-[380px]">
        <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow blur-sm opacity-80"></div>

        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white transition duration-500 hover:scale-105 hover:shadow-blue-500/40">

          <h2 className="text-2xl font-bold mb-6 text-center capitalize">
            {role} Registration
          </h2>

          {apiMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center ${
              apiMessage.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
            } text-white`}>
              {apiMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
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
              <button
                onClick={() => router.push(`/login/${role}`)}
                className="text-orange-200 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // OTP Verification Step
  return (
    <div className="relative w-[380px]">
      <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow blur-sm opacity-80"></div>

      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white">

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Verify OTP</h2>
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
  )
}