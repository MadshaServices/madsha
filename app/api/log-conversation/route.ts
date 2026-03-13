// app/api/log-conversation/route.ts
import { NextResponse } from 'next/server';
import { saveConversation, trackUser } from '@/lib/db-helpers';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const sessionId = req.headers.get('x-session-id') || data.sessionId || 'unknown';
    
    // Track unique user
    await trackUser(sessionId);
    
    // Save conversation
    await saveConversation({
      sessionId,
      userMessage: data.userMessage,
      botResponse: data.botResponse,
      topic: data.topic,
      page: data.page
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logging API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}