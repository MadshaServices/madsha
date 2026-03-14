"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, CheckCircle, XCircle, Clock,
  UserCheck, UserX, Mail, Phone, Calendar,
  Shield, ShieldOff, MoreVertical, Search,
  Filter, Download, Eye, Ban, Trash2,
  RefreshCw, ChevronDown, Settings, Bell,
  Home, LogOut, User, Star, AlertTriangle
} from "lucide-react";
import TomAnalyticsWidget from "@/components/admin/TomAnalyticsWidget";

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0,
    riders: 0,
    businesses: 0,
    users: 0
  });

  // ✅ API URL with environment variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/login/admin');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch stats first - using API_URL
      const statsResponse = await fetch(`${API_URL}/api/admin/users/stats`);
      const statsData = await statsResponse.json();
      
      // Fetch all users - using API_URL
      const usersResponse = await fetch(`${API_URL}/api/admin/users/all`);
      const usersData = await usersResponse.json();
      
      if (statsData.success) {
        setStats({
          total: statsData.stats.total || 0,
          active: statsData.stats.approved || 0,
          pending: statsData.stats.pending || 0,
          blocked: statsData.stats.rejected || 0,
          riders: statsData.stats.riders || 0,
          businesses: statsData.stats.businesses || 0,
          users: statsData.stats.users || 0
        });
      }
      
      if (usersData.success) {
        const all = usersData.users || [];
        
        // Filter users by status
        setPendingUsers(all.filter((u: any) => u.status === 'pending'));
        setApprovedUsers(all.filter((u: any) => u.status === 'approved'));
        setRejectedUsers(all.filter((u: any) => u.status === 'rejected'));
        setAllUsers(all);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (email: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, approvedBy: admin?.email })
      });
      
      if (response.ok) {
        await fetchAllData();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (email: string, reason?: string) => {
    const rejectionReason = reason || prompt("Rejection reason:");
    if (!rejectionReason) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: rejectionReason })
      });
      
      if (response.ok) {
        await fetchAllData();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (email: string) => {
    if (!confirm("Are you sure you want to block this user?")) return;
    await handleReject(email, "Blocked by admin");
  };

  const handleUnblock = async (email: string) => {
    if (!confirm("Are you sure you want to unblock this user?")) return;
    await handleApprove(email);
  };

  // UPDATED DELETE FUNCTION
  const handleDelete = async (email: string) => {
    if (!confirm("⚠️ Are you sure you want to permanently delete this user? This action cannot be undone!")) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/delete/${email}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ User deleted successfully`);
        await fetchAllData(); // Refresh user list
        setShowUserModal(false);
      } else {
        alert(`❌ Error: ${data.error || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Failed to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch = searchTerm === "" || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: any = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200"
    };
    
    const icons: any = {
      approved: <CheckCircle size={14} className="text-green-600" />,
      pending: <Clock size={14} className="text-yellow-600" />,
      rejected: <XCircle size={14} className="text-red-600" />
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      business: "bg-blue-100 text-blue-700 border-blue-200",
      rider: "bg-green-100 text-green-700 border-green-200",
      user: "bg-gray-100 text-gray-700 border-gray-200"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MADSHA Admin
            </Link>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full relative transition">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <User size={18} />
                  <span className="font-semibold">{admin?.name?.split(' ')[0] || 'Admin'}</span>
                  <ChevronDown size={16} />
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1">
                  <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition group">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                      <Home size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Home</p>
                      <p className="text-xs text-gray-500">Back to website</p>
                    </div>
                  </Link>

                  <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition group">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition">
                      <Settings size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Settings</p>
                      <p className="text-xs text-gray-500">Admin preferences</p>
                    </div>
                  </Link>

                  {/* TOM'S ANALYTICS LINK */}
                  <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition group">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2" />
                        <circle cx="12" cy="16" r="5" />
                        <path d="m12 11 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Tom's Analytics</p>
                      <p className="text-xs text-gray-500">AI learning insights</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button 
                    onClick={() => {
                      localStorage.removeItem('admin');
                      router.push('/login/admin');
                    }}
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
        
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {admin?.name || 'Admin'}! 👋</h1>
              <p className="text-purple-100 mt-2">Manage users, approvals, and platform settings</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Shield size={40} className="text-white" />
            </div>
          </div>
        </div>

        {/* Stats Cards with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Total Users
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">All Users</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-green-600">Active: {stats.active}</span>
                <span className="text-yellow-600">Pending: {stats.pending}</span>
                <span className="text-red-600">Blocked: {stats.blocked}</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Awaiting Approval</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-purple-600">Riders: {stats.riders}</span>
                <span className="text-blue-600">Business: {stats.businesses}</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Active Users</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-gray-600">Users: {stats.users}</span>
                <span className="text-purple-600">Riders: {stats.riders}</span>
                <span className="text-blue-600">Business: {stats.businesses}</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Blocked
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Blocked Users</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
              <button className="mt-3 text-xs text-red-600 hover:underline">Manage Blocks →</button>
            </div>
          </div>
        </div>

        {/* ===== TOM'S ANALYTICS WIDGET ===== */}
        <div className="mb-8">
          <TomAnalyticsWidget />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="rider">Riders</option>
                <option value="business">Business</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={fetchAllData}
                className="p-2 border rounded-xl hover:bg-gray-50 transition"
                title="Refresh"
              >
                <RefreshCw size={20} className="text-gray-600" />
              </button>
              <button
                className="p-2 border rounded-xl hover:bg-gray-50 transition"
                title="Download CSV"
              >
                <Download size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table with Hover Effects */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-purple-600" />
              User Management
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredUsers.length} users)
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr 
                    key={user.email} 
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-purple-600 transition">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400">ID: {user._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.phone || 'No phone'}</p>
                    </td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.approvedAt ? `Approved: ${new Date(user.approvedAt).toLocaleDateString()}` : ''}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(user.email);
                              }}
                              disabled={actionLoading}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                              title="Approve"
                            >
                              <UserCheck size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(user.email);
                              }}
                              disabled={actionLoading}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <UserX size={16} />
                            </button>
                          </>
                        )}
                        {user.status === 'approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlock(user.email);
                            }}
                            disabled={actionLoading}
                            className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
                            title="Block User"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        {user.status === 'rejected' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnblock(user.email);
                            }}
                            disabled={actionLoading}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                            title="Unblock User"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.email);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-bold">{selectedUser.name}</h4>
                  <p className="text-gray-500">Member since {new Date(selectedUser.registeredAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Role</p>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>{getStatusBadge(selectedUser.status)}</div>
                </div>
              </div>

              {selectedUser.rejectionReason && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
                  <p className="text-gray-700">{selectedUser.rejectionReason}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                
                {selectedUser.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedUser.email)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Approve User'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedUser.email)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reject User'}
                    </button>
                  </>
                )}

                {selectedUser.status === 'approved' && (
                  <button
                    onClick={() => handleBlock(selectedUser.email)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Block User'}
                  </button>
                )}

                {selectedUser.status === 'rejected' && (
                  <button
                    onClick={() => handleUnblock(selectedUser.email)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Unblock User'}
                  </button>
                )}

                {/* DELETE BUTTON IN MODAL */}
                <button
                  onClick={() => handleDelete(selectedUser.email)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}