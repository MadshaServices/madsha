"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, User, Phone, KeyRound, Eye, EyeOff, ArrowLeft, ShoppingBag, Truck, Shield } from "lucide-react"

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

  // Get role-based content
  const getRoleContent = () => {
    switch(role) {
      case "user":
        return {
          title: "User Registration",
          subtitle: "Create your account to start shopping",
          features: [
            { icon: ShoppingBag, text: "Shop from local stores" },
            { icon: Truck, text: "Fast delivery" },
            { icon: Shield, text: "Secure payments" }
          ],
          bgGradient: "from-blue-500 to-purple-600"
        }
      case "rider":
        return {
          title: "Rider Registration",
          subtitle: "Join as a delivery partner",
          features: [
            { icon: Truck, text: "Flexible working hours" },
            { icon: Shield, text: "Insurance coverage" },
            { icon: ShoppingBag, text: "Earn per delivery" }
          ],
          bgGradient: "from-green-500 to-teal-600"
        }
      case "business":
        return {
          title: "Business Registration",
          subtitle: "List your products on MADSHA",
          features: [
            { icon: ShoppingBag, text: "Reach more customers" },
            { icon: Truck, text: "Easy delivery management" },
            { icon: Shield, text: "Business dashboard" }
          ],
          bgGradient: "from-orange-500 to-pink-600"
        }
    }
  }

  const content = getRoleContent();

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
      <div className="min-h-screen flex bg-gradient-to-br from-orange-50 to-pink-50">
        {/* LEFT SIDE - Branding with Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-pink-600 items-center justify-center p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-md text-white">
            <h1 className="text-5xl font-bold mb-6">Join MADSHA</h1>
            <p className="text-xl mb-8 text-white/90">
              {content.subtitle}
            </p>
            
            {/* Features List */}
            <div className="space-y-6">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-sm text-white/70">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-white/70">Local Shops</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/70">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-8 transition">
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">{content.title}</h2>
              <p className="text-gray-500 mt-2">Fill in your details to get started</p>
            </div>

            {apiMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {apiMessage.text}
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <button 
                onClick={handleSendOTP}
                disabled={loading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold transition duration-300 shadow-lg hover:shadow-xl ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p className="text-gray-600 text-sm text-center mt-6">
                Already have an account?{" "}
                <Link
                  href={`/login/${role}`}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // OTP Verification Step (same as before)
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-pink-600 items-center justify-center p-12">
        {/* Same left side content as above */}
        <div className="relative z-10 max-w-md text-white">
          <h1 className="text-5xl font-bold mb-6">Verify Your Email</h1>
          <p className="text-xl mb-8 text-white/90">
            Enter the OTP sent to your email address
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-8 transition"
          >
            <ArrowLeft size={18} />
            Back to Registration
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
            <p className="text-gray-500 text-sm mt-2">
              We've sent a code to {form.email}
            </p>
          </div>

          {apiMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center ${
              apiMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
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
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
              />
            ))}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Time remaining: <span className="font-semibold text-orange-500">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 mb-3"
          >
            {loading ? 'Verifying...' : 'Verify & Register'}
          </button>

          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-orange-500 hover:text-orange-600 transition disabled:opacity-50 text-center"
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
    </div>
  );
}