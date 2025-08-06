'use client'

import { useState, useEffect } from 'react'

const NovaModal = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
     <div className={`
  relative w-full h-full md:w-[480px] md:h-[600px]
  transform transition-all duration-300 ease-out
  ${isOpen 
    ? 'translate-y-0 scale-100 opacity-100' 
    : 'translate-y-8 scale-95 opacity-0'
  }
`}>

       <div
  className={`
    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
    w-full h-full md:w-[480px] md:h-[600px]
    rounded-none md:rounded-2xl
    shadow-2xl border border-slate-700
    overflow-y-auto
    p-6
  `}
>
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-white">Nova Assistant</h2>
    <button
      onClick={onClose}
      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
    >
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  {/* Shared content area */}
  <div className="flex-1">{children}</div>
</div>

      </div>
    </div>
  )
}

export default NovaModal