"use client"

import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // LocalStorage se user data hatao
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    // Login page pe bhejo
    router.push('/login/user')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700"
    >
      Logout
    </button>
  )
}