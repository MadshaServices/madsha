// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/db-helpers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    const analytics = await getAnalytics(days);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}