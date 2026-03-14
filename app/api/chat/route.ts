// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('🚀 ===== CHAT API CALLED =====');
  
  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' }, 
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not found');
      return NextResponse.json(
        { error: 'API key not configured' }, 
        { status: 500 }
      );
    }

    // 📌 SYSTEM PROMPT
    const systemPrompt = `You are Tom, an AI support assistant for MADSHA website.

ABOUT MADSHA:
- MADSHA is an e-commerce platform connecting local shops with customers
- Services: Online shopping, local delivery, multi-vendor marketplace
- Features: User registration, rider registration, business registration

YOUR ROLE:
- Only answer questions related to MADSHA website
- Be friendly, helpful, and concise
- Use Hinglish if user asks in Hindi
- Always use the correct name: MADSHA

IMPORTANT RULES:
- Never answer questions outside MADSHA scope
- Keep responses under 3-4 sentences
- Use emojis occasionally 😊`;

    // Format messages for Gemini API
    const contents = [
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    console.log('📤 Sending to Gemini...');

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Gemini API error',
          message: 'Sorry, I encountered an error. Please try again.'
        }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    
    // Extract message from Gemini response
    let assistantMessage = 'Sorry, I could not generate a response.';
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      assistantMessage = data.candidates[0].content.parts[0].text;
    }

    return NextResponse.json({ 
      message: assistantMessage,
      role: 'assistant'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { 
        error: 'Error processing request',
        message: 'Sorry, I encountered an error. Please try again. 🙏'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Chat API is working!',
    status: 'online',
    website: 'MADSHA',
    timestamp: new Date().toISOString()
  });
}