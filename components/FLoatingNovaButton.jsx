'use client'

import { useState } from 'react'

const FloatingNovaButton = ({ onClick, isOpen }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    }
    
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
    
    onClick()
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Floating Button */}
        <div className="relative">
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ease-out overflow-hidden
              ${isOpen 
                ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110' 
                : 'hover:scale-110'
              }
              ${isHovered ? 'shadow-2xl' : 'shadow-slate-900/50'}
            `}
            style={{
              background: isOpen 
                ? undefined 
                : 'linear-gradient(to right, #00E5FF, #00B4D8)',
              boxShadow: isHovered && !isOpen 
                ? '0 25px 50px -12px rgba(0, 229, 255, 0.5)' 
                : undefined
            }}
          >
            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ping"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                }}
              />
            ))}
            
            {/* Icon */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
              {isOpen ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </div>
            
            {/* Animated Ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-white/30 ${isHovered ? 'animate-spin' : ''}`} />
          </button>
          
         
        </div>
        
        {/* Tooltip */}
        {isHovered && !isOpen && (
          <div className="absolute bottom-20 right-0 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            <div className="text-sm font-medium">Talk to Nova</div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default FloatingNovaButton