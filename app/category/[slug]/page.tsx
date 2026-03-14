'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, Star, Truck, Clock, Leaf, Store, ArrowLeft,
  SlidersHorizontal, ChevronDown, Filter, X, Search,
  MapPin, Navigation, Home, Package
} from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [showLocalOnly, setShowLocalOnly] = useState<boolean>(false);

  // ✅ API URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://madsha-backend.onrender.com';

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📁 Fetching category:', slug);
      console.log('🔗 API URL:', API_URL);
      
      // ✅ Fetch main category
      const catRes = await fetch(`${API_URL}/api/categories/${slug}`);
      
      if (!catRes.ok) {
        throw new Error(`Category not found ${catRes.status}`);
      }
      
      const catData = await catRes.json();
      console.log('✅ Category data:', catData);
      setCategory(catData.category);

      // ✅ Fetch all categories for sidebar
      const allRes = await fetch(`${API_URL}/api/categories/hierarchy`);
      if (allRes.ok) {
        const allData = await allRes.json();
        console.log('✅ All categories:', allData.categories?.length || 0);
        setAllCategories(allData.categories || []);
      }

      // ✅ Fetch subcategories using slug (not _id)
      if (catData.category?.slug) {
        console.log('🔍 Fetching subcategories for:', catData.category.slug);
        const subRes = await fetch(`${API_URL}/api/categories?parent=${catData.category.slug}`);
        
        if (subRes.ok) {
          const subData = await subRes.json();
          console.log('✅ Subcategories found:', subData.categories?.length || 0);
          setSubCategories(subData.categories || []);
        } else {
          console.log('⚠️ No subcategories found');
          setSubCategories([]);
        }
      }

      // ✅ If farmer category, fetch farmer products
      if (slug === 'farmer') {
        const prodRes = await fetch(`${API_URL}/api/farmer/products`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
      }

    } catch (error) {
      console.error('❌ Error:', error);
      setError(error instanceof Error ? error.message : 'Category not found');
    } finally {
      setLoading(false);
    }
  };

  // Sort Products
  const getSortedProducts = () => {
    let sorted = [...products];
    switch(sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted; // popular
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The category you're looking for doesn't exist."}</p>
          <Link 
            href="/" 
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* TOP - ADD BANNER */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium animate-pulse">
            🎉 Special Offer: Get 20% off on first order! Use code: MADSHA20 🎉
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-orange-500 flex items-center gap-1">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/categories" className="hover:text-orange-500">Categories</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">{category.name}</span>
        </div>

        {/* Category Banner */}
        {slug === 'farmer' ? (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-green-600 to-green-800">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-between px-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">🌾 Kisan Store</h1>
                <p className="text-green-100">Fresh from farms • Direct from farmers • No middleman</p>
              </div>
              <div className="text-8xl opacity-30">🌱</div>
            </div>
          </div>
        ) : (
          <div className="relative h-40 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-orange-500 to-pink-500">
            <div className="absolute inset-0 flex items-center px-8">
              <h1 className="text-3xl font-bold text-white">
                {category.icon || '📦'} {category.name}
              </h1>
            </div>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            <SlidersHorizontal size={18} />
            <span>Filter & Sort</span>
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white px-4 py-2 rounded-lg shadow-sm border-none"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* MAIN CONTENT - LEFT & RIGHT */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ===== LEFT SIDEBAR - FILTERS ===== */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              
              {/* Categories List */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Store size={18} />
                  Categories
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/category/farmer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      slug === 'farmer' 
                        ? 'bg-green-100 text-green-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Leaf size={16} className={slug === 'farmer' ? 'text-green-600' : 'text-gray-400'} />
                    <span>Kisan Store</span>
                    <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Fresh</span>
                  </Link>
                  
                  {allCategories.map((cat) => (
                    <div key={cat._id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          cat.slug === slug 
                            ? 'bg-orange-100 text-orange-600 font-medium' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span>{cat.icon || '📦'}</span>
                        <span className="flex-1">{cat.name}</span>
                        {cat.subCategories?.length > 0 && (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                      </Link>
                      
                      {/* Subcategories under current category */}
                      {cat.slug === slug && subCategories.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-orange-200 pl-2">
                          {subCategories.map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/category/${sub.slug}`}
                              className="block px-3 py-1.5 text-xs text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded"
                            >
                              {sub.icon} {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance Filter (Local Shopping) */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Navigation size={16} className="text-orange-500" />
                  Distance (km)
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
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
              </div>

              {/* Filter by Price */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-medium">
                      ₹{priceRange[1]}
                    </span>
                    <span>₹10000+</span>
                  </div>
                </div>
              </div>

              {/* Filter by Brand */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">Brand</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Levis', 'Ray-Ban', 'Titan'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter by Rating */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRatings([...selectedRatings, rating]);
                          } else {
                            setSelectedRatings(selectedRatings.filter(r => r !== rating));
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

              {/* Sort Options */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 10000]);
                  setSelectedBrands([]);
                  setSelectedRatings([]);
                  setMaxDistance(10);
                  setShowLocalOnly(false);
                  setSortBy('popular');
                }}
                className="w-full mt-6 text-center text-sm text-orange-500 hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* ===== RIGHT SIDE - PRODUCTS GRID ===== */}
          <div className="flex-1">
            
            {/* Desktop Sort Bar */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <span className="font-medium text-gray-800">{products.length}</span> Products found in {category.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none text-sm font-medium focus:ring-0 bg-transparent"
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Subcategories Grid */}
            {subCategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-orange-500">📁</span>
                  Shop by {category.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {subCategories.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/category/${sub.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 text-center border border-gray-100"
                    >
                      <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                        <span className="text-2xl">{sub.icon || '📦'}</span>
                      </div>
                      <h3 className="font-medium text-gray-800 group-hover:text-orange-600 text-sm">
                        {sub.name}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getSortedProducts().length > 0 ? (
                getSortedProducts().map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-3 group">
                    <div className="relative h-28 mb-2 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="object-cover w-full h-full group-hover:scale-110 transition"
                        />
                      ) : (
                        <span className="text-3xl">{product.image || '📦'}</span>
                      )}
                      {product.organic && (
                        <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Organic
                        </span>
                      )}
                      {product.offer === 'today' && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          🔥 Deal
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-[10px] text-gray-500 ml-1">{product.rating || 4.0}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-orange-600 font-bold text-sm">₹{product.price}</p>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs transition">
                        Add
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No products found in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X size={20} />
                </button>
              </div>
              {/* Mobile mein bhi same filters */}
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}