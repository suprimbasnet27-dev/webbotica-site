export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ API Error:', res.status, errorText)
      return 'Sorry, I had trouble responding.'
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'Sorry, I had trouble responding.'
  } catch (error) {
    console.error('❌ Fetch Error:', error)
    return 'Sorry, I had trouble responding.'
  }
}