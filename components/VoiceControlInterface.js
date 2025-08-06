// components/VoiceControlInterface.js
import React, { useState, useEffect } from 'react';

export function VoiceControlInterface({ 
  voiceAI, 
  onInteraction,
  onEndConversation, // New prop for handling conversation end
  className = ""
}) {
  const [isClient, setIsClient] = useState(false);
  
  const {
    isListening,
    isSpeaking,
    transcript,
    aiResponse,
    error,
    speechSupported,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    handleFirstClick,
    continueConversation,
    hasStarted,
    isProcessing,
    leadData,
    speak, // Make sure speak is destructured from voiceAI
    setAiResponse // Add this if it's available, or we'll work around it
  } = voiceAI;

  // Ensure we only render interactive content on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVoiceToggle = () => {
    console.log('🔧 Button clicked');
    console.log('🔧 hasStarted:', hasStarted);
    console.log('🔧 isListening:', isListening);
    console.log('🔧 isSpeaking:', isSpeaking);
    console.log('🔧 isProcessing:', isProcessing);
    console.log('🔧 conversationHistory length:', voiceAI.conversationHistory?.length || 0);
    
    // Check if conversation has never been started
    const conversationNeverStarted = !hasStarted && (!voiceAI.conversationHistory || voiceAI.conversationHistory.length === 0);
    
    if (conversationNeverStarted) {
      console.log('🔧 Starting conversation for the FIRST TIME with handleFirstClick');
      if (handleFirstClick) {
        handleFirstClick();
        onInteraction?.();
      } else {
        console.error('❌ handleFirstClick is not available');
      }
    } else {
      // Conversation already exists - just continue it
      console.log('🔧 Conversation already exists, using continueConversation');
      if (continueConversation) {
        continueConversation();
        onInteraction?.();
      } else {
        console.error('❌ continueConversation is not available');
        // Fallback to manual control
        if (isListening) {
          stopListening();
        } else if (isSpeaking) {
          stopSpeaking();
        } else {
          startListening();
        }
        onInteraction?.();
      }
    }
  };

  // Handle ending conversation with a polite goodbye
  const handleEndConversation = async () => {
    console.log('🔚 Ending conversation');
    
    // FORCE stop everything immediately and repeatedly
    stopListening();
    stopSpeaking();
    
    // Clear conversation first
    clearConversation();
    
    // Call the parent's end conversation handler if provided
    onEndConversation?.(leadData, voiceAI.conversationHistory);
    
    // Force stop multiple times to override any auto-restart
    const forceStop = () => {
      stopListening();
      if (voiceAI.recognitionRef?.current) {
        voiceAI.recognitionRef.current.abort();
      }
    };
    
    // Stop immediately and again after small delays
    forceStop();
    setTimeout(forceStop, 50);
    setTimeout(forceStop, 200);
    setTimeout(forceStop, 500);
    setTimeout(forceStop, 1000);
  };

  // Always render the same structure during SSR and initial client render
  if (!isClient) {
    return (
      <div className={`rounded-3xl p-8 ${className}`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 229, 255, 0.1)'
        }}>
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #00E5FF 0%, #00B4D8 100%)',
              boxShadow: '0 0 30px rgba(0, 229, 255, 0.4), inset 0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
            <span className="text-2xl">🎤</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm opacity-60" style={{ color: '#94A3B8' }}>
            Loading voice interface...
          </p>
        </div>
      </div>
    );
  }

  // Now we can safely check speechSupported since we're on the client
  if (!speechSupported) {
    return (
      <div className={`rounded-3xl p-8 ${className}`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center opacity-50"
            style={{ 
              background: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
            <span className="text-2xl opacity-50">🎤</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm opacity-60" style={{ color: '#F87171' }}>
            Voice control not supported in this browser
          </p>
        </div>
      </div>
    );
  }

  // Determine button state and text
  const conversationNeverStarted = !hasStarted && (!voiceAI.conversationHistory || voiceAI.conversationHistory.length === 0);
  const buttonDisabled = isProcessing && !isSpeaking; // Allow stopping speech during processing
  const conversationActive = hasStarted && (voiceAI.conversationHistory?.length > 0);

  return (
    <div className={`bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Voice Status and Button */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleVoiceToggle}
          disabled={buttonDisabled}
          className={`
            relative w-16 h-16 rounded-full border-2 transition-all duration-300
            ${buttonDisabled
              ? 'bg-gray-500/20 border-gray-400 opacity-50 cursor-not-allowed'
              : isListening 
              ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-400/30' 
              : isSpeaking
              ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-400/30'
              : 'bg-cyan-500/20 border-cyan-400 hover:bg-cyan-500/30 shadow-lg shadow-cyan-400/20'}
          `}
        >
          <div className={`
            absolute inset-2 rounded-full transition-all duration-300
            ${buttonDisabled
              ? 'bg-gray-400'
              : isListening 
              ? 'bg-red-400 animate-pulse' 
              : isSpeaking
              ? 'bg-blue-400 animate-pulse'
              : 'bg-cyan-400'}
          `} />
        </button>

        <div className="text-white/80 text-sm">
          {isProcessing && !isSpeaking ? 'Processing...' :
           isListening ? 'Listening...' : 
           isSpeaking ? 'Speaking...' : 
           conversationNeverStarted ? 'Start Conversation' : 'Continue'}
        </div>
      </div>

      {/* Progress indicator during processing */}
      {isProcessing && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Conversation History */}
      {(transcript || aiResponse) && (
        <div className="mt-6 space-y-3 max-h-32 overflow-y-auto">
          {transcript && (
            <div className="text-sm p-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-100">
              {transcript}
            </div>
          )}
          {aiResponse && (
            <div className="text-sm p-3 rounded-xl border border-yellow-400/20 bg-yellow-500/10 text-yellow-100">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons - Show End Conversation whenever there's an active conversation */}
      {conversationActive && (
        <div className="flex justify-center items-center space-x-3 mt-4">
          {/* Clear button only when not busy */}
          {!isListening && !isSpeaking && !isProcessing && (
            <button
              onClick={clearConversation}
              className="px-4 py-2 text-sm text-slate-200 border border-slate-300/20 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              Clear
            </button>
          )}
          
          {/* End Conversation button - always available during active conversation */}
          <button
            onClick={handleEndConversation}
            disabled={isProcessing && !isSpeaking} // Only disable during AI processing, allow during speech
            className={`
              px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg
              ${(isProcessing && !isSpeaking)
                ? 'text-gray-400 border border-gray-500/30 bg-gray-500/10 opacity-50 cursor-not-allowed'
                : 'text-white border border-orange-400/40 bg-orange-500/20 hover:bg-orange-500/30 hover:border-orange-400/60 shadow-orange-400/10'
              }
            `}
          >
            End Conversation
          </button>
        </div>
      )}
    </div>
  );
}