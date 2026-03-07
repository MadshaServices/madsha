"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { User, Heart, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react"

interface UserType {
  name: string
  role: "user" | "rider" | "business"
}

export default function Navbar() {

  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("madsha_user")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("madsha_user")
    window.location.reload()
  }

  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <Link href="/" className="text-xl font-bold text-yellow-400">
        MADSHA
      </Link>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* NORMAL BUTTONS */}
        <Link href="/wishlist">
          <Heart className="w-5 h-5 cursor-pointer hover:text-yellow-400" />
        </Link>

        <Link href="/cart">
          <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-yellow-400" />
        </Link>

        {/* USER DROPDOWN */}
        <div className="relative group">

          <div className="flex items-center gap-2 cursor-pointer">
            <User className="w-5 h-5" />
            <span>{user ? user.name : "Profile"}</span>
          </div>

          {/* DROPDOWN */}
          <div className="absolute right-0 mt-3 w-48 bg-white text-black rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">

            {/* USER DASHBOARD */}
            {user?.role === "user" && (
              <Link
                href="/dashboard/user"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <LayoutDashboard size={18} />
                My Account
              </Link>
            )}

            {/* RIDER DASHBOARD */}
            {user?.role === "rider" && (
              <Link
                href="/dashboard/rider"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <LayoutDashboard size={18} />
                Rider Dashboard
              </Link>
            )}

            {/* BUSINESS DASHBOARD */}
            {user?.role === "business" && (
              <Link
                href="/dashboard/business"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <LayoutDashboard size={18} />
                Business Dashboard
              </Link>
            )}

            {/* WISHLIST */}
            {user?.role === "user" && (
              <Link
                href="/wishlist"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <Heart size={18} />
                Wishlist
              </Link>
            )}

            {/* CART */}
            {user?.role === "user" && (
              <Link
                href="/cart"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <ShoppingCart size={18} />
                Cart
              </Link>
            )}

            {/* LOGOUT */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-gray-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}

            {/* LOGIN OPTIONS */}
            {!user && (
              <>
                <Link
                  href="/login/user"
                  className="block px-4 py-3 hover:bg-gray-100"
                >
                  User Login
                </Link>

                <Link
                  href="/login/rider"
                  className="block px-4 py-3 hover:bg-gray-100"
                >
                  Rider Login
                </Link>

                <Link
                  href="/login/business"
                  className="block px-4 py-3 hover:bg-gray-100"
                >
                  Business Login
                </Link>
              </>
            )}

          </div>
        </div>

      </div>
    </nav>
  )
}