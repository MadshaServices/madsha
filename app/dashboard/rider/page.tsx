"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Bike, Package, LogOut, User, Clock, CheckCircle } from "lucide-react";

export default function RiderDashboard() {
  const router = useRouter();
  const [rider, setRider] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completed: 0,
    inTransit: 0,
    pending: 0
  });
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        router.push("/login/user");
        return;
      }

      try {
        const parsed = JSON.parse(userData);
        setRider(parsed);

        // Fetch real data from backend
        const response = await fetch(`${API_URL}/api/dashboard/rider/${parsed.email}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setDeliveries(data.deliveries);
        }
      } catch (error) {
        console.error("Error:", error);
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

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="text-green-500" size={18} />;
      case 'pending': return <Clock className="text-yellow-500" size={18} />;
      default: return <Bike className="text-blue-500" size={18} />;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              MADSHA
            </Link>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <User size={18} />
                  <span className="font-semibold">{rider?.name?.split(' ')[0] || 'Rider'}</span>
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition group">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Home size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Home</p>
                      <p className="text-xs text-gray-500">Back to website</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/dashboard/rider" className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition group">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bike size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Dashboard</p>
                      <p className="text-xs text-gray-500">Rider overview</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition w-full text-left group">
                    <div className="p-2 bg-red-100 rounded-lg">
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
        
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {rider?.name || 'Rider'}! 🚴</h1>
              <p className="text-orange-100 mt-2">Here's your delivery schedule for today</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Bike size={40} className="text-white" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Today's Deliveries", value: stats.totalDeliveries, icon: Package, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
            { title: "Completed", value: stats.completed, icon: CheckCircle, color: "from-green-500 to-green-600", bgColor: "bg-green-50", textColor: "text-green-600" },
            { title: "In Transit", value: stats.inTransit, icon: Bike, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600" },
            { title: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-50", textColor: "text-yellow-600" }
          ].map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
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
          <Link href="/" className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                  <Home size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Back to Home</h3>
                  <p className="text-sm text-gray-500">Return to main website</p>
                </div>
              </div>
            </div>
          </Link>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                  <Bike size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Start Delivery</h3>
                  <p className="text-sm text-gray-500">Begin your route</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Delivery History</h3>
                  <p className="text-sm text-gray-500">View past deliveries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Deliveries Table */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></span>
            Today's Deliveries
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="py-3 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="py-3 text-xs font-semibold text-gray-400 uppercase">Address</th>
                  <th className="py-3 text-xs font-semibold text-gray-400 uppercase">Time</th>
                  <th className="py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="py-3 text-xs font-semibold text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery: any, index: number) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-4 text-sm font-medium text-gray-800">{delivery.customer}</td>
                    <td className="py-4 text-sm text-gray-600">{delivery.address}</td>
                    <td className="py-4 text-sm text-gray-600">{delivery.time}</td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusIcon(delivery.status)}
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-orange-500 hover:text-orange-600 transition">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}