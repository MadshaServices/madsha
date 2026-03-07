"use client"

import { useState } from "react"

export default function LocationPopup({ setLocation, closePopup }: any) {
  const [loading, setLoading] = useState(false)

  const getExactLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )

          const data = await response.json()

          const address = data.display_name

          const locationData = {
            lat,
            lng,
            address,
          }

          // Send full object back to Home page
          setLocation(locationData)
        } catch (error) {
          alert("Failed to fetch address")
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        alert("Location permission denied")
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
      }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 text-center shadow-xl">

        <h2 className="text-lg font-bold mb-4">
          Allow Location Access
        </h2>

        <button
          onClick={getExactLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
        >
          {loading ? "Detecting Location..." : "Use My Current Location"}
        </button>

        <button
          onClick={closePopup}
          className="mt-3 text-gray-500 text-sm"
        >
          Cancel
        </button>

      </div>
    </div>
  )
}