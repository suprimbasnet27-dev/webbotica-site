import { supabase } from './supabase' // adjust path as needed

export async function saveConversation({ name, email, phone, business, goal, messages }) {
  const { data, error } = await supabase.from('conversations').insert([
    {
      name,
      email,
      phone,       // ✅ phone number included
      business,
      goal,
      messages,    // ✅ stored as JSONB
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function saveLead({ name, email, businessType, conversationHistory }) {
  const { data, error } = await supabase.from('leads').insert([
    {
      name,
      email,
      business_type: businessType,
      conversation_data: conversationHistory, // stored as JSONB
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }

  console.log('Lead saved successfully:', data);
  return { success: true, data };
}

// Helper function to extract lead data from conversation history
export function extractLeadFromConversation(conversationHistory) {
  let name = '';
  let email = '';
  let businessType = '';

  conversationHistory.forEach((message, index) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract business type (first question Nova asks)
    if (lowerMessage.includes('what kind of business do you run') && index + 1 < conversationHistory.length) {
      const nextMessage = conversationHistory[index + 1];
      if (nextMessage.startsWith('User:')) {
        businessType = nextMessage.replace('User:', '').trim();
      }
    }
    
    // Extract name - check for multiple variations
    if ((lowerMessage.includes('can i get your name') || 
         lowerMessage.includes('what\'s your name') ||
         lowerMessage.includes('may i have your name')) && 
         index + 1 < conversationHistory.length) {
      const nextMessage = conversationHistory[index + 1];
      if (nextMessage.startsWith('User:')) {
        name = nextMessage.replace('User:', '').trim();
      }
    }
    
    // Extract email (look for confirmation messages)
    if (lowerMessage.includes('just to confirm, that\'s') || 
        lowerMessage.includes('that\'s ') ||
        lowerMessage.includes('confirm')) {
      const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        email = emailMatch[1];
      }
    }
  });

  return { name, email, businessType };
}

// Helper function to clean email from speech
export function cleanEmailFromSpeech(speechText) {
  return speechText
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/\bat\b/g, '@') // Replace "at" with @
    .replace(/\bdot\b/g, '.') // Replace "dot" with .
    .replace(/[-_]/g, '') // Remove dashes/underscores
    .trim();
}

// Additional helper to validate email format
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}