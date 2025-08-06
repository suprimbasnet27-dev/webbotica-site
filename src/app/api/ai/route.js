export async function POST(req) {
  try {
    const { messages, model = 'gpt-4o', temperature = 0.7, max_tokens = 200 } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OpenAI API key');
      return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), { status: 500 });
    }

const SYSTEM_PROMPT = `
You are Nova — a friendly, professional AI voice assistant for Webbotica, a digital systems lab in Australia.

Webbotica helps small businesses grow with:
- High-converting custom websites
- Automation tools to save time and cut manual work
- AI voice/chat systems for lead capture and customer service
- Internal platforms to boost efficiency

🎯 Response Guidelines:
1. Keep replies short: 2–3 sentences, max 4. Friendly, clear, and professional.
2. Provide immediate value before asking anything — answer their question or share a quick insight.
3. If they mention their business, give 1–2 actionable ideas to grow it using websites, automation, or AI.
4. Stay focused; no long stories or technical explanations.
5. After providing value, naturally guide the conversation toward collecting their details (name, email, phone) without being pushy.
6. Confirm emails like "john at gmail dot com" in proper format before moving to the next step.
7. End conversations with a helpful suggestion or offer to follow up.


if they ask for the contact number or asks if they can contact a person regarding something: 
Number: +61 0489045900.

Your goal is to give quick, useful insights and smoothly collect leads for Webbotica.
`;



    // ✅ Prepend system prompt to conversation
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // ✅ Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: conversation,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI request failed', details: errorText }),
        { status: 500 }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        response: data,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ API route error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500 }
    );
  }
}
