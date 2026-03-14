"use client";
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LocationPopup from "@/components/LocationPopup"
import { 
  Heart, ShoppingCart, User, Bike, Store, Leaf, 
  ChevronDown, Star, Truck, Clock, Search, SlidersHorizontal,
  ChevronLeft, ChevronRight, Filter, X, Tag, Percent, Flame,
  MapPin, Navigation
} from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation as SwiperNavigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import Footer from "@/components/Footer"

/* ================= STATIC DATA ================= */

const slides = [
  { id: 1, image: "/hero-wide.png", title: "Discover Local Deals Near You", desc: "Fast delivery • Trusted sellers • Best prices" },
  { id: 2, image: "/hero1.png", title: "Village Shopping Made Easy", desc: "Shop from trusted local sellers" },
  { id: 3, image: "/hero2.png", title: "Holi Special Village Offers", desc: "Celebrate with colors & savings" },
  { id: 4, image: "/hero3.png", title: "Fast Local Delivery", desc: "Smiling customers, trusted riders" },
]

const products = [
  { id: 1, name: "Skin Cream", price: 299, image: "/cream.jpg", rating: 4.5, brand: "L'Oreal", offer: "special", reviews: 128 },
  { id: 2, name: "Yellow T-Shirt", price: 799, image: "/tshirt.jpg", rating: 4.2, brand: "Nike", offer: "today", reviews: 85 },
  { id: 3, name: "Luxury Watch", price: 2499, image: "/watch.jpg", rating: 4.8, brand: "Titan", offer: "sale", reviews: 342 },
  { id: 4, name: "Classic Watch", price: 1999, image: "/watch1.jpg", rating: 4.6, brand: "Fastrack", offer: "today", reviews: 215 },
  { id: 5, name: "Stylish Cap", price: 499, image: "/cap.jpg", rating: 4.3, brand: "Puma", offer: "special", reviews: 67 },
  { id: 6, name: "Shoes", price: 1299, image: "/shoes.jpg", rating: 4.7, brand: "Adidas", offer: "sale", reviews: 456 },
  { id: 7, name: "Jeans", price: 1499, image: "/jeans.jpg", rating: 4.4, brand: "Levi's", offer: "today", reviews: 189 },
  { id: 8, name: "Sunglasses", price: 899, image: "/sunglasses.jpg", rating: 4.1, brand: "Ray-Ban", offer: "special", reviews: 93 },
  { id: 9, name: "Rice (5kg)", price: 350, image: "/rice.jpg", rating: 4.5, brand: "Local", offer: "today", reviews: 78 },
  { id: 10, name: "Fresh Vegetables", price: 120, image: "/veg.jpg", rating: 4.8, brand: "Local Farmer", offer: "special", reviews: 156 },
]

const shops = [
  { id: 1, name: "Sharma Grocery", distance: 2, image: "/shop1.jpg", offers: ["today"], rating: 4.3, local: true },
  { id: 2, name: "Nirankar Medical", distance: 4, image: "/shop2.jpg", offers: [], rating: 4.1, local: true },
  { id: 3, name: "CityMart Electronics", distance: 3, image: "/shop3.jpg", offers: ["sale"], rating: 4.5, local: true },
  { id: 4, name: "Village Bakery", distance: 1, image: "/shop4.jpg", offers: ["today"], rating: 4.7, local: true },
  { id: 5, name: "Local Mart", distance: 5, image: "/shop5.jpg", offers: ["special"], rating: 4.2, local: true },
  { id: 6, name: "Fashion Hub", distance: 6, image: "/shop6.jpg", offers: [], rating: 4.0, local: true },
  { id: 7, name: "Kisan Store", distance: 3, image: "/kisan.jpg", offers: ["today", "special"], rating: 4.9, local: true },
]

// Main Categories
const mainCategories = [
  { id: 1, name: "Fashion", slug: "fashion", icon: "👕", subcategories: ["Men's Wear", "Women's Wear", "Kids Wear"] },
  { id: 2, name: "Electronics", slug: "electronics", icon: "💻", subcategories: ["Mobiles", "Laptops", "Audio"] },
  { id: 3, name: "Home & Kitchen", slug: "home-kitchen", icon: "🏠", subcategories: ["Furniture", "Decor", "Kitchenware"] },
  { id: 4, name: "Beauty", slug: "beauty", icon: "💄", subcategories: ["Makeup", "Skincare", "Haircare"] },
  { id: 5, name: "Grocery", slug: "grocery", icon: "🛒", subcategories: ["Vegetables", "Fruits", "Staples"] },
  { id: 6, name: "Sports", slug: "sports", icon: "⚽", subcategories: ["Fitness", "Outdoor", "Equipment"] },
  { id: 7, name: "Books", slug: "books", icon: "📚", subcategories: ["Fiction", "Education", "Comics"] },
  { id: 8, name: "Toys", slug: "toys", icon: "🧸", subcategories: ["Baby Toys", "Educational", "Outdoor"] },
  { id: 9, name: "Automotive", slug: "automotive", icon: "🚗", subcategories: ["Accessories", "Spare Parts", "Tools"] },
  { id: 10, name: "Health", slug: "health", icon: "💊", subcategories: ["Medicines", "Devices", "Supplements"] },
  { id: 11, name: "Jewellery", slug: "jewellery", icon: "💎", subcategories: ["Gold", "Silver", "Imitation"] },
  { id: 12, name: "Jeans", slug: "jeans", icon: "👖", subcategories: ["Men's Jeans", "Women's Jeans", "Kids Jeans"] },
]

// Offer Types (Admin can enable/disable)
const offerConfig = {
  todayDeal: true,
  specialOffer: true,
  sale: true
}

export default function Home() {
  const router = useRouter()
  const [location, setLocation] = useState<string | null>(null)
  const [locationShort, setLocationShort] = useState<string>("")
  const [showPopup, setShowPopup] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [search, setSearch] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [wishlist] = useState<number[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Search Suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter States
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState<number>(10) // Distance filter in km
  const [showLocalOnly, setShowLocalOnly] = useState<boolean>(false)

  // Subcategories state
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null)
  const [showSubcategories, setShowSubcategories] = useState(false)

  /* ================= FILTERING ================= */

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.brand.toLowerCase())
      )
    }

    // Price filter
    filtered = filtered.filter(item => 
      item.price >= priceRange[0] && item.price <= priceRange[1]
    )

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => 
        selectedBrands.includes(item.brand)
      )
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(item => 
        selectedRatings.some(r => item.rating >= r)
      )
    }

    // Offer filter
    if (selectedOffers.length > 0) {
      filtered = filtered.filter(item => 
        selectedOffers.includes(item.offer || '')
      )
    }

    // Sorting
    switch(sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating)
      default:
        return filtered // popular
    }
  }, [search, selectedCategories, priceRange, selectedBrands, selectedRatings, selectedOffers, sortBy])

  // Filtered shops based on distance
  const filteredShops = useMemo(() => {
    let filtered = shops;
    
    // Distance filter
    filtered = filtered.filter(shop => shop.distance <= maxDistance);
    
    // Local only filter
    if (showLocalOnly) {
      filtered = filtered.filter(shop => shop.local);
    }
    
    // Rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(shop => 
        selectedRatings.some(r => shop.rating >= r)
      );
    }
    
    return filtered;
  }, [maxDistance, showLocalOnly, selectedRatings]);

  // Offer Products
  const todayDeals = useMemo(() => {
    return products.filter(p => p.offer === 'today')
  }, [])

  const specialOffers = useMemo(() => {
    return products.filter(p => p.offer === 'special')
  }, [])

  const saleItems = useMemo(() => {
    return products.filter(p => p.offer === 'sale')
  }, [])

  const nearbyShops = useMemo(() => {
    return shops.filter((shop) => shop.distance <= 5)
  }, [])

  // Get subcategories for selected main category
  const currentSubcategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    const category = mainCategories.find(c => c.slug === selectedMainCategory);
    return category?.subcategories || [];
  }, [selectedMainCategory]);

  /* ================= LOCATION & AUTH ================= */

  useEffect(() => {
    const savedLocation = localStorage.getItem("madsha_location")

    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        if (typeof parsed === "object" && parsed?.address) {
          setLocation(parsed.address)
          // Short location for display
          const parts = parsed.address.split(',')
          setLocationShort(parts.slice(0, 2).join(','))
        } else {
          setLocation(savedLocation)
          setLocationShort(savedLocation.substring(0, 30) + '...')
        }
      } catch {
        setLocation(savedLocation)
        setLocationShort(savedLocation.substring(0, 30) + '...')
      }
      setShowPopup(false)
    } else {
      setShowPopup(true)
    }

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

  // Search Suggestions
  const fetchSuggestions = (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([])
      return
    }
    
    const suggestions = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
    setSearchSuggestions(suggestions)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {showPopup && (
        <LocationPopup
          setLocation={(locData: any) => {
            localStorage.setItem("madsha_location", JSON.stringify(locData))
            setLocation(locData?.address || "")
            setLocationShort(locData?.address?.split(',').slice(0, 2).join(',') || "")
            setShowPopup(false)
          }}
          closePopup={() => setShowPopup(false)}
        />
      )}

      {/* ================= TOP NAVBAR ================= */}
      <div className="bg-gray-900 text-white relative z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            
            {/* LEFT SIDE - Logo & Location */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* LOGO */}
              <Link href="/">
                <div className="relative w-35 h-12.5 cursor-pointer flex-shrink-0">
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
                className="hidden md:flex flex-col text-xs cursor-pointer hover:text-gray-300 max-w-[200px]"
              >
                <span className="text-gray-400">Delivering to</span>
                <span className="font-semibold line-clamp-2 break-words">
                  {locationShort || "Select Location"}
                </span>
              </div>
            </div>

            {/* SEARCH SECTION */}
            <div className="flex-1 max-w-2xl mx-auto w-full">
              <div className="flex relative">
                {/* CATEGORY DROPDOWN */}
                <select className="bg-gray-100 text-black px-3 rounded-l-md outline-none text-sm border-r w-24">
                  <option>All</option>
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Groceries</option>
                  <option>Beauty</option>
                </select>

                {/* SEARCH INPUT WITH SUGGESTIONS */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search Madsha.in"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      fetchSuggestions(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => search.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2 text-black bg-white outline-none"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {searchSuggestions.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📦</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-orange-600 font-bold">₹{item.price}</p>
                              <div className="flex items-center gap-1">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-500">{item.rating}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEARCH BUTTON */}
                <button className="bg-yellow-400 hover:bg-yellow-500 px-5 rounded-r-md text-black font-semibold transition">
                  🔍
                </button>
              </div>
            </div>

            {/* RIGHT SIDE - User & Cart */}
            <div className="flex items-center gap-4 md:gap-6 text-sm flex-shrink-0">
              {/* USER PROFILE */}
              {isLoggedIn && user ? (
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md hover:bg-gray-700 transition">
                    <User className="w-4 h-4" />
                    <span className="font-semibold text-white hidden sm:inline">{user.name?.split(' ')[0] || 'User'}</span>
                  </div>
                  <div className="absolute right-0 top-full w-48 bg-white text-black rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/dashboard/user" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>My Account</span>
                    </Link>
                    <Link href="/dashboard/user/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <ShoppingCart className="w-4 h-4 text-gray-600" />
                      <span>My Orders</span>
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition w-full text-left text-red-500">
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md hover:bg-gray-700 transition">
                    <span className="font-semibold text-white">Profile</span>
                  </div>
                  <div className="absolute right-0 top-full w-48 bg-white text-black rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/register/user" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>User</span>
                    </Link>
                    <Link href="/register/rider" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <Bike className="w-4 h-4 text-gray-600" />
                      <span>Rider</span>
                    </Link>
                    <Link href="/register/business" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <Store className="w-4 h-4 text-gray-600" />
                      <span>Business</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* CART */}
              <div className="relative cursor-pointer flex items-center gap-1 hover:text-gray-300">
                <ShoppingCart className="w-6 h-6" />
                <span className="font-semibold hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CATEGORY BAR ================= */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-2">
            {/* Category Dropdown */}
            <div className="relative group hidden lg:block">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <SlidersHorizontal size={16} />
                <span>All Categories</span>
                <ChevronDown size={16} />
              </button>
              <div className="absolute left-0 top-full mt-1 w-56 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-96 overflow-y-auto">
                {mainCategories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onMouseEnter={() => {
                        setSelectedMainCategory(cat.slug);
                        setShowSubcategories(true);
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                    
                    {/* Subcategories */}
                    {showSubcategories && selectedMainCategory === cat.slug && (
                      <div className="pl-10 bg-orange-50">
                        {cat.subcategories.map((sub, idx) => (
                          <Link
                            key={idx}
                            href={`/category/${cat.slug}/${sub.toLowerCase().replace(/ /g, '-')}`}
                            className="block px-4 py-1 text-xs text-gray-600 hover:text-orange-500"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Category List */}
            <div className="flex-1 overflow-x-auto scrollbar-hide px-2">
              <div className="flex items-center gap-6">
                <Link href="/category/farmer" className="flex items-center gap-1 hover:text-yellow-200 transition whitespace-nowrap bg-green-600 px-3 py-1 rounded-full">
                  <Leaf size={14} />
                  <span>Kisan Store</span>
                </Link>
                {mainCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="hover:text-yellow-200 transition whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
              <div className="absolute inset-0 flex items-center px-10 text-white">
                <div className="max-w-lg">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-gray-200 drop-shadow">{slide.desc}</p>
                  <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition transform hover:scale-105">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Prev/Next Buttons */}
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white transition z-20 backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white transition z-20 backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ================= TODAY'S HOT DEALS WITH SLIDER ================= */}
      {offerConfig.todayDeal && todayDeals.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-4" />
                <h2 className="text-xl font-bold">Today's Hot Deals 🔥</h2>
              </div>
              <Link href="/offers/today" className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition">
                View All
              </Link>
            </div>
            
            {/* Swiper Slider for Today's Deals */}
            <Swiper
              modules={[Autoplay, SwiperNavigation]}
              spaceBetween={16}
              slidesPerView={2}
              navigation={true}
              autoplay={{ delay: 3000 }}
              breakpoints={{
                640: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
              }}
              className="today-deals-slider"
            >
              {todayDeals.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link href={`/product/${product.id}`} className="block bg-white/10 rounded-xl p-3 hover:bg-white/20 transition">
                    <div className="w-full h-28 bg-white/20 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                    <p className="font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}
                        />
                      ))}
                      <span className="text-xs text-white/80 ml-1">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-yellow-300 font-bold">₹{product.price}</p>
                      <p className="text-xs text-white/70">Save 20%</p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT WITH FILTER SIDEBAR ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex gap-6">
          
          {/* ===== LEFT SIDEBAR - FILTERS ===== */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Filter size={18} />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceRange([0, 5000])
                    setSelectedBrands([])
                    setSelectedRatings([])
                    setSelectedOffers([])
                    setMaxDistance(10)
                    setShowLocalOnly(false)
                    setSortBy('popular')
                  }}
                  className="text-xs text-orange-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* ===== DISTANCE FILTER (Local Shopping) ===== */}
              <div className="mb-5 pb-5 border-b">
                <h4 className="font-medium text-gray-700 mb-2 text-sm flex items-center gap-1">
                  <Navigation size={14} className="text-orange-500" />
                  Distance (km)
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>1 km</span>
                    <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-medium">
                      {maxDistance} km
                    </span>
                    <span>20+ km</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showLocalOnly}
                    onChange={(e) => setShowLocalOnly(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="flex items-center gap-1">
                    <Store size={14} className="text-green-500" />
                    Show only local shops
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  🏪 Support local businesses near you
                </p>
              </div>

              {/* Categories Filter */}
              <div className="mb-5 pb-5 border-b">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Categories</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {['Nike', 'Adidas', 'Puma', "Levi's", 'Titan'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat.toLowerCase()])
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat.toLowerCase()))
                          }
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-5 pb-5 border-b">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹0</span>
                    <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-medium">
                      ₹{priceRange[1]}
                    </span>
                    <span>₹5000+</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-5 pb-5 border-b">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Brand</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Nike', 'Adidas', 'Puma', "L'Oreal", 'Titan', 'Fastrack', 'Levi\'s', 'Ray-Ban'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand])
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand))
                          }
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-5 pb-5 border-b">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Customer Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRatings([...selectedRatings, rating])
                          } else {
                            setSelectedRatings(selectedRatings.filter(r => r !== rating))
                          }
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="ml-1 text-xs">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Offer Type Filter */}
              {offerConfig.todayDeal && (
                <div className="mb-5 pb-5 border-b">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">Offers</h4>
                  <div className="space-y-2">
                    {offerConfig.todayDeal && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedOffers.includes('today')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOffers([...selectedOffers, 'today'])
                            } else {
                              setSelectedOffers(selectedOffers.filter(o => o !== 'today'))
                            }
                          }}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="flex items-center gap-1">
                          <Flame size={14} className="text-orange-500" />
                          Today's Deal
                        </span>
                      </label>
                    )}
                    {offerConfig.specialOffer && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedOffers.includes('special')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOffers([...selectedOffers, 'special'])
                            } else {
                              setSelectedOffers(selectedOffers.filter(o => o !== 'special'))
                            }
                          }}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="flex items-center gap-1">
                          <Tag size={14} className="text-purple-500" />
                          Special Offer
                        </span>
                      </label>
                    )}
                    {offerConfig.sale && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedOffers.includes('sale')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOffers([...selectedOffers, 'sale'])
                            } else {
                              setSelectedOffers(selectedOffers.filter(o => o !== 'sale'))
                            }
                          }}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="flex items-center gap-1">
                          <Percent size={14} className="text-green-500" />
                          Sale
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== RIGHT SIDE - PRODUCTS ===== */}
          <div className="flex-1">
            
            {/* Sort and Result Count Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">{filteredProducts.length}</span> Products found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none text-sm font-medium focus:ring-0 bg-transparent"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((item) => (
                <div key={item.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-110 transition duration-300"
                    />
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                      <Heart size={16} className="text-gray-600 hover:text-red-500" />
                    </button>
                    {item.offer === 'today' && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame size={10} />
                        Today's Deal
                      </span>
                    )}
                    {item.offer === 'special' && (
                      <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Tag size={10} />
                        Special
                      </span>
                    )}
                    {item.offer === 'sale' && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Percent size={10} />
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400 mb-1">{item.brand}</p>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                    
                    {/* Rating with stars and review count */}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        {item.rating} ({item.reviews})
                      </span>
                    </div>
                    
                    {/* Local Shop Badge (if applicable) */}
                    {item.brand === 'Local' || item.brand === 'Local Farmer' ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Store size={10} />
                        Local Shop
                      </p>
                    ) : null}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-orange-600 font-bold text-lg">₹{item.price}</p>
                      <button
                        onClick={() => setCartCount((prev) => prev + 1)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= NEARBY SHOPS WITH DISTANCE FILTER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-orange-500" />
            Local Shops Near You
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Within {maxDistance}km</span>
            <Link href="/shops" className="text-orange-500 hover:underline text-sm">View All →</Link>
          </div>
        </div>

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
          {filteredShops.map((shop) => (
            <SwiperSlide key={shop.id}>
              <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group">
                <div className="relative w-full h-40">
                  <Image
                    src={shop.image}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                  />
                  {shop.offers.includes('today') && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Deal
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{shop.name}</h3>
                  
                  {/* Shop Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{shop.rating}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <Truck size={14} />
                    {shop.distance} km away
                  </p>
                  
                  {/* Local Shop Badge */}
                  {shop.local && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Store size={10} />
                      Local Business
                    </p>
                  )}
                  
                  <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition">
                    View Shop
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= TRENDING PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Trending Products</h2>
          <Link href="/products" className="text-orange-500 hover:underline text-sm">View All →</Link>
        </div>

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
          {products.slice(0, 8).map((item) => (
            <SwiperSlide key={item.id}>
              <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-300"
                  />
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{item.brand}</p>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-orange-600 font-bold text-lg">₹{item.price}</p>
                    <button
                      onClick={() => setCartCount((prev) => prev + 1)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* ================= FOOTER ================= */}
      <Footer />

      {/* Add custom CSS for swiper navigation */}
      <style jsx global>{`
        .today-deals-slider .swiper-button-prev,
        .today-deals-slider .swiper-button-next {
          color: white;
          background: rgba(255,255,255,0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .today-deals-slider .swiper-button-prev:after,
        .today-deals-slider .swiper-button-next:after {
          font-size: 14px;
        }
        .today-deals-slider .swiper-button-prev:hover,
        .today-deals-slider .swiper-button-next:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  )
}