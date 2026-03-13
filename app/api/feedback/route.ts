// app/api/feedback/route.ts
import { NextResponse } from 'next/server';
import { saveFeedback } from '@/lib/db-helpers';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    await saveFeedback({
      conversationId: data.conversationId,
      messageId: data.messageId,
      helpful: data.helpful,
      comment: data.comment
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}