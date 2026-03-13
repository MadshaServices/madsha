"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, Instagram, Twitter, Linkedin, 
  Mail, Phone, MapPin, Clock, Heart, 
  Headphones, MessageCircle, Shield, Zap 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: MADSHA Brand */}
          <div className="space-y-4">
            <div className="relative w-[140px] h-[50px]">
              <Image
                src="/logo.png"
                alt="MADSHA Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              MADSHA connects you with trusted local shops near you. Fast delivery, genuine products and the best local deals — all in one place.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white text-sm transition">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition">About Us</Link></li>
              <li><Link href="/our-promise" className="text-gray-400 hover:text-white text-sm transition">Our Promise</Link></li>
              <li><Link href="/why-madsha" className="text-gray-400 hover:text-white text-sm transition">Why MADSHA</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-gray-400 hover:text-white text-sm transition">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="text-gray-400 hover:text-white text-sm transition">Refund Policy</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white text-sm transition">Shipping Policy</Link></li>
              <li><Link href="/cancellation-policy" className="text-gray-400 hover:text-white text-sm transition">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Get in Touch (Clickable Card) */}
          <div>
            <Link href="/support" className="block group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Get in Touch</h3>
                    <p className="text-xs text-gray-400">Click for support</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">
                  Need help? Our support team is available 24/7 to assist you with any questions.
                </p>
                
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  <span>Chat with Tom</span>
                  <Zap size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-800 mt-10 pt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Trusted by</span>
            <span className="text-white font-semibold">10,000+ customers</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Shield size={12} className="text-green-500" />
              Secure & Encrypted
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Zap size={12} className="text-blue-500" />
              Instant Response
            </span>
          </div>
        </div>

        {/* Bottom Bar - Copyright Only (Middle) */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-gray-500 text-center">
              © Copyright {currentYear} | All Rights Reserved by MADSHA
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> in India
            </p>
          </div>
        </div>

        {/* Admin Login Link - Hidden but Accessible (Bottom Right) */}
        <div className="text-right mt-4">
          <Link 
            href="/login/admin" 
            className="text-[10px] text-gray-800 hover:text-gray-600 transition px-2 py-1 rounded hover:bg-gray-800/30 inline-block"
            title="Admin Login"
          >
            ⚡ Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}