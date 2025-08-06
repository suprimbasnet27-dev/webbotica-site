import { useState, useRef, useEffect, useCallback } from 'react';
import { saveConversation } from '../lib/saveConversation';




export function useVoiceAI() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    business: '',
    need: '',
    interestLevel: 0, // Track engagement level
    conversationCount: 0 // Track number of exchanges
  });

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const hasSavedRef = useRef(false);
  const shouldAutoListenRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        handleSpeech(result);
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      recognitionRef.current?.abort();
      synthesisRef.current?.cancel();
    };
  }, []);

  // Get AI response function
  const getAIResponse = async (userMessage) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: userMessage } // ✅ Correct role
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) throw new Error('AI API error');

    const data = await response.json();

    // ✅ Your backend wraps OpenAI response in { success: true, response: data }
    const aiContent = data?.response?.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('Unexpected AI response:', data);
      return 'Sorry, I had trouble responding.';
    }

    return aiContent;
  } catch (error) {
    console.error('AI API Error:', error);
    return 'Sorry, I had trouble responding.';
  }
};


  // Enhanced conversational data extraction
  const extractConversationalData = (message, currentLeadData) => {
    const text = message.toLowerCase().trim();
    const newLeadData = { ...currentLeadData };
    
    console.log('🎯 EXTRACTING CONVERSATIONAL DATA');
    console.log('🎯 Message:', message);
    console.log('🎯 Current leadData:', currentLeadData);
    
    // Extract name if mentioned - ONLY with explicit name patterns
    if (!newLeadData.name) {
      const namePatterns = [
        /(?:my name is|i'm|it's|call me|name's|i am)\s+([a-z\s]{2,30})/i,
        /(?:this is|hello,? i'?m)\s+([a-z\s]{2,30})/i,
        /(?:i go by|you can call me)\s+([a-z\s]{2,30})/i
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = text.match(pattern);
        if (nameMatch && nameMatch[1]) {
          const extractedName = nameMatch[1].trim();
          
          // Additional validation for names
          const words = extractedName.split(/\s+/);
          
          // Skip if it's too long or contains business/non-name words
          const businessWords = ['business', 'company', 'travel', 'marketing', 'shop', 'store', 'about', 'going', 'doing', 'working', 'looking'];
          const containsBusinessWords = words.some(word => 
            businessWords.includes(word.toLowerCase()) || word.length > 15
          );
          
          if (!containsBusinessWords && words.length <= 3 && extractedName.length <= 30) {
            const cleanName = extractedName
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            
            if (/^[a-zA-Z\s]+$/.test(cleanName)) {
              newLeadData.name = cleanName;
              console.log('✅ NAME EXTRACTED:', cleanName);
              break;
            }
          }
        }
      }
    }
    
    // Extract phone if mentioned
    if (!newLeadData.phone) {
      const phonePatterns = [
        /(\+?61\s?4\d{2}\s?\d{3}\s?\d{3})/,
        /(\+?61\s?[2-8]\s?\d{4}\s?\d{4})/,
        /(04\d{2}\s?\d{3}\s?\d{3})/,
        /(0[2-8]\s?\d{4}\s?\d{4})/,
        /(\d{4}\s?\d{3}\s?\d{3})/,
        /(\d{10})/,
        /(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/,
        /(\+?\d{8,15})/
      ];
      
      for (const pattern of phonePatterns) {
        const phoneMatch = message.match(pattern);
        if (phoneMatch && phoneMatch[1]) {
          let cleanPhone = phoneMatch[1].replace(/\s+/g, ' ').trim();
          const digitCount = cleanPhone.replace(/\D/g, '').length;
          if (digitCount >= 8 && digitCount <= 15) {
            newLeadData.phone = cleanPhone;
            console.log('✅ PHONE EXTRACTED:', cleanPhone);
            break;
          }
        }
      }
    }
    
    // Extract business information
    const businessKeywords = [
      'business', 'company', 'startup', 'shop', 'store', 'restaurant', 'clinic', 'practice',
      'agency', 'consultancy', 'firm', 'service', 'brand', 'venture', 'enterprise'
    ];
    
    for (const keyword of businessKeywords) {
      if (text.includes(keyword) && !newLeadData.business) {
        // Try to extract business type from context
        const sentences = message.split(/[.!?]/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(keyword)) {
            newLeadData.business = sentence.trim();
            console.log('✅ BUSINESS INFO EXTRACTED:', sentence.trim());
            break;
          }
        }
        break;
      }
    }
    
    // Extract needs/pain points
    const needKeywords = [
      'need', 'want', 'looking for', 'require', 'help with', 'struggling with',
      'problem', 'issue', 'challenge', 'improve', 'better', 'more customers',
      'website', 'automation', 'leads', 'sales'
    ];
    
    for (const keyword of needKeywords) {
      if (text.includes(keyword) && !newLeadData.need) {
        newLeadData.need = message.trim();
        console.log('✅ NEED/PAIN POINT EXTRACTED:', message.trim());
        break;
      }
    }
    
    // Assess interest level based on keywords
    const interestKeywords = [
      'interested', 'sounds good', 'tell me more', 'how much', 'when can we start',
      'sign me up', 'let\'s do it', 'that would help', 'perfect', 'exactly what I need',
      'how do I get started', 'what\'s the next step', 'can you help', 'free'
    ];
    
    for (const keyword of interestKeywords) {
      if (text.includes(keyword)) {
        newLeadData.interestLevel = Math.min(10, newLeadData.interestLevel + 2);
        console.log('✅ INTEREST LEVEL INCREASED to:', newLeadData.interestLevel);
        break;
      }
    }
    
    // Increment conversation count
    newLeadData.conversationCount = newLeadData.conversationCount + 1;
    
    console.log('🎯 FINAL EXTRACTED DATA:', newLeadData);
    return newLeadData;
  };

  // Check if we should ask for contact details
  const shouldAskForContact = (leadData, conversationHistory) => {
    const hasName = leadData.name && leadData.name.length > 0;
    const hasPhone = leadData.phone && leadData.phone.length > 0;
    const hasInterest = leadData.interestLevel >= 4;
    const hasConversations = leadData.conversationCount >= 3;
    
    // Don't ask if we already have both name and phone
    if (hasName && hasPhone) return false;
    
    // Ask if they show high interest
    if (hasInterest && !hasPhone) return true;
    
    // Ask after several conversations if we don't have phone
    if (hasConversations && !hasPhone) return true;
    
    return false;
  };

  const handleSpeech = async (speech) => {
    if (isProcessing) {
      console.log('⚠️ Already processing, ignoring input');
      return;
    }

    setTranscript(speech);
    setError('');
    setIsProcessing(true);
    
    // Disable auto-listening during processing
    shouldAutoListenRef.current = false;
    
    // Update conversation history
    const updatedHistory = [...conversationHistory, `User: ${speech}`];
    
    // Extract any conversational data
    const extractedData = extractConversationalData(speech, leadData);
    setLeadData(extractedData);
    
    // Check if we should ask for contact details
    const shouldAsk = shouldAskForContact(extractedData, updatedHistory);
    
 let prompt = `
CONVERSATION CONTEXT:
- Conversation count: ${extractedData.conversationCount}
- Interest level: ${extractedData.interestLevel}/10
- User name: ${extractedData.name || 'Not provided'}
- User phone: ${extractedData.phone || 'Not provided'}
- User business: ${extractedData.business || 'Not mentioned'}
- User needs: ${extractedData.need || 'Not specified'}

CONVERSATION HISTORY:
${updatedHistory.join('\n')}

INSTRUCTIONS:
${shouldAsk 
  ? `The user is showing interest. Naturally collect contact details (name, phone) to help them further.` 
  : `Continue the natural conversation, focus on understanding their needs. Do not ask for contact yet.`}

The user just said: "${speech}"

Respond naturally as Nova.
`.trim()


    try {
      const aiReply = await getAIResponse(prompt);
      
      const updatedHistoryWithReply = [...updatedHistory, `Nova: ${aiReply}`];
      setConversationHistory(updatedHistoryWithReply);
      setAiResponse(aiReply);
      
      // Speak response
      await speak(aiReply);
      shouldAutoListenRef.current = true;
      
      // Save if we have complete data
      if (extractedData.name && extractedData.phone && !hasSavedRef.current) {
        console.log('🎯 Attempting to save lead data:', extractedData);
        await tryToSaveUserInfo(updatedHistoryWithReply, extractedData);
      }
      
    } catch (err) {
      console.error('AI response error:', err);
      const fallbackReply = 'Sorry, I had trouble processing that. Could you try again?';
      setAiResponse(fallbackReply);
      await speak(fallbackReply);
      shouldAutoListenRef.current = true;
    }
    
    setIsProcessing(false);
  };

  const tryToSaveUserInfo = useCallback(async (history, data) => {
    if (hasSavedRef.current) {
      console.log('⚠️ Already saved, skipping');
      return;
    }

    console.log('💾 Saving conversation with data:', data);

    try {
      const result = await saveConversation({
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        business: data.business || '',
        goal: data.need || '',
        messages: history,
      });

      if (result.success) {
        console.log('✅ Chat saved to Supabase successfully');
        hasSavedRef.current = true;
      } else {
        console.error('❌ Save failed with result:', result.error);
      }
    } catch (error) {
      console.error('❌ Save error exception:', error);
    }
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!synthesisRef.current || !text) {
        resolve();
        return;
      }
      
      synthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      
      // Get best voice
      const voices = synthesisRef.current.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Matthew')
      ) || voices[0];
      
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      synthesisRef.current.speak(utterance);
    });
  }, []);

  const startListening = useCallback(() => {
    if (isProcessing) {
      console.log('⚠️ Cannot start listening - processing in progress');
      return;
    }
    
    if (recognitionRef.current && !isListening && !isSpeaking) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  }, [isListening, isSpeaking, isProcessing]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const stopSpeaking = useCallback(() => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setTranscript('');
    setAiResponse('');
    setError('');
    setHasStarted(false);
    setIsProcessing(false);
    shouldAutoListenRef.current = false;
    setLeadData({ 
      name: '', 
      phone: '', 
      email: '', 
      business: '', 
      need: '',
      interestLevel: 0,
      conversationCount: 0
    });
    hasSavedRef.current = false;
    
    // Force stop any ongoing speech or listening
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  // Initial greeting - natural conversation starter
  const handleFirstClick = useCallback(async () => {
    if (hasStarted || isProcessing) {
      console.log('⚠️ Cannot start - conversation already started or processing');
      return;
    }
    
    setHasStarted(true);
    setIsProcessing(true);
    
    // Force stop any listening
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    shouldAutoListenRef.current = false;
    
    console.log('🚀 STARTING NATURAL CONVERSATION');
    
    const greeting = "Hi there! I'm Nova from Webbotica. What brings you here today?";
    setConversationHistory([`Nova: ${greeting}`]);
    setAiResponse(greeting);
    
    // Start speaking immediately
    setIsSpeaking(true);
    
    try {
      await speak(greeting);
      console.log('✅ SPEECH COMPLETED - NOW ENABLING LISTENING');
      shouldAutoListenRef.current = true;
      setIsProcessing(false);
      
      // Small delay then start listening
      setTimeout(() => {
        if (shouldAutoListenRef.current) {
          startListening();
        }
      }, 300);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      setIsProcessing(false);
    }
  }, [speak, startListening, hasStarted, isProcessing]);

  // Continue conversation function
  const continueConversation = useCallback(() => {
    if (isProcessing) {
      console.log('⚠️ Cannot continue - processing in progress');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  }, [isListening, isSpeaking, isProcessing, startListening, stopListening, stopSpeaking]);

  // Auto-restart listening
  useEffect(() => {
    if (!isSpeaking && !isListening && hasStarted && shouldAutoListenRef.current && !isProcessing) {
      const timer = setTimeout(() => {
        if (shouldAutoListenRef.current && !isSpeaking && !isListening && !isProcessing) {
          startListening();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isListening, hasStarted, startListening, isProcessing]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speechSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && 
    'speechSynthesis' in window;

  return {
    isListening,
    isSpeaking,
    transcript,
    aiResponse,
    error,
    conversationHistory,
    hasStarted,
    isProcessing,
    speechSupported,
    startListening,
    stopListening,
    stopSpeaking,
    speak,
    clearConversation,
    handleFirstClick,
    continueConversation,
    leadData,
  };
}