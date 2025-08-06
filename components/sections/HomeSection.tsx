'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { throttle } from 'lodash'

interface CodeExample {
  code: string
  language: string
}

interface OrbConfig {
  delay: number
  size: number
  color: string
  x: number
  y: number
}

const codeExamples: CodeExample[] = [
  {
    code: `// Real-time data processing
const processStream = async (data) => {
  const insights = await AI.analyze(data);
  return transform(insights);
};`,
    language: 'JavaScript',
  },
  {
    code: `// Smart automation engine
class AutomationEngine {
  async execute(workflow) {
    return this.ai.optimize(workflow);
  }
}`,
    language: 'TypeScript',
  },
  {
    code: `// Intelligent UI adaptation
const adaptiveUI = useMemo(() => {
  return AI.personalizeExperience(userBehavior);
}, [context]);`,
    language: 'React',
  },
]

const FloatingOrb = memo(({ delay, size, color, x, y }: OrbConfig) => {
  const [offsetY, setOffsetY] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    let frameId: number
    const animate = () => {
      const time = Date.now() * 0.001
      setOffsetY(Math.sin(time + delay) * 20)
      setOffsetX(Math.cos(time * 0.5 + delay) * 15)
      setScale(1 + Math.sin(time * 0.3 + delay) * 0.15)
      setRotation(time * 20 + delay * 10)
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [delay])

  return (
    <div
      className="absolute rounded-full opacity-20 blur-sm transition-all duration-100"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
      }}
    />
  )
})

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      opacity: Math.random(),
      speed: 1 + Math.random(),
    }))

    let frameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.opacity = Math.sin(Date.now() * 0.001 + particle.x) * 0.4 + 0.4
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34, 211, 238, ${particle.opacity})`
        ctx.fill()
        particle.y += particle.speed
        if (particle.y > canvas.height) particle.y = 0
      })
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0" />
}

type HeroSectionProps = {
  onTryDemo?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({onTryDemo}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [currentCode, setCurrentCode] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateMousePosition = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }, 16)
    window.addEventListener('mousemove', updateMousePosition)
    return () => {
      updateMousePosition.cancel()
      window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  const [orbConfig, setOrbConfig] = useState<OrbConfig[]>([])

  useEffect(() => {
    const randomOrbs = Array.from({ length: 12 }, () => ({
      delay: Math.random() * 4,
      size: 60 + Math.random() * 80,
      color: '#00B4D8',
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setOrbConfig(randomOrbs)
  }, [])

  // Fixed typing animation effect
  useEffect(() => {
    const currentExample = codeExamples[currentCode]
    let index = 0
    
    // Clear any existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    // Reset state
    setTypingText('')
    setIsTyping(true)

    const typeNextCharacter = () => {
      if (index < currentExample.code.length) {
        setTypingText(currentExample.code.substring(0, index + 1))
        index++
        
        // Variable typing speed for more natural feel
        const char = currentExample.code[index - 1]
        let delay = 30 // base delay
        
        if (char === '\n') delay = 150 // pause at line breaks
        else if (char === ' ') delay = 50 // slight pause at spaces
        else if (char === '.' || char === ';' || char === ',') delay = 100 // pause at punctuation
        else if (Math.random() < 0.1) delay = 80 // random slight pauses
        
        typingTimeoutRef.current = setTimeout(typeNextCharacter, delay)
      } else {
        // Finished typing current example
        setIsTyping(false)
        
        // Wait before transitioning to next example
        transitionTimeoutRef.current = setTimeout(() => {
          setCurrentCode((prev) => (prev + 1) % codeExamples.length)
        }, 2500) // Show completed code for 2.5 seconds
      }
    }

    // Start typing after a brief delay
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 500)

    // Cleanup function
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [currentCode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Custom Cursor */}
      <div
        className="fixed w-4 h-4 bg-cyan-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-75 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: `scale(${isHovered ? 1.5 : 1})`,
        }}
      />
      <div
        className="fixed w-8 h-8 border-2 border-cyan-400/30 rounded-full pointer-events-none z-40 transition-all duration-150 ease-out"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: `scale(${isHovered ? 1.2 : 1})`,
        }}
      />

      {/* Background Elements */}
      <ParticleField />
      <div className="absolute inset-0">
        {orbConfig.map((config, i) => (
          <FloatingOrb key={i} {...config} />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className="mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-slate-800/60 backdrop-blur-lg border border-cyan-500/30 rounded-full">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm uppercase tracking-wider text-cyan-300 font-semibold">
                Digital Architects
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div
            className="mb-12 opacity-0 animate-scale-in"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-none mb-6">
              <span className="block bg-gradient-to-r from-slate-100 via-cyan-300 to-slate-100 bg-clip-text text-transparent animate-gradient">
                We Don't Just
              </span>
              <span className="block bg-gradient-to-r from-cyan-300 via-yellow-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-delayed">
                Build Code
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <div
            className="mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
          >
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-slate-100 mb-4">
              One AI system. Zero follow-up stress. {' '}
              <span
                role="button"
                tabIndex={0}
                className="relative text-yellow-300 font-bold cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsHovered(true)}
              >
                Infinite leads.
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-cyan-300 rounded-full animate-expand" />
              </span>
            </div>
          </div>

          {/* Live Code Demo */}
          <div
            className="mb-12 max-w-3xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-cyan-300 bg-slate-800 px-3 py-1 rounded-full">
                  {codeExamples[currentCode].language}
                </div>
              </div>
              <div
                className="font-mono text-xs sm:text-sm md:text-base leading-relaxed min-h-[100px] flex items-start"
                aria-live="polite"
              >
                <div className="text-cyan-300 w-full">
                  <pre className="whitespace-pre-wrap">
                    <span className="sr-only">{codeExamples[currentCode].code}</span>
                    <span aria-hidden="true">{typingText}</span>
                    {isTyping && (
                      <span className="inline-block w-2 h-4 bg-cyan-300 ml-1 animate-pulse" />
                    )}
                  </pre>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-yellow-500/5 animate-pulse-slow" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}
          >
            <button
              aria-label="View our projects"
               onClick={onTryDemo}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsHovered(true)}
              onBlur={() => setIsHovered(false)}
              className="relative px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 font-bold text-base sm:text-lg rounded-full shadow-lg transition-all duration-300 overflow-hidden group hover:scale-105 hover:shadow-cyan-500/50"
            >
              <span className="relative z-10 flex items-center justify-center">
                 See AI in Action
                <span className="ml-2 text-lg sm:text-xl animate-spin-slow">✨</span>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>

            <button
              aria-label="Start your project"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsHovered(true)}
              onBlur={() => setIsHovered(false)}
              className="relative px-8 py-3 sm:px-10 sm:py-4 border-2 border-slate-600 text-slate-100 font-bold text-base sm:text-lg rounded-full hover:bg-slate-800 hover:border-yellow-300 hover:text-yellow-300 transition-all duration-300 overflow-hidden group hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center">
                See What we Built
                   <span className="ml-2 text-lg sm:text-xl animate-bounce-x">↘</span>
              </span>
              <span className="absolute inset-0 bg-yellow-300 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </button>
          </div>

          {/* Scroll Indicator */}
          <div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in"
            style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
          >
            <div className="text-center">
              <div className="text-xs text-slate-300 mb-3 uppercase tracking-wider">
                Discover More
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        :root {
          --bg-color: #0f172a;
          --text-color: #f1f5f9;
          --accent-color: #22d3ee;
        }

        .hero-section {
          background: var(--bg-color);
          color: var(--text-color);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes expand {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes bounce-x {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }

        @keyframes bounce-y {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }

        .animate-gradient {
          background-size: 200% 100%;
          animation: gradient 3s linear infinite;
        }

        .animate-gradient-delayed {
          background-size: 200% 100%;
          animation: gradient 3s linear infinite;
          animation-delay: 0.8s;
        }

        .animate-expand {
          animation: expand 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animate-bounce-x {
          animation: bounce-x 1.5s ease-in-out infinite;
        }

        .animate-bounce-y {
          animation: bounce-y 2s ease-in-out infinite;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 2rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .px-8 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          .max-w-3xl {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default HeroSection