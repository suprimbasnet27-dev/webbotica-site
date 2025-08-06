'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { throttle } from 'lodash'
import Image from 'next/image'
import logo from '../public/logo.svg'


// Add this comprehensive type declaration at the top
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

interface NavItem {
  name: string
  href: string
  icon: React.ReactElement
}

const navItems: NavItem[] = [
  { 
    name: 'Home', 
    href: '#home',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /></svg>
  },
  // { 
  //   name: 'Solutions', 
  //   href: '#solutions',
  //   icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
  // },
  // { 
  //   name: 'Portfolio', 
  //   href: '#portfolio',
  //   icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" /></svg>
  // },
  // { 
  //   name: 'About', 
  //   href: '#about',
  //   icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
  // },
  // { 
  //   name: 'Contact', 
  //   href: '#contact',
  //   icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
  // },
]

// Logo Configuration - Update these values with your logo details
const LOGO_CONFIG = {
  // Option 1: Use an image URL - Replace with your actual logo URL
  imageUrl: logo, // Replace with your logo
  
  // Option 2: Use text (fallback or if you prefer text)
  text: "Webbotica",
  subtitle: "Digital Solutions",
  
  // Logo dimensions
  width: 120, // Adjust based on your logo
  height: 40, // Adjust based on your logo
  
  // Display preferences
  showIcon: false, // Set to false when using your own logo image
  showText: false, // Set to false when using logo image, true for text-only
  showSubtitle: false, // Set to false when using logo image
}

// Separate cursor component to isolate re-renders
const CustomCursor: React.FC<{ hoveredItem: string | null }> = React.memo(({ hoveredItem }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }, 8)

    window.addEventListener('mousemove', updateMousePosition, { passive: true })
    return () => {
      updateMousePosition.cancel()
      window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  return (
    <>
      <div
        className="fixed w-3 h-3 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-all duration-75 ease-out opacity-80 will-change-transform"
        style={{
          left: mousePosition.x - 6,
          top: mousePosition.y - 6,
          transform: `scale(${hoveredItem ? 1.5 : 1}) rotate(${mousePosition.x * 0.05}deg)`,
          filter: hoveredItem ? 'drop-shadow(0 0 8px rgba(0, 180, 216, 0.6))' : 'none',
        }}
      />
      <div
        className="fixed w-6 h-6 rounded-full pointer-events-none z-40 transition-all duration-150 ease-out will-change-transform"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${hoveredItem ? 1.2 : 1}) rotate(${-mousePosition.x * 0.03}deg)`,
          backgroundColor: hoveredItem ? 'rgba(0, 180, 216, 0.05)' : 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(0, 180, 216, 0.3)',
        }}
      />
    </>
  )
})

CustomCursor.displayName = 'CustomCursor'

// Memoized Logo Component to prevent unnecessary re-renders
const LogoComponent: React.FC = React.memo(() => {
  const [logoError, setLogoError] = useState(false)

  const handleLogoError = useCallback(() => {
    setLogoError(true)
  }, [])

  // If using image URL and no error occurred
  if (LOGO_CONFIG.imageUrl && !logoError && !LOGO_CONFIG.showText) {
    return (
      <Image
  src={logo}
  alt="Company Logo"
  width={LOGO_CONFIG.width}
  height={LOGO_CONFIG.height}
  className="transition-all duration-300 group-hover:scale-105"
  style={{
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
  }}
/>

    )
  }
  
  // Fallback to text/icon logo
  return (
    <div className="flex items-center space-x-3">
      {LOGO_CONFIG.showIcon && (
        <div className="relative">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg will-change-transform"
            style={{
              background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)',
              boxShadow: '0 4px 20px rgba(0, 180, 216, 0.3)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div 
            className="absolute inset-0 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)',
            }}
          />
        </div>
      )}
      
      {(LOGO_CONFIG.showText || LOGO_CONFIG.showSubtitle) && (
        <div className="flex flex-col">
          {LOGO_CONFIG.showText && (
            <span 
              className="text-xl font-bold group-hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {LOGO_CONFIG.text}
            </span>
          )}
          {LOGO_CONFIG.showSubtitle && (
            <span 
              className="text-xs font-medium tracking-wider uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: '#F5F7FA' }}
            >
              {LOGO_CONFIG.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

LogoComponent.displayName = 'LogoComponent'

const PremiumNavBar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('Home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  // Handle scroll effects with smooth transitions
  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)
    }, 8)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      handleScroll.cancel()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Smooth active indicator animation
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return

    const activeElement = navRef.current.querySelector(`[data-nav="${activeItem}"]`) as HTMLElement
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      const indicator = indicatorRef.current
      
      // Use transform for smoother animation
      indicator.style.transform = `translateX(${offsetLeft}px)`
      indicator.style.width = `${offsetWidth}px`
    }
  }, [activeItem])

  const handleNavClick = useCallback((item: NavItem) => {
    setActiveItem(item.name)
    setIsMobileMenuOpen(false)
  }, [])

  const handleMouseEnter = useCallback((itemName: string) => {
    setHoveredItem(itemName)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null)
  }, [])

  // Memoize nav styles to prevent recalculation
  const navBackgroundStyle = useMemo(() => ({
    backgroundColor: isScrolled ? 'rgba(30, 42, 56, 0.95)' : 'rgba(30, 42, 56, 0.2)',
    borderBottomWidth: isScrolled ? '1px' : '0px',
    borderBottomStyle: 'solid' as const,
    borderBottomColor: isScrolled ? 'rgba(71, 85, 105, 0.5)' : 'transparent',
  }), [isScrolled])

  const navClassName = useMemo(() => 
    `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out will-change-transform ${
      isScrolled ? 'backdrop-blur-xl shadow-xl shadow-black/20' : 'backdrop-blur-sm'
    }`, [isScrolled]
  )

  return (
    <>
      {/* Premium Custom Cursor - Isolated component */}
      <CustomCursor hoveredItem={hoveredItem} />

      {/* Navigation Bar */}
      <nav className={navClassName} style={navBackgroundStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Premium Logo - Memoized */}
            <div className="flex-shrink-0 group cursor-pointer">
              <LogoComponent />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div 
                className="relative backdrop-blur-xl rounded-2xl px-2 py-2"
                style={{
                  backgroundColor: 'rgba(30, 42, 56, 0.4)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(245, 247, 250, 0.1)',
                }}
                ref={navRef}
              >
                {/* Active Indicator */}
                <div
                  ref={indicatorRef}
                  className="absolute top-2 h-10 rounded-xl transition-all duration-300 ease-out will-change-transform"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.2) 0%, rgba(255, 190, 11, 0.2) 100%)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(0, 180, 216, 0.4)',
                    boxShadow: '0 4px 20px rgba(0, 180, 216, 0.15)',
                  }}
                />
                
                {/* Navigation Items */}
                <div className="flex items-center space-x-1 relative z-10">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      data-nav={item.name}
                      onClick={() => handleNavClick(item)}
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group overflow-hidden flex items-center space-x-3 will-change-transform ${
                        activeItem === item.name ? 'shadow-lg' : 'hover:scale-105'
                      }`}
                      style={{
                        color: activeItem === item.name ? '#00B4D8' : '#F5F7FA',
                      }}
                    >
                      {/* Background Effects */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.1) 0%, rgba(255, 190, 11, 0.1) 100%)',
                        }}
                      />
                      
                      {/* Icon */}
                      <span className="inline-flex items-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 will-change-transform">
                        {item.icon}
                      </span>
                      
                      {/* Text */}
                      <span className="relative z-10 tracking-wide">{item.name}</span>
                      
                      {/* Micro Interaction Dots */}
                      <div 
                        className="absolute top-1 right-1 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"
                        style={{ backgroundColor: '#00B4D8' }}
                      />
                      <div 
                        className="absolute bottom-1 left-1 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"
                        style={{ 
                          backgroundColor: '#FFBE0B',
                          animationDelay: '0.2s'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium CTA Button */}
            <div className="hidden lg:block">
              <button
                onMouseEnter={() => handleMouseEnter('cta')}
                onMouseLeave={handleMouseLeave}
                className="relative px-6 py-3 font-bold text-sm rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl will-change-transform"
                style={{
                  background: '#00B4D8',
                  color: '#1E2A38',
                  boxShadow: '0 4px 20px rgba(0, 180, 216, 0.3)',
                }}
              >
                <span className="relative z-10 flex items-center tracking-wide">
                  Start Project
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                onMouseEnter={() => handleMouseEnter('menu')}
                onMouseLeave={handleMouseLeave}
                className="relative p-3 backdrop-blur-xl rounded-xl transition-all duration-300 hover:scale-105 will-change-transform"
                style={{
                  backgroundColor: 'rgba(30, 42, 56, 0.5)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(245, 247, 250, 0.1)',
                  color: '#F5F7FA',
                }}
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                  <div
                    className={`w-full h-0.5 bg-current transition-all duration-300 rounded-full will-change-transform ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
                  />
                  <div
                    className={`w-full h-0.5 bg-current transition-all duration-300 rounded-full will-change-transform ${
                      isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                    }`}
                  />
                  <div
                    className={`w-full h-0.5 bg-current transition-all duration-300 rounded-full will-change-transform ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-out overflow-hidden will-change-transform ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div 
            className="px-4 pt-4 pb-6 backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(30, 42, 56, 0.95)',
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: 'rgba(245, 247, 250, 0.1)',
            }}
          >
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full text-left px-5 py-3 text-base font-semibold rounded-xl transition-all duration-300 group overflow-hidden flex items-center space-x-4 will-change-transform ${
                    activeItem === item.name ? 'shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{
                    color: activeItem === item.name ? '#00B4D8' : '#F5F7FA',
                    backgroundColor: activeItem === item.name ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: activeItem === item.name ? 'rgba(0, 180, 216, 0.3)' : 'transparent',
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <span className="inline-flex items-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 will-change-transform">
                    {item.icon}
                  </span>
                  <span className="relative z-10 tracking-wide">{item.name}</span>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.05) 0%, rgba(255, 190, 11, 0.05) 100%)',
                    }}
                  />
                </button>
              ))}
            </div>
            
            {/* Mobile CTA */}
            <div 
              className="pt-4 mt-4"
              style={{
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: 'rgba(245, 247, 250, 0.1)',
              }}
            >
              <button
                onMouseEnter={() => handleMouseEnter('mobile-cta')}
                onMouseLeave={handleMouseLeave}
                className="w-full px-6 py-3 font-bold text-base rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300 shadow-lg will-change-transform"
                style={{
                  background: 'linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)',
                  color: '#1E2A38',
                }}
              >
                <span className="relative z-10 flex items-center justify-center tracking-wide">
                  Start Your Project
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .will-change-transform {
          will-change: transform;
        }

        /* Optimized scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1E2A38;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #00B4D8, #FFBE0B);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0099bb, #e6a800);
        }
      `}</style>
    </>
  )
}

export default PremiumNavBar