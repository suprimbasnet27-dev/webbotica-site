'use client'
import { getAIResponse } from '../utils/openaiClient'
import { saveLead, extractLeadFromConversation, isValidEmail } from '../lib/saveConversation'
import { useState, useRef, useEffect } from 'react'
import { Mic, Volume2, MessageSquare, User, Bot, Sparkles, CheckCircle } from 'lucide-react'

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [leadSaved, setLeadSaved] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [conversationEnded, setConversationEnded] = useState(false)

  const recognitionRef = useRef(null)
  const shouldListenAfterSpeech = useRef(false)

  // Simple speak function with reliable callback
  const speak = async (text) => {
    return new Promise((resolve) => {
      console.log('🗣️ Starting to speak:', text)
      setIsSpeaking(true)
      
      // Cancel any existing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Get best available voice
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex'))
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0]
      
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Use a timer as backup since onend is unreliable
      const estimatedDuration = text.length * 80 // Rough estimate: 80ms per character
      
      utterance.onend = () => {
        console.log('✅ Speech ended (onend callback)')
        setIsSpeaking(false)
        resolve()
      }
      
      utterance.onerror = () => {
        console.log('❌ Speech error (onerror callback)')
        setIsSpeaking(false)
        resolve()
      }
      
      // Backup timer in case callbacks don't fire
      setTimeout(() => {
        if (isSpeaking) {
          console.log('⏰ Speech timeout - forcing end')
          setIsSpeaking(false)
          resolve()
        }
      }, estimatedDuration + 1000)
      
      window.speechSynthesis.speak(utterance)
    })
  }

  // Monitor when speech ends and auto-start listening
  useEffect(() => {
    if (!isSpeaking && shouldListenAfterSpeech.current && conversationStarted && !conversationEnded) {
      console.log('🎤 Speech ended, starting listening automatically...')
      shouldListenAfterSpeech.current = false
      
      // Small delay to ensure speech is completely finished
      setTimeout(() => {
        startListening()
      }, 800)
    }
  }, [isSpeaking, conversationStarted, conversationEnded])

  const handleLeadCapture = async () => {
    if (leadSaved || conversationHistory.length === 0) return false
    
    const leadData = extractLeadFromConversation(conversationHistory)
    console.log('📊 Extracted lead data:', leadData)
    
    if (leadData.name && leadData.email && isValidEmail(leadData.email)) {
      try {
        const result = await saveLead({
          name: leadData.name,
          email: leadData.email,
          businessType: leadData.businessType,
          conversationHistory: conversationHistory
        })
        
        if (result.success) {
          console.log('✅ Lead saved successfully!')
          setLeadSaved(true)
          return true
        } else {
          console.error('❌ Failed to save lead:', result.error)
          return false
        }
      } catch (error) {
        console.error('❌ Exception saving lead:', error)
        return false
      }
    }
    return false
  }

  const handleSpeech = async (speech) => {
    if (conversationEnded) return
    
    console.log('🗣️ Processing speech:', speech)
    setTranscript(speech)
    setError('')
    
    const updatedHistory = [...conversationHistory, `User: ${speech}`]

    const prompt = `
You are Nova, a friendly and professional voice assistant from Webbotica.

You are giving the user a live, interactive demo of how Nova collects leads for *their own* business using AI voice.

You must behave like an assistant working for the user's business — not as a bot or demo agent.

---

🎯 GOAL: Collect a clean sample lead from the user as if they were a real customer.

---

🧭 FLOW:

1. Greet the user briefly and ask: "What kind of business do you run?"
2. Once they tell you, say:  
   "Awesome — I'll be the voice assistant for your [business type], and you be the customer."
3. Begin the conversation like you're speaking to a customer on their behalf:
   "Hi! Thanks for reaching out to [business name or type]. How can I help you today?"
4. Then ask:
   - What the customer is looking for
   - Their name (if appropriate)
   - Their email (key point — see below)
5. Confirm the info naturally
6. End the demo by saying:
   "Perfect! I've collected your information. This demo is now complete!"

---

📧 EMAIL RULES:
When asking for the user's email:

- Let them say it however they want — they may say "at" and "dot"
- Assume common speech pauses or spelling formats
- DO NOT read the email out loud character by character unless the user asks
- If they pause or spell it slowly, respond supportively with phrases like:
  > "Got it — take your time."
  > "I'm ready, go ahead."

🧹 Then clean the email in your head:
- Remove any spaces or dashes
- Convert "at" to @ and "dot" to .
- Make it lowercase

✅ Confirm the cleaned email like this:
> "Thanks. Just to confirm, that's [cleanedEmail], is that right?"

If it still doesn't sound valid, say:
> "Hmm, that didn't sound like a proper email. Could you say it again slowly, one word at a time?"

If confirmed, say:
> "Perfect! I've collected your information. This demo is now complete!"

---

🗣️ STYLE RULES:

- Speak like a human — clear, short, and friendly.
- One sentence at a time.
- Never reply in paragraphs.
- Use contractions and everyday tone: "I'll", "Let's", "Sounds good!"
- Pause if needed — don't overload the user with questions.

---

⚠️ ADDITIONAL BEHAVIOR:

- Never mention you're an AI or demo tool.
- Do not say "Nova" in the voice unless the user asks.
- Always treat the user as the *business owner*, and you as their assistant.
- Let the user play the "customer" role — guide them naturally.
- If they ask to start over, say: "Sure! What kind of business are we pretending to be this time?"

Here's the conversation so far:
${updatedHistory.join('\n')}

Now respond as Nova would — helpful, short, and natural.
    `.trim()

    try {
      const aiReply = await getAIResponse(prompt)
      const updatedHistoryWithReply = [...updatedHistory, `Nova: ${aiReply}`]

      setConversationHistory(updatedHistoryWithReply)
      setResponse(aiReply)
      
      // Set flag to listen after this speech
      shouldListenAfterSpeech.current = true
      
      await speak(aiReply)

      // Check if conversation should end
      const isEndingPhrase = aiReply.toLowerCase().includes("demo is now complete") || 
                            aiReply.toLowerCase().includes("this demo is complete") ||
                            (aiReply.toLowerCase().includes("perfect") && aiReply.toLowerCase().includes("collected your information"))

      if (isEndingPhrase) {
        shouldListenAfterSpeech.current = false // Don't listen after final message
        setConversationEnded(true)
        
        // Save lead and show final message
        setTimeout(async () => {
          const leadSaveSuccess = await handleLeadCapture()
          const finalMessage = leadSaveSuccess 
            ? "Lead successfully saved to your database!"
            : "Demo complete! Thank you for trying Nova."
          
          setConversationHistory(prev => [...prev, `Nova: ${finalMessage}`])
          await speak(finalMessage)
        }, 2000)
      }

    } catch (error) {
      console.error('❌ Error getting AI response:', error)
      setError('Failed to get response. Please try again.')
      shouldListenAfterSpeech.current = true // Still try to listen after error
    }
  }

  const startListening = () => {
    console.log('🎤 Attempting to start listening...', { isListening, isSpeaking, conversationEnded })
    
    if (isListening || isSpeaking || conversationEnded) {
      console.log('❌ Cannot start listening - conditions not met')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome or Safari.')
      return
    }

    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.continuous = false

      recognition.onstart = () => {
        console.log('✅ Recognition started successfully')
        setIsListening(true)
        setError('') // Clear any previous errors
      }

      recognition.onresult = async (event) => {
        const speech = event.results[0][0].transcript
        console.log('🎯 Speech recognized:', speech)
        setIsListening(false)
        await handleSpeech(speech)
      }

      recognition.onerror = (e) => {
        console.error('❌ Recognition error:', e.error)
        setIsListening(false)
        
        if (e.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.')
        } else if (e.error === 'no-speech') {
          setError('No speech detected. Please try speaking again.')
          // Auto-retry for no-speech errors
          if (conversationStarted && !conversationEnded) {
            setTimeout(() => startListening(), 1000)
          }
        } else {
          setError(`Microphone error: ${e.error}`)
          // Auto-retry for other errors
          if (conversationStarted && !conversationEnded) {
            setTimeout(() => startListening(), 2000)
          }
        }
      }

      recognition.onend = () => {
        console.log('🛑 Recognition ended')
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
      
    } catch (error) {
      console.error('❌ Error creating recognition:', error)
      setError('Failed to start voice recognition')
    }
  }

  const handleStartDemo = async () => {
    if (conversationStarted) return
    
    try {
      setConversationStarted(true)
      setError('')
      
      const greeting = "Hey, I'm Nova! What kind of business do you run?"
      
      setConversationHistory([`Nova: ${greeting}`])
      setResponse(greeting)
      
      shouldListenAfterSpeech.current = true
      await speak(greeting)
      
    } catch (error) {
      console.error('❌ Error starting demo:', error)
      setError('Failed to start demo. Please try again.')
      setConversationStarted(false)
    }
  }

  const resetDemo = () => {
    // Stop everything
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    // Reset all states
    setIsListening(false)
    setIsSpeaking(false)
    setTranscript('')
    setResponse('')
    setError('')
    setConversationHistory([])
    setLeadSaved(false)
    setConversationStarted(false)
    setConversationEnded(false)
    shouldListenAfterSpeech.current = false
  }

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log(`📢 Loaded ${voices.length} voices`)
    }
    
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1E2A38 0%, #0F1419 50%, #1E2A38 100%)'}}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-transparent to-yellow-900/10"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#00E5FF', opacity: 0.05}}></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#FFBE0B', opacity: 0.05}}></div>
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-xl" style={{background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)'}}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{background: 'linear-gradient(135deg, #F5F7FA 0%, #00B4D8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Nova Assistant
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{color: '#F5F7FA', opacity: 0.8}}>
            Premium AI voice experience for lead collection
          </p>
          
          {/* Status indicators */}
          {leadSaved && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lead saved to database!
            </div>
          )}
          
          {conversationEnded && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Demo completed successfully!
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="grid gap-6">
            {/* Voice Control Panel */}
            <div className="space-y-6">
              <div className="rounded-2xl border p-6 shadow-2xl backdrop-blur-xl" style={{backgroundColor: '#F5F7FA', backgroundOpacity: 0.05, borderColor: '#00B4D8', borderOpacity: 0.1}}>
                <div className="text-center">
                  {/* Main Voice Button */}
                  <div className="relative mb-6">
                    <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center transition-all duration-500 transform shadow-xl ${
                      isListening 
                        ? 'scale-110' 
                        : isSpeaking 
                        ? 'scale-105' 
                        : conversationEnded
                        ? 'scale-100'
                        : 'hover:scale-105'
                    }`} style={{
                      background: isListening 
                        ? 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)'
                        : isSpeaking 
                        ? 'linear-gradient(135deg, #FFBE0B 0%, #ffa502 100%)'
                        : conversationEnded
                        ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                        : 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)'
                    }}>
                      {conversationEnded ? (
                        <CheckCircle className="w-10 h-10 text-white" />
                      ) : isListening ? (
                        <div className="relative">
                          <Mic className="w-10 h-10 text-white" />
                          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                        </div>
                      ) : isSpeaking ? (
                        <Volume2 className="w-10 h-10 text-white animate-pulse" />
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </div>
                    
                    {/* Status Ring */}
                    <div className={`absolute inset-0 rounded-full border-2 ${
                      isListening || isSpeaking 
                        ? 'animate-pulse' 
                        : 'border-transparent'
                    }`} style={{
                      borderColor: isListening ? '#ff4757' : isSpeaking ? '#FFBE0B' : 'transparent'
                    }}></div>
                  </div>

                  {/* Status Text */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border`} style={{
                      backgroundColor: conversationEnded
                        ? 'rgba(40, 167, 69, 0.1)'
                        : isListening 
                        ? 'rgba(255, 71, 87, 0.1)' 
                        : isSpeaking 
                        ? 'rgba(255, 190, 11, 0.1)' 
                        : 'rgba(245, 247, 250, 0.1)',
                      color: conversationEnded
                        ? '#28a745'
                        : isListening 
                        ? '#ff4757' 
                        : isSpeaking 
                        ? '#FFBE0B' 
                        : '#F5F7FA',
                      borderColor: conversationEnded
                        ? 'rgba(40, 167, 69, 0.3)'
                        : isListening 
                        ? 'rgba(255, 71, 87, 0.3)' 
                        : isSpeaking 
                        ? 'rgba(255, 190, 11, 0.3)' 
                        : 'rgba(245, 247, 250, 0.3)'
                    }}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        isListening || isSpeaking ? 'animate-pulse' : ''
                      }`} style={{
                        backgroundColor: conversationEnded
                          ? '#28a745'
                          : isListening 
                          ? '#ff4757' 
                          : isSpeaking 
                          ? '#FFBE0B' 
                          : '#F5F7FA'
                      }}></div>
                      {conversationEnded 
                        ? 'Demo Complete'
                        : isListening 
                        ? 'Listening...' 
                        : isSpeaking 
                        ? 'Speaking...' 
                        : conversationStarted 
                        ? 'Ready' 
                        : 'Ready to Start'}
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="space-y-3">
                    {!conversationStarted ? (
                      <button
                        onClick={handleStartDemo}
                        disabled={isListening || isSpeaking}
                        className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg ${
                          isListening || isSpeaking
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:scale-105 hover:shadow-xl'
                        }`}
                        style={{
                          background: isListening || isSpeaking 
                            ? 'rgba(30, 42, 56, 0.5)' 
                            : 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
                          color: '#F5F7FA'
                        }}
                      >
                        Start Voice Demo
                      </button>
                    ) : conversationEnded ? (
                      <button
                        onClick={resetDemo}
                        className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:scale-105 hover:shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
                          color: '#F5F7FA'
                        }}
                      >
                        Start New Demo
                      </button>
                    ) : (
                      <div className="text-center space-y-3">
                        <p className="text-sm" style={{color: '#F5F7FA', opacity: 0.7}}>
                          🎤 Auto-listening after Nova speaks
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={startListening}
                            disabled={isListening || isSpeaking}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: isListening || isSpeaking 
                                ? 'rgba(0, 180, 216, 0.2)' 
                                : 'rgba(0, 180, 216, 0.2)',
                              color: '#00B4D8',
                              border: '1px solid rgba(0, 180, 216, 0.3)'
                            }}
                          >
                            Manual Listen
                          </button>
                          <button
                            onClick={resetDemo}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'rgba(255, 71, 87, 0.2)',
                              color: '#ff4757',
                              border: '1px solid rgba(255, 71, 87, 0.3)'
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-xl border p-4 backdrop-blur-xl" style={{backgroundColor: 'rgba(255, 71, 87, 0.1)', borderColor: 'rgba(255, 71, 87, 0.3)'}}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3 animate-pulse" style={{backgroundColor: '#ff4757'}}></div>
                    <p className="font-medium text-sm" style={{color: '#ff4757'}}>{error}</p>
                  </div>
                </div>
              )}

              {/* Current Interaction */}
              {(transcript || response) && (
                <div className="space-y-4">
                  {transcript && (
                    <div className="rounded-xl border p-4 backdrop-blur-xl" style={{backgroundColor: 'rgba(245, 247, 250, 0.05)', borderColor: 'rgba(245, 247, 250, 0.1)'}}>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-lg" style={{background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)'}}>
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium" style={{color: '#F5F7FA'}}>You</span>
                      </div>
                      <p className="leading-relaxed" style={{color: '#F5F7FA', opacity: 0.9}}>{transcript}</p>
                    </div>
                  )}
                  
                  {response && (
                    <div className="rounded-xl border p-4 backdrop-blur-xl" style={{backgroundColor: 'rgba(255, 190, 11, 0.05)', borderColor: 'rgba(255, 190, 11, 0.2)'}}>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-lg" style={{background: 'linear-gradient(135deg, #FFBE0B 0%, #ffa502 100%)'}}>
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium" style={{color: '#F5F7FA'}}>Nova</span>
                      </div>
                      <p className="leading-relaxed" style={{color: '#F5F7FA', opacity: 0.9}}>{response}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversation History */}
            <div>
              <div className="rounded-2xl border shadow-2xl h-[600px] flex flex-col backdrop-blur-xl" style={{backgroundColor: 'rgba(245, 247, 250, 0.05)', borderColor: 'rgba(245, 247, 250, 0.1)'}}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'rgba(245, 247, 250, 0.1)'}}>
                  <div className="flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3" style={{color: '#F5F7FA'}} />
                    <h2 className="text-xl font-bold" style={{color: '#F5F7FA'}}>Conversation</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${conversationStarted && !conversationEnded ? 'animate-pulse' : ''}`} style={{backgroundColor: conversationEnded ? '#28a745' : conversationStarted ? '#00B4D8' : '#6c757d'}}></div>
                    <span className="text-sm" style={{color: '#F5F7FA', opacity: 0.7}}>
                      {conversationEnded ? 'Complete' : conversationStarted ? 'Live' : 'Ready'}
                    </span>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  {conversationHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #00B4D8, #FFBE0B)', opacity: 0.2}}>
                          <MessageSquare className="w-8 h-8" style={{color: '#F5F7FA'}} />
                        </div>
                        <p className="text-lg mb-2" style={{color: '#F5F7FA', opacity: 0.8}}>Ready to start your voice conversation</p>
                        <p className="text-sm" style={{color: '#F5F7FA', opacity: 0.5}}>Click "Start Voice Demo" to begin</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversationHistory.map((message, index) => {
                        const isUser = message.startsWith('User:')
                        const content = message.replace(/^(User:|Nova:)\s*/, '')
                        
                        return (
                          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                              isUser ? 'order-2' : 'order-1'
                            }`}>
                              <div className={`rounded-2xl p-4 shadow-lg ${
                                isUser ? 'ml-auto' : ''
                              }`} style={{
                                background: isUser 
                                  ? 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)' 
                                  : 'rgba(245, 247, 250, 0.1)',
                                color: '#F5F7FA',
                                backdropFilter: 'blur(10px)',
                                border: isUser ? 'none' : '1px solid rgba(245, 247, 250, 0.2)'
                              }}>
                                <div className="flex items-center mb-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 shadow-sm ${
                                    isUser ? 'bg-white/20' : ''
                                  }`} style={{
                                    background: isUser 
                                      ? 'rgba(255, 255, 255, 0.2)' 
                                      : 'linear-gradient(135deg, #FFBE0B 0%, #ffa502 100%)'
                                  }}>
                                    {isUser ? (
                                      <User className="w-3 h-3" />
                                    ) : (
                                      <Bot className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium opacity-90">
                                    {isUser ? 'You' : 'Nova'}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed">{content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8 rounded-2xl border p-8 shadow-2xl backdrop-blur-xl" style={{backgroundColor: 'rgba(245, 247, 250, 0.05)', borderColor: 'rgba(245, 247, 250, 0.1)'}}>
            <h3 className="text-2xl font-bold mb-8 text-center" style={{color: '#F5F7FA'}}>
              Professional Voice AI Technology
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)'}}>
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3" style={{color: '#F5F7FA'}}>Natural Voice Processing</h4>
                <p className="leading-relaxed" style={{color: '#F5F7FA', opacity: 0.7}}>Advanced speech recognition with real-time processing and natural conversation flow</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #FFBE0B 0%, #ffa502 100%)'}}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3" style={{color: '#F5F7FA'}}>Intelligent AI Engine</h4>
                <p className="leading-relaxed" style={{color: '#F5F7FA', opacity: 0.7}}>Context-aware responses with business logic and lead qualification automation</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)'}}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3" style={{color: '#F5F7FA'}}>Seamless Integration</h4>
                <p className="leading-relaxed" style={{color: '#F5F7FA', opacity: 0.7}}>Professional lead capture with CRM integration and automated follow-up systems</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}