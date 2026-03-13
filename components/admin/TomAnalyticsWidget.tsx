'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TomAnalyticsWidget() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics?days=7');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/20 h-24 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl font-bold">{stats.totalConversations || 0}</div>
          <div className="text-xs text-blue-100">Total Conversations</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold">{stats.successRate || 0}%</div>
          <div className="text-xs text-blue-100">Success Rate</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-2xl font-bold">{stats.needsReview || 0}</div>
          <div className="text-xs text-blue-100">Need Review</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold">{stats.topQueries?.[0]?.count || 0}</div>
          <div className="text-xs text-blue-100">Top Query</div>
        </div>
      </div>

      {/* Top Queries Preview */}
      {stats.topQueries && stats.topQueries.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-yellow-400 rounded-full"></span>
            Most Asked Questions
          </h4>
          <div className="space-y-2">
            {stats.topQueries.slice(0, 3).map((q: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[200px]">"{q.query}"</span>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {q.count}x
                  </span>
                  {q.satisfaction > 0 && (
                    <span className={`text-xs ${
                      q.satisfaction > 70 ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {q.satisfaction}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}