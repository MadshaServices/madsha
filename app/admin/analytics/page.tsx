'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RefreshCw, Download, Calendar,
  TrendingUp, TrendingDown, Minus, Star,
  AlertCircle, CheckCircle, Clock, Users,
  MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value > 50) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header with Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tom's Learning Analytics
                </h1>
                <p className="text-sm text-gray-500">Real-time insights from user conversations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>

              <button
                onClick={fetchAnalytics}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              <button
                className="p-2 hover:bg-gray-100 rounded-xl transition"
                title="Download Report"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Conversations"
            value={stats.totalConversations}
            icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
            color="blue"
            trend={stats.totalConversations > 100 ? 'up' : 'neutral'}
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={<ThumbsUp className="w-6 h-6 text-green-600" />}
            color="green"
            trend={stats.successRate > 70 ? 'up' : stats.successRate > 50 ? 'neutral' : 'down'}
          />
          <StatCard
            title="Needs Review"
            value={stats.needsReview}
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            color="yellow"
            trend={stats.needsReview > 10 ? 'up' : 'down'}
          />
          <StatCard
            title="Unique Users"
            value={stats.uniqueUsers || 0}
            icon={<Users className="w-6 h-6 text-purple-600" />}
            color="purple"
            trend="neutral"
          />
        </div>

        {/* Top Queries with Satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Queries Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Most Asked Questions
              </h2>
              <span className="text-sm text-gray-500">
                {stats.topQueries?.length || 0} unique queries
              </span>
            </div>

            <div className="space-y-4">
              {stats.topQueries?.map((q: any, i: number) => (
                <div key={i} className="group hover:bg-gray-50 p-3 rounded-xl transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-800">"{q.query}"</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {q.count} times
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                        q.satisfaction > 70 
                          ? 'bg-green-100 text-green-700' 
                          : q.satisfaction > 50 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {getTrendIcon(q.satisfaction)}
                        {q.satisfaction}% helpful
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        q.satisfaction > 70 
                          ? 'bg-green-500' 
                          : q.satisfaction > 50 
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${q.satisfaction}%` }}
                    />
                  </div>
                </div>
              ))}

              {(!stats.topQueries || stats.topQueries.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  No queries yet. Start conversations to see data.
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Quick Insights
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-1">Average Success Rate</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-purple-700">{stats.successRate}%</p>
                  <p className="text-sm text-purple-500">
                    {stats.successRate > 70 ? 'Excellent' : stats.successRate > 50 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <p className="text-sm text-blue-600 mb-1">Conversations per Day</p>
                <p className="text-3xl font-bold text-blue-700">
                  {Math.round(stats.totalConversations / days)}
                </p>
                <p className="text-xs text-blue-500 mt-1">Last {days} days</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <p className="text-sm text-yellow-600 mb-1">Needs Your Attention</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.needsReview}</p>
                <Link 
                  href="#" 
                  className="text-xs text-yellow-600 hover:underline mt-2 inline-block"
                >
                  Review Conversations →
                </Link>
              </div>
            </div>

            {/* Daily Activity Preview */}
            {stats.dailyStats && stats.dailyStats.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {stats.dailyStats.slice(0, 5).map((day: any) => (
                    <div key={day.date} className="flex items-center gap-2 text-sm">
                      <span className="w-20 text-gray-500">{day.date}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${Math.min(day.totalConversations * 10, 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-medium">{day.totalConversations}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Topics Distribution */}
        {stats.dailyStats && stats.dailyStats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">📊 Topic Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.dailyStats[0]?.topics || {}).map(([topic, count]: [string, any]) => (
                <div key={topic} className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1 capitalize">{topic}</p>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-400">
                    {Math.round((count / stats.totalConversations) * 100)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  const trendColors: any = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`${colors[color]} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/50 rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trend]} bg-white/50 px-2 py-1 rounded-full`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {' '}vs last period
          </span>
        )}
      </div>
      <p className="text-sm opacity-75 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}