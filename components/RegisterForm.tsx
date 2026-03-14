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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false
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
          subtitle: "Create an account",
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

    if (!form.firstName.trim()) newErrors.firstName = "First name is required"
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!form.email.includes("@")) newErrors.email = "Valid email required"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"
    if (form.phone.length < 10) newErrors.phone = "Valid 10-digit phone required"
    if (form.password.length < 6) newErrors.password = "Password must be 6+ characters"
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!form.terms) newErrors.terms = "You must agree to Terms & Conditions"

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
          name: `${form.firstName} ${form.lastName}`,
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
      console.error("Registration error:", error);
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
        {/* LEFT SIDE - Branding with Features (1st image style) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-pink-600 items-center justify-center p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-md text-white">
            {/* Logo or Brand */}
            <h1 className="text-5xl font-bold mb-4">MADSHA</h1>
            <p className="text-xl mb-12 text-white/90">
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

        {/* RIGHT SIDE - Registration Form (1st image style form) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Back to Home */}
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-8 transition">
              <ArrowLeft size={18} />
              Back to website →
            </Link>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">{content.title}</h2>
            </div>

            {apiMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {apiMessage.text}
              </div>
            )}

            <div className="space-y-4">
              {/* First Name & Last Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    disabled={loading}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    disabled={loading}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition pr-12"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition pr-12"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <Link href="/terms-and-conditions" className="text-orange-500 hover:underline">Terms & Conditions</Link>
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}

              {/* Create Account Button */}
              <button 
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Create account'}
              </button>

              {/* Already have account link */}
              <p className="text-gray-600 text-sm text-center mt-6">
                Already have an account?{" "}
                <Link
                  href={`/login/${role}`}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>

              {/* Or register with - Social Login Options */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span className="text-sm text-gray-600">Apple</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // OTP Verification Step
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-pink-600 items-center justify-center p-12">
        <div className="relative z-10 max-w-md text-white">
          <h1 className="text-5xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-xl mb-8 text-white/90">
            Enter the OTP sent to your email address
          </p>
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
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 mb-3"
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