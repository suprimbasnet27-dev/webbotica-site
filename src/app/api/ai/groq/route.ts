import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, tone, platform, mode } = await req.json();

    // Validate required fields
    if (!message || !tone || !platform || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: message, tone, platform, mode' },
        { status: 400 }
      );
    }

    // Map platforms to their contexts
    const platformContexts: Record<string, string> = {
      email: 'email communication, include proper email formatting like greetings and sign-offs',
      facebook: 'Facebook post, keep it engaging and social media appropriate',
      instagram: 'Instagram post, keep it engaging with appropriate hashtags and casual tone',
      linkedin: 'LinkedIn post, maintain professional networking etiquette and business focus',
      messenger: 'Facebook Messenger chat, keep it conversational and appropriate for instant messaging',
      whatsapp: 'WhatsApp message, keep it conversational and appropriate for instant messaging'
    };

    const platformContext = platformContexts[platform] || 'general communication';

    // Build prompt based on mode
    let prompt: string;
    if (mode === 'transform') {
      prompt = `Transform the following message to be ${tone} in tone and optimized for ${platform}:

Platform context: This is for ${platformContext}.

Original message: "${message}"

Rewrite this message to match the ${tone} tone while being perfectly suited for ${platform}. Keep the core meaning but transform the style, formality, and formatting appropriately. Be concise and natural.

IMPORTANT: Return ONLY the transformed message. Do not include any introductory phrases like "Here is..." or "The message is..." or explanations. Just return the pure message content.`;
    } else if (mode === 'reply') {
      prompt = `Generate an appropriate reply to the following message. The reply should be ${tone} in tone and optimized for ${platform}:

Platform context: This is for ${platformContext}.

Message to reply to: "${message}"

Generate a ${tone} reply that would be appropriate for ${platform}. Make it natural, contextually relevant, and engaging while matching the requested tone. Be concise and authentic.

IMPORTANT: Return ONLY the reply message. Do not include any introductory phrases like "Here is a reply..." or "My response is..." or explanations. Just return the pure reply content.`;
    } else {
      return NextResponse.json({ error: 'Invalid mode. Use "transform" or "reply"' }, { status: 400 });
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert communication assistant. Transform messages to match specific tones and platforms while maintaining the original meaning. Be natural, authentic, and concise. Always return ONLY the requested message content without any introductory phrases, explanations, or meta-commentary. Your response should be the pure message that can be directly used.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json(
        { error: 'Groq API Error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid Groq response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from Groq API' },
        { status: 500 }
      );
    }

    // Clean up the response content to remove any unwanted prefixes
    let content = data.choices[0].message.content.trim();
    
    // Remove common unwanted prefixes that AI might add despite instructions
    const unwantedPrefixes = [
      'Here is the transformed message:',
      'Here is the reply:',
      'Here\'s the transformed message:',
      'Here\'s the reply:',
      'The transformed message is:',
      'The reply is:',
      'My response:',
      'My reply:',
      'Response:',
      'Reply:',
      'Transformed message:',
      'Here is:',
      'Here\'s:'
    ];
    
    for (const prefix of unwantedPrefixes) {
      if (content.toLowerCase().startsWith(prefix.toLowerCase())) {
        content = content.substring(prefix.length).trim();
        break;
      }
    }

    // Return the cleaned response
    return NextResponse.json({
      ...data,
      choices: [
        {
          ...data.choices[0],
          message: {
            ...data.choices[0].message,
            content: content
          }
        }
      ]
    });

  } catch (error) {
    console.error('Backend error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}