"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, Store, Package, LogOut, User, 
  ShoppingBag, TrendingUp, DollarSign, 
  Clock, CheckCircle, XCircle, Edit, 
  Eye, MoreVertical, Star, PlusCircle,
  BarChart3, Users, Settings, Bell
} from "lucide-react";

export default function BusinessDashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    todayOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        router.push("/login/user");
        return;
      }

      try {
        const parsed = JSON.parse(userData);
        
        // Check if role is business
        if (parsed.role !== "business") {
          router.push("/");
          return;
        }
        
        setBusiness(parsed);

        // Fetch real data from backend
        const response = await fetch(`${API_URL}/api/dashboard/business/${parsed.email}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setTopProducts(data.topProducts);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Stats data with real values
  const statsCards = [
    { 
      title: "Total Products", 
      value: stats.totalProducts?.toString() || "0", 
      icon: Package, 
      color: "from-blue-500 to-blue-600", 
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: "In stock"
    },
    { 
      title: "Today's Orders", 
      value: stats.todayOrders?.toString() || "0", 
      icon: ShoppingBag, 
      color: "from-green-500 to-green-600", 
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: "+3 new"
    },
    { 
      title: "Pending Orders", 
      value: stats.pendingOrders?.toString() || "0", 
      icon: Clock, 
      color: "from-yellow-500 to-yellow-600", 
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: "Need attention"
    },
    { 
      title: "Today's Revenue", 
      value: formatCurrency(stats.revenue || 0), 
      icon: DollarSign, 
      color: "from-purple-500 to-purple-600", 
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: "Today's earnings"
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    let colorClass = "";
    
    if (statusLower.includes("deliver")) {
      colorClass = "bg-green-100 text-green-700 border-green-200";
    } else if (statusLower.includes("process")) {
      colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (statusLower.includes("ship")) {
      colorClass = "bg-blue-100 text-blue-700 border-blue-200";
    } else if (statusLower.includes("pending")) {
      colorClass = "bg-orange-100 text-orange-700 border-orange-200";
    } else {
      colorClass = "bg-gray-100 text-gray-700 border-gray-200";
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo with gradient */}
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              MADSHA
            </Link>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              
              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-full relative transition">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <User size={18} />
                  <span className="font-semibold">
                    {business?.name?.split(' ')[0] || 'Business'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1">
                  
                  {/* Home Option */}
                  <Link 
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition group"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition">
                      <Home size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Home</p>
                      <p className="text-xs text-gray-500">Back to website</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Dashboard */}
                  <Link 
                    href="/dashboard/business"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition group"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                      <Store size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Dashboard</p>
                      <p className="text-xs text-gray-500">Business overview</p>
                    </div>
                  </Link>

                  {/* Settings */}
                  <Link 
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition group"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition">
                      <Settings size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Settings</p>
                      <p className="text-xs text-gray-500">Store preferences</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout */}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition w-full text-left group"
                  >
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                      <LogOut size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Logout</p>
                      <p className="text-xs text-gray-500">End session</p>
                    </div>
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Welcome Header with Gradient */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {business?.name || 'Business Owner'}! 👋</h1>
              <p className="text-orange-100 mt-2">Here's what's happening with your store today</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Store size={40} className="text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <div className={`w-12 h-1 bg-gradient-to-r ${stat.color} rounded-full group-hover:w-16 transition-all duration-300`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></span>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <Link 
            href="/" 
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Home size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-orange-600 transition">Back to Home</h3>
                  <p className="text-sm text-gray-500">Return to main website</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-orange-500 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </Link>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition">Manage Products</h3>
                  <p className="text-sm text-gray-500">Add, edit or remove products</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-blue-500 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-purple-600 transition">View Orders</h3>
                  <p className="text-sm text-gray-500">Check customer orders</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-purple-500 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></span>
                  Recent Orders
                </h2>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                  View All <span>→</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any, index: number) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition group">
                        <td className="py-4 text-sm font-medium text-gray-800">{order.id}</td>
                        <td className="py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order.customer}</p>
                            <p className="text-xs text-gray-400">{order.items || 1} items</p>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">{order.product}</td>
                        <td className="py-4 text-sm font-semibold text-gray-800">
                          {typeof order.amount === 'number' ? formatCurrency(order.amount) : order.amount}
                        </td>
                        <td className="py-4">{getStatusBadge(order.status)}</td>
                        <td className="py-4">
                          <button className="text-gray-400 hover:text-orange-500 transition group-hover:translate-x-1">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></span>
                  Top Products
                </h2>
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-orange-500 transition">
                        {product.name}
                      </p>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {product.trend || "+12%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-400">{product.sales || 0} units sold</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {typeof product.revenue === 'number' ? formatCurrency(product.revenue) : product.revenue}
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-pink-500 h-1.5 rounded-full"
                        style={{ width: `${((product.sales || 30) / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:border-orange-300 transition flex items-center justify-center gap-2">
                <BarChart3 size={16} />
                View Full Analytics
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}