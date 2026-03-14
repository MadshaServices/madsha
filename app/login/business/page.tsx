'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ADD THIS LINE
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login/business');
      return;
    }

    const parsed = JSON.parse(userData);
    setUser(parsed);
    fetchDashboardData(parsed.email);
  }, []);

  const fetchDashboardData = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/business/${email}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component
}