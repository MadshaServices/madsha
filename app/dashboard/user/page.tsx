"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlist: 0,
    addresses: 0
  })
  const [loading, setLoading] = useState(true)

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    router.push('/login/user')
  }

  // Fetch user data on page load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // LocalStorage se user email le
        const userEmail = localStorage.getItem('userEmail')
        const storedUser = localStorage.getItem('user')
        
        if (!userEmail) {
          router.push('/login/user') // Email nahi hai to login page
          return
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Backend se profile fetch kar
        const response = await fetch(`http://localhost:5000/api/user/profile?email=${userEmail}`)
        const data = await response.json()

        if (data.success) {
          setUser(data.user)
          setStats(data.stats || { totalOrders: 0, wishlist: 5, addresses: 2 })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-8 text-orange-500">
          MADSHA
        </h2>

        {/* User Info in Sidebar */}
        {user && (
          <div className="mb-6 p-3 bg-orange-50 rounded-lg">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.phone}</p>
          </div>
        )}

        <ul className="space-y-4">
          <li>
            <Link href="/dashboard/user" className="hover:text-orange-500 font-medium">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/user/orders" className="hover:text-orange-500">
              My Orders
            </Link>
          </li>
          <li>
            <Link href="/dashboard/user/wishlist" className="hover:text-orange-500">
              Wishlist
            </Link>
          </li>
          <li>
            <Link href="/dashboard/user/addresses" className="hover:text-orange-500">
              Addresses
            </Link>
          </li>
          <li>
            <Link href="/dashboard/user/profile" className="hover:text-orange-500">
              Profile
            </Link>
          </li>
          <li>
            <button 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mb-8">
          Here's what's happening with your account
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">Wishlist</h3>
            <p className="text-2xl font-bold">{stats.wishlist}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">Saved Addresses</h3>
            <p className="text-2xl font-bold">{stats.addresses}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Recent Orders
          </h2>
          
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Product</th>
                <th>Status</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Smart Watch</td>
                <td className="text-green-600">Delivered</td>
                <td>₹1,999</td>
                <td>
                  <button className="text-blue-500 hover:underline">
                    View
                  </button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Shoes</td>
                <td className="text-yellow-600">Shipped</td>
                <td>₹1,299</td>
                <td>
                  <button className="text-blue-500 hover:underline">
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3">Headphones</td>
                <td className="text-blue-600">Processing</td>
                <td>₹899</td>
                <td>
                  <button className="text-blue-500 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}