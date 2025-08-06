// pages/api/classify-intent.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // ⚡ for speed if on Vercel Edge Functions

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const systemPrompt = `
You are a helpful classifier. Your job is to determine user intent based on their message.
Return ONLY one of the following:

- "affirmative" → if user is saying yes, agreeing, or expressing interest
- "negative" → if user is declining or uninterested
- "other" → for any unrelated or ambiguous messages

Examples:
"Yes please" → affirmative  
"Go ahead" → affirmative  
"Not now" → negative  
"I'm not sure" → other  
"Tell me more" → other

Message: "${message}"
Intent:
  `.trim();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
      ],
      temperature: 0.0,
      max_tokens: 10,
    }),
  });

  const data = await res.json();
  const intent = data.choices?.[0]?.message?.content?.trim().toLowerCase();

  return NextResponse.json({ intent });
}
