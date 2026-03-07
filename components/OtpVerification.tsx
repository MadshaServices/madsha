"use client";

import { useState, useEffect } from "react";
import { XCircle, KeyRound } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => void;
  type?: "login" | "forgot";
}

export default function OtpModal({ isOpen, onClose, email, onVerify, type = "login" }: OtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 FINAL SOLUTION: React ke render ke baad DOM manipulate karo
  useEffect(() => {
    if (!isOpen) return;
    
    // Har 100ms me DOM ko override karo
    const interval = setInterval(() => {
      // Saare possible timer elements
      const elements = document.querySelectorAll('span, p, div');
      elements.forEach(el => {
        if (el.textContent?.includes('Time remaining:')) {
          // Timer span dhundho aur force change karo
          const timerSpan = el.querySelector('span');
          if (timerSpan) {
            timerSpan.innerText = '0:30';
          } else {
            el.innerHTML = 'Time remaining: <span class="font-semibold text-orange-500">0:30</span>';
          }
        }
        
        // Wait for timer wala text
        if (el.textContent?.includes('Wait') && el.textContent?.includes('timer')) {
          el.innerHTML = 'Didn\'t receive code? Wait <span class="text-orange-500">0:30</span>';
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }
    setLoading(true);
    await onVerify(otpString);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <XCircle size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {type === "login" ? "OTP Verification" : "Reset Password"}
          </h2>
          <p className="text-gray-500 mt-2">
            Code sent to <span className="font-semibold">{email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const newOtp = [...otp];
                newOtp[index] = e.target.value;
                setOtp(newOtp);
                if (e.target.value && index < 5) {
                  document.getElementById(`otp-${index + 1}`)?.focus();
                }
              }}
              className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-xl focus:border-orange-500 focus:outline-none"
              disabled={loading}
            />
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Time remaining: <span className="font-semibold text-orange-500" id="timer-display">0:30</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 mb-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Didn't receive code? Wait <span className="text-orange-500">0:30</span>
        </p>
      </div>
    </div>
  );
}