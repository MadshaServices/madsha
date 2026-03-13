"use client";
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LocationPopup from "@/components/LocationPopup"
import { Heart, ShoppingCart, User, Bike, Store } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import Footer from "@/components/Footer";  // ✅ Footer import

/* ================= STATIC DATA ================= */

const slides = [
  { id: 1, image: "/hero-wide.png", title: "Discover Local Deals Near You", desc: "Fast delivery • Trusted sellers • Best prices" },
  { id: 2, image: "/hero1.png", title: "Village Shopping Made Easy", desc: "Shop from trusted local sellers" },
  { id: 3, image: "/hero2.png", title: "Holi Special Village Offers", desc: "Celebrate with colors & savings" },
  { id: 4, image: "/hero3.png", title: "Fast Local Delivery", desc: "Smiling customers, trusted riders" },
]

const products = [
  { id: 1, name: "Skin Cream", price: 299, image: "/cream.jpg" },
  { id: 2, name: "Yellow T-Shirt", price: 799, image: "/tshirt.jpg" },
  { id: 3, name: "Luxury Watch", price: 2499, image: "/watch.jpg" },
  { id: 4, name: "Classic Watch", price: 1999, image: "/watch1.jpg" },
  { id: 5, name: "Stylish Cap", price: 499, image: "/cap.jpg" },
  { id: 6, name: "Shoes", price: 1299, image: "/shoes.jpg" },
]

const shops = [
  { id: 1, name: "Sharma Grocery", distance: 2, image: "/shop1.jpg" },
  { id: 2, name: "Nirankar Medical", distance: 4, image: "/shop2.jpg" },
  { id: 3, name: "CityMart Electronics", distance: 3, image: "/shop3.jpg" },
  { id: 4, name: "Village Bakery", distance: 1, image: "/shop4.jpg" },
  { id: 5, name: "Local Mart", distance: 5, image: "/shop5.jpg" },
  { id: 6, name: "Fashion Hub", distance: 6, image: "/shop6.jpg" },
]

export default function Home() {
  const router = useRouter()
  const [location, setLocation] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [search, setSearch] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [wishlist] = useState<number[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  /* ================= FILTERING ================= */

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const suggestions = useMemo(() => {
    if (!search) return []
    return products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const nearbyShops = useMemo(() => {
    return shops.filter((shop) => shop.distance <= 5)
  }, [])

  /* ================= LOCATION & AUTH ================= */

  useEffect(() => {
    const savedLocation = localStorage.getItem("madsha_location")

    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        if (typeof parsed === "object" && parsed?.address) {
          setLocation(parsed.address)
        } else {
          setLocation(savedLocation)
        }
      } catch {
        setLocation(savedLocation)
      }
      setShowPopup(false)
    } else {
      setShowPopup(true)
    }

    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        setIsLoggedIn(true)
      } catch (e) {
        console.error('Error parsing user data', e)
      }
    }

    setIsMounted(true)
  }, [])

  /* ================= HERO AUTO SLIDE ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">

      {showPopup && (
        <LocationPopup
          setLocation={(locData: any) => {
            localStorage.setItem("madsha_location", JSON.stringify(locData))
            setLocation(locData?.address || "")
            setShowPopup(false)
          }}
          closePopup={() => setShowPopup(false)}
        />
      )}

      {/* ================= STYLE NAVBAR ================= */}

<div className="w-full">

  {/* TOP NAVBAR */}
  <div className="bg-gray-900 text-white relative z-50">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-6 w-full md:w-auto">

        {/* LOGO */}
        <Link href="/">
          <div className="relative w-[140px] h-[50px] cursor-pointer">
            <Image
              src="/logo.png"
              alt="Madsha Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* LOCATION */}
        <div
          onClick={() => setShowPopup(true)}
          className="hidden md:flex flex-col text-xs cursor-pointer hover:text-gray-300"
        >
          <span className="text-gray-400">Delivering to</span>
          <span className="font-semibold">
            {location || "Select Location"}
          </span>
        </div>
      </div>

      {/* SEARCH SECTION */}
<div className="flex w-full md:flex-1 max-w-3xl">

  {/* CATEGORY DROPDOWN */}
  <select className="bg-gray-100 text-black px-3 rounded-l-md outline-none text-sm border-r">
    <option>All</option>
    <option>Fashion</option>
    <option>Electronics</option>
    <option>Groceries</option>
    <option>Beauty</option>
  </select>

  {/* SEARCH INPUT */}
  <input
    type="text"
    placeholder="Search Madsha.in"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="flex-1 px-4 py-2 text-black bg-white outline-none"
  />

  {/* SEARCH BUTTON */}
  <button className="bg-yellow-400 hover:bg-yellow-500 px-5 rounded-r-md text-black font-semibold transition">
    🔍
  </button>

</div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6 text-sm">

        {/* ========== USER PROFILE / LOGIN SECTION ========== */}
        {isLoggedIn && user ? (
          <div className="relative group cursor-pointer z-50">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition">
              <User className="w-4 h-4" />
              <span className="font-semibold text-white">{user.name?.split(' ')[0] || 'User'}</span>
            </div>

            {/* DROPDOWN MENU */}
            <div className="absolute right-0 top-full w-48 bg-white text-black rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              
              {/* My Account Link */}
              <Link
                href="/dashboard/user"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span>My Account</span>
              </Link>

              {/* My Orders Link */}
              <Link
                href="/dashboard/user/orders"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                <span>My Orders</span>
              </Link>

              {/* Divider */}
              <hr className="my-1" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition w-full text-left text-red-500"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group cursor-pointer z-50">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition">
              <span className="font-semibold text-white">Profile</span>
            </div>

            {/* REGISTRATION DROPDOWN */}
            <div className="absolute right-0 top-full w-52 bg-white text-black rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link
                href="/register/user"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span>User Registration</span>
              </Link>

              <Link
                href="/register/rider"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <Bike className="w-4 h-4 text-gray-600" />
                <span>Rider Registration</span>
              </Link>

              <Link
                href="/register/business"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <Store className="w-4 h-4 text-gray-600" />
                <span>Business Registration</span>
              </Link>
            </div>
          </div>
        )}

        {/* ORDERS */}
        <div className="hidden md:flex flex-col cursor-pointer hover:text-gray-300">
          <span className="text-gray-400">Returns</span>
          <span className="font-semibold">& Orders</span>
        </div>

        {/* CART */}
        <div className="relative cursor-pointer flex items-center gap-1 hover:text-gray-300">
          <ShoppingCart className="w-6 h-6" />
          <span className="font-semibold">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-1.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>

      </div>
    </div>
  </div>

  {/* BOTTOM CATEGORY BAR */}
  <div className="bg-gray-600 text-white text-sm">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex gap-6 overflow-x-auto">
      <span className="cursor-pointer hover:underline">Fresh</span>
      <span className="cursor-pointer hover:underline">Mobiles</span>
      <span className="cursor-pointer hover:underline">Fashion</span>
      <span className="cursor-pointer hover:underline">Electronics</span>
      <span className="cursor-pointer hover:underline">Home & Kitchen</span>
      <span className="cursor-pointer hover:underline">Today's Deals</span>
      <span className="cursor-pointer hover:underline">New Arrivals</span>
    </div>
  </div>

</div>

      {/* ================= HERO ================= */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="relative w-full aspect-[21/7] rounded-3xl overflow-hidden shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute inset-0 flex items-center px-10 text-white">
                <div>
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                    {slide.title}
                  </h2>
                  <p>{slide.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= NEARBY SHOPS ================= */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <h2 className="text-3xl font-extrabold mb-10">
          Shops Near You (Within 5km)
        </h2>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={5}
          autoplay={{ delay: 2500 }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 5 },
          }}
        >
          {nearbyShops.map((shop) => (
            <SwiperSlide key={shop.id}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden">
                <div className="relative w-full h-40">
                  <Image
                    src={shop.image}
                    alt={shop.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{shop.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {shop.distance} km away
                  </p>
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm w-full">
                    View Shop
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= TRENDING PRODUCTS ================= */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 mt-16">
        <h2 className="text-3xl font-extrabold mb-10">
          Trending Products
        </h2>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={5}
          autoplay={{ delay: 2000 }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 5 },
          }}
        >
          {filteredProducts.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="object-cover w-full h-40"
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="text-blue-600 font-bold mt-2 text-sm">
                    ₹{item.price}
                  </p>
                  <button
                    onClick={() => setCartCount((prev) => prev + 1)}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* ================= FOOTER ================= */}
      <Footer />  {/* ✅ Footer component yahan call ho raha hai */}
    </div>
  )
}