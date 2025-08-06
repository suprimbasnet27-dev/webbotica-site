'use client'

import { useState, useEffect } from 'react'
import HeroSection from '../../components/sections/HomeSection'
import VoiceAssistant from '../../components/VoiceAssitant'
import FloatingNovaButton from '../../components/FLoatingNovaButton'
import NovaModal from '../../components/NovaModal'
import PremiumNavBar from '../../components/PremiumNavBar'
import PremiumServicesSection from '../../components/sections/PremiumServicesSection'
import PremiumProblemsPage from '../../components/sections/PremiumProblemsPage'
import UniqueCtaSection from '../../components/sections/UniqueCtaSection'
import WebboticaRobot from '../../components/PremiumRobotGuide'

export default function HomePage(): JSX.Element {
  const [isNovaOpen, setIsNovaOpen] = useState<boolean>(false)
  const [hideFloatingButton, setHideFloatingButton] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isInteractingWithRobot, setIsInteractingWithRobot] = useState<boolean>(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      )
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle robot interaction with better scroll management
  const handleRobotInteractionStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    // Only prevent scroll if it's a deliberate horizontal gesture
    const touch = e.touches?.[0]
    if (touch) {
      const startX = touch.clientX
      const startY = touch.clientY
      
      const handleMove = (moveE: TouchEvent): void => {
        const moveTouch = moveE.touches?.[0]
        if (moveTouch) {
          const deltaX = Math.abs(moveTouch.clientX - startX)
          const deltaY = Math.abs(moveTouch.clientY - startY)
          
          // Only start robot interaction if horizontal movement dominates
          if (deltaX > deltaY * 1.5 && deltaX > 20) {
            setIsInteractingWithRobot(true)
            setHideFloatingButton(true)
            document.removeEventListener('touchmove', handleMove)
          } else if (deltaY > 30) {
            // Clear vertical scrolling - don't interfere
            document.removeEventListener('touchmove', handleMove)
          }
        }
      }
      
      document.addEventListener('touchmove', handleMove, { passive: true })
      
      setTimeout(() => {
        document.removeEventListener('touchmove', handleMove)
      }, 200)
    }
  }

  const handleRobotInteractionEnd = (): void => {
    setIsInteractingWithRobot(false)
    setTimeout(() => setHideFloatingButton(false), 500)
  }

  const scrollHintClasses: string = [
    'absolute', 'bottom-50', 'left-1/2', 'transform', '-translate-x-1/2',
    'bg-black/20', 'backdrop-blur-sm', 'rounded-full', 'px-4', 'py-2',
    'text-white/70', 'text-sm', 'pointer-events-none', 'z-50'
  ].join(' ')

  return (
    <>
      <div style={{ overflowX: 'hidden', overflowY: 'auto' }}>
        <PremiumNavBar />

        {/* Robot Section - Fixed container */}
        <div
          className="relative h-screen w-full"
          style={{
            touchAction: 'pan-y pinch-zoom',
            overflowY: 'visible',
            pointerEvents: isInteractingWithRobot ? 'none' : 'auto'
          }}
          onTouchStart={isMobile ? handleRobotInteractionStart : undefined}
          onTouchEnd={isMobile ? handleRobotInteractionEnd : undefined}
          onMouseEnter={!isMobile ? () => setHideFloatingButton(true) : undefined}
          onMouseLeave={!isMobile ? () => setHideFloatingButton(false) : undefined}
        >
          {/* Robot Component with constrained interaction area */}
          <div 
            className="absolute inset-0"
            style={{
              pointerEvents: 'auto',
              touchAction: 'pan-y pinch-zoom'
            }}
          >
            <WebboticaRobot />
          </div>

          {/* Scroll hint overlay for mobile */}
          {isMobile && !isInteractingWithRobot && (
            <div 
              className={scrollHintClasses}
              style={{
                animation: 'fadeInOut 3s ease-in-out infinite'
              }}
            >
              Swipe horizontally to rotate • Scroll to continue
            </div>
          )}
        </div>

        {/* Main Content Sections */}
        <div 
          className="relative z-10"
          style={{
            touchAction: 'auto',
            pointerEvents: 'auto'
          }}
        >
          <HeroSection onTryDemo={() => setIsNovaOpen(true)} />
          <PremiumServicesSection />
          <PremiumProblemsPage />
          <UniqueCtaSection />
        </div>

        {/* Floating Nova Button - Fixed: Wrap in div with scroll-friendly styles */}
        {!hideFloatingButton && (
          <div
            style={{
              touchAction: 'manipulation',
              position: 'fixed',
              bottom: 0,
              right: 0,
              zIndex: 1000,
              pointerEvents: 'auto'
            }}
          >
            <FloatingNovaButton
              onClick={() => setIsNovaOpen(!isNovaOpen)}
              isOpen={isNovaOpen}
            />
          </div>
        )}

        {/* Nova Modal */}
        <NovaModal isOpen={isNovaOpen} onClose={() => setIsNovaOpen(false)}>
          <VoiceAssistant />
        </NovaModal>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { 
            opacity: 0.7; 
          }
          50% { 
            opacity: 0.3; 
          }
        }
      `}</style>
    </>
  )
}