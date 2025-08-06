'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Brain, Globe, Smartphone, Target, ArrowRight, Sparkles, MessageCircle, Wifi, Signal, Battery, Lock, Home, Settings, Camera, Phone, Mail, Mic } from 'lucide-react'


const VirtualPhoneExperience: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [notifications, setNotifications] = useState({ ai: 2, web: 1, mobile: 3, leads: 1 })
  const [phoneRotation, setPhoneRotation] = useState({ x: 0, y: 0 })
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const [shakeCount, setShakeCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const phoneRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 })
  const shakeThreshold = 15

  const services = [
    {
      id: 'ai',
      icon: <Brain className="w-6 h-6" />,
      title: "AI Integration",
      subtitle: "Smart Automation",
      description: "Intelligent chatbots and automation that learn your business",
      color: "#3B82F6",
      bgColor: "bg-blue-500",
      notifications: notifications.ai,
      demoContent: (
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-blue-800 mb-2">AI Integration Service</h3>
              <p className="text-sm text-blue-700 mb-3">
                Transform your business with intelligent automation. Our AI solutions learn from your data and streamline operations.
              </p>
              <div className="space-y-2 text-xs text-blue-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Smart chatbots for customer service
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Automated data analysis & insights
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Predictive analytics for business growth
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Natural language processing
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-2">
                  <p className="text-xs">Hello! I'm your AI assistant. How can I help you today?</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%]">
                <p className="text-xs">Show me my business analytics</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-gray-200 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500">Analyzing your data...</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">Key Features:</h4>
              <div className="space-y-3">
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-blue-700">24/7 Customer Support Bot</p>
                  <p className="text-xs text-gray-600">Handles 80% of customer queries automatically</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-blue-700">Smart Lead Scoring</p>
                  <p className="text-xs text-gray-600">AI predicts which leads are most likely to convert</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-blue-700">Automated Workflows</p>
                  <p className="text-xs text-gray-600">Streamline repetitive tasks and save time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'web',
      icon: <Globe className="w-6 h-6" />,
      title: "Web Development",
      subtitle: "Beautiful Websites", 
      description: "Responsive websites that convert visitors to customers",
      color: "#10B981",
      bgColor: "bg-emerald-500",
      notifications: notifications.web,
      demoContent: (
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-emerald-800 mb-2">Web Development Service</h3>
              <p className="text-sm text-emerald-700 mb-3">
                Create stunning, responsive websites that drive results. From simple landing pages to complex web applications.
              </p>
              <div className="space-y-2 text-xs text-emerald-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Responsive design for all devices
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  SEO optimized for better rankings
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Fast loading speeds & performance
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Custom CMS integration
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="h-2 bg-emerald-200 rounded mb-2"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-emerald-300 rounded"></div>
                <div className="h-12 bg-emerald-200 rounded"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-600">
              <span>Mobile Responsive ✓</span>
              <span>SEO Optimized ✓</span>
            </div>
            <div className="bg-emerald-500 text-white rounded-lg p-2 text-center">
              <p className="text-xs font-semibold">Live Website Preview</p>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2">Technologies We Use:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs font-medium text-emerald-700">React.js</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs font-medium text-emerald-700">Next.js</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs font-medium text-emerald-700">WordPress</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs font-medium text-emerald-700">Shopify</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-emerald-200 rounded-lg p-3">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2">Recent Projects:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">E-commerce Store</span>
                  <span className="text-xs text-emerald-600">+150% sales</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">Corporate Website</span>
                  <span className="text-xs text-emerald-600">+200% traffic</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">SaaS Platform</span>
                  <span className="text-xs text-emerald-600">+300% users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mobile',
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Apps",
      subtitle: "iOS & Android",
      description: "Native apps that users love and engage with daily",
      color: "#8B5CF6",
      bgColor: "bg-violet-500",
      notifications: notifications.mobile,
      demoContent: (
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-violet-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-violet-800 mb-2">Mobile App Development</h3>
              <p className="text-sm text-violet-700 mb-3">
                Build powerful native and cross-platform mobile apps that engage users and drive business growth.
              </p>
              <div className="space-y-2 text-xs text-violet-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                  Native iOS & Android development
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                  Cross-platform with React Native
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                  App Store optimization
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                  Push notifications & analytics
                </div>
              </div>
            </div>
            
            <div className="bg-violet-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-violet-500 rounded-lg"></div>
                <div className="text-xs text-violet-600">Your App</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 bg-violet-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-violet-600 font-semibold">📱 iOS & Android Ready</p>
            </div>
            
            <div className="bg-violet-50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold text-violet-800 text-sm mb-2">App Development Process:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs mr-2">1</div>
                  <span className="text-xs text-violet-700">Strategy & Planning</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs mr-2">2</div>
                  <span className="text-xs text-violet-700">UI/UX Design</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs mr-2">3</div>
                  <span className="text-xs text-violet-700">Development & Testing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs mr-2">4</div>
                  <span className="text-xs text-violet-700">App Store Launch</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-violet-200 rounded-lg p-3">
              <h4 className="font-semibold text-violet-800 text-sm mb-2">App Categories:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-violet-50 rounded p-2 text-center">
                  <p className="text-xs font-medium text-violet-700">E-commerce</p>
                </div>
                <div className="bg-violet-50 rounded p-2 text-center">
                  <p className="text-xs font-medium text-violet-700">Social Media</p>
                </div>
                <div className="bg-violet-50 rounded p-2 text-center">
                  <p className="text-xs font-medium text-violet-700">Healthcare</p>
                </div>
                <div className="bg-violet-50 rounded p-2 text-center">
                  <p className="text-xs font-medium text-violet-700">Education</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'leads',
      icon: <Target className="w-6 h-6" />,
      title: "Lead Automation",
      subtitle: "Sales Pipeline",
      description: "Convert website visitors into loyal paying customers",
      color: "#F59E0B",
      bgColor: "bg-amber-500",
      notifications: notifications.leads,
      demoContent: (
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-amber-800 mb-2">Lead Automation System</h3>
              <p className="text-sm text-amber-700 mb-3">
                Automate your sales funnel and convert more visitors into customers with intelligent lead nurturing.
              </p>
              <div className="space-y-2 text-xs text-amber-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Automated email sequences
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Lead scoring & qualification
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  CRM integration
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Real-time analytics
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-6 h-6 bg-amber-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs">Visitor</p>
              </div>
              <ArrowRight className="w-3 h-3 text-amber-500" />
              <div className="text-center">
                <div className="w-6 h-6 bg-amber-400 rounded-full mx-auto mb-1 animate-pulse"></div>
                <p className="text-xs">Lead</p>
              </div>
              <ArrowRight className="w-3 h-3 text-amber-500" />
              <div className="text-center">
                <div className="w-6 h-6 bg-amber-600 rounded-full mx-auto mb-1"></div>
                <p className="text-xs">Customer</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-xs text-amber-700">+127 new leads this week 📈</p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold text-amber-800 text-sm mb-2">Automation Features:</h4>
              <div className="space-y-3">
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-amber-700">Smart Forms</p>
                  <p className="text-xs text-gray-600">Dynamic forms that adapt to user behavior</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-amber-700">Email Drip Campaigns</p>
                  <p className="text-xs text-gray-600">Personalized email sequences</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-medium text-amber-700">Lead Tracking</p>
                  <p className="text-xs text-gray-600">Monitor lead journey in real-time</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-amber-200 rounded-lg p-3">
              <h4 className="font-semibold text-amber-800 text-sm mb-2">Success Metrics:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Conversion Rate</span>
                  <span className="text-xs text-amber-600 font-bold">+45%</span>
                </div>
                <div className="h-1 bg-amber-100 rounded-full">
                  <div className="h-1 bg-amber-500 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Lead Quality Score</span>
                  <span className="text-xs text-amber-600 font-bold">8.7/10</span>
                </div>
                <div className="h-1 bg-amber-100 rounded-full">
                  <div className="h-1 bg-amber-500 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate battery charging based on user engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.min(100, prev + Math.random() * 2))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mouse movement for phone rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (phoneRef.current) {
        const rect = phoneRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const rotateX = ((e.clientY - centerY) / rect.height) * 10
        const rotateY = ((e.clientX - centerX) / rect.width) * 10
        setPhoneRotation({ x: -rotateX, y: rotateY })
      }
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener('mousemove', handleMouseMove)
      return () => section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Shake to unlock functionality
  useEffect(() => {
    let lastTime = 0
    let shakeTimeout: NodeJS.Timeout

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (isUnlocked) return

      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return

      const currentTime = Date.now()
      if (currentTime - lastTime < 100) return
      lastTime = currentTime

      const deltaX = Math.abs(acceleration.x! - lastAcceleration.current.x)
      const deltaY = Math.abs(acceleration.y! - lastAcceleration.current.y)
      const deltaZ = Math.abs(acceleration.z! - lastAcceleration.current.z)

      const totalDelta = deltaX + deltaY + deltaZ

      if (totalDelta > shakeThreshold) {
        setIsShaking(true)
        setShakeIntensity(Math.min(totalDelta / 5, 10))
        setShakeCount(prev => {
          const newCount = prev + 1
          if (newCount >= 3) {
            // Unlock after 3 shakes
            setTimeout(() => {
              setIsUnlocked(true)
              setShakeCount(0)
              setIsShaking(false)
            }, 500)
          }
          return newCount
        })

        // Clear shake timeout
        clearTimeout(shakeTimeout)
        shakeTimeout = setTimeout(() => {
          setIsShaking(false)
          setShakeIntensity(0)
          // Reset shake count if user stops shaking
          setTimeout(() => setShakeCount(0), 2000)
        }, 300)
      }

      lastAcceleration.current = {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0
      }
    }

    // Request device motion permission (iOS 13+)
    const requestPermission = async () => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion, true)
          }
        } catch (error) {
          console.log('Device motion permission denied')
        }
      } else {
        // For Android and older iOS
        window.addEventListener('devicemotion', handleDeviceMotion, true)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion, true)
      clearTimeout(shakeTimeout)
    }
  }, [isUnlocked])
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Handle swipe to unlock (fallback for desktop)
  const handleUnlockSwipe = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isUnlocked) {
      setSwipeProgress(100)
      setTimeout(() => {
        setIsUnlocked(true)
        setSwipeProgress(0)
      }, 300)
    }
  }

  // Handle permission request for device motion
  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission === 'granted') {
          // Permission granted, shake detection will work
          console.log('Motion permission granted')
        }
      } catch (error) {
        console.log('Motion permission denied')
      }
    }
  }

  const handleAppClick = (appId: string) => {
    if (isUnlocked) {
      setActiveApp(activeApp === appId ? null : appId)
      // Remove notification when app is opened
      setNotifications(prev => ({ ...prev, [appId]: 0 }))
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getBatteryColor = () => {
    if (batteryLevel > 50) return '#10B981'
    if (batteryLevel > 20) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-16 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #1E2A38 0%, #2A3F54 50%, #1E2A38 100%)`,
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-blue-500 to-purple-500 top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 bottom-1/4 right-1/4 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-6 py-3 rounded-full border backdrop-blur-xl mb-8"
               style={{
                 background: 'rgba(0, 180, 216, 0.1)',
                 borderColor: 'rgba(0, 180, 216, 0.3)'
               }}>
            <Smartphone className="w-5 h-5 mr-3" style={{ color: '#00B4D8' }} />
            <span className="font-medium" style={{ color: '#00B4D8' }}>Interactive Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ color: '#F5F7FA' }}>Experience Our</span>
            <br />
            <span style={{
              background: `linear-gradient(135deg, #00B4D8 0%, #FFBE0B 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Digital Solutions
            </span>
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ color: '#F5F7FA', opacity: 0.9 }}>
            Interact with our virtual phone to explore each service. 
            {!isUnlocked ? ' 🤳 Shake your phone or swipe to unlock and discover what we can build for you!' : ' Tap any app to see it in action!'}
          </p>
        </div>

        {/* Virtual Phone */}
        <div className="flex justify-center items-center">
          <div 
            ref={phoneRef}
            className={`relative transition-transform duration-300 ease-out ${isShaking ? 'animate-bounce' : ''}`}
            style={{
              transform: `perspective(1000px) rotateX(${phoneRotation.x}deg) rotateY(${phoneRotation.y}deg) ${isShaking ? `translate(${Math.random() * shakeIntensity - shakeIntensity/2}px, ${Math.random() * shakeIntensity - shakeIntensity/2}px)` : ''}`,
            }}
          >
            {/* Phone Frame */}
            <div 
              className="relative w-80 h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Screen */}
              <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-black z-20 flex items-center justify-between px-6 text-white text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{formatTime(currentTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <div className="flex items-center">
                      <span className="text-xs mr-1">{Math.round(batteryLevel)}%</span>
                      <Battery 
                        className="w-4 h-4" 
                        style={{ color: getBatteryColor() }}
                        fill={batteryLevel > 20 ? getBatteryColor() : 'none'}
                      />
                    </div>
                  </div>
                </div>

                {/* Screen Content */}
                <div className="absolute inset-0 pt-8 bg-gradient-to-b from-slate-900 to-slate-800">
                  {!isUnlocked ? (
                    // Lock Screen
                    <div className="flex flex-col items-center justify-center h-full text-white relative">
                      <div className="text-center mb-16">
                        <div className="text-4xl font-light mb-2">{formatTime(currentTime)}</div>
                        <div className="text-lg opacity-70">
                          {currentTime.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>

                      {/* Shake Progress Indicator */}
                      {shakeCount > 0 && !isUnlocked && (
                        <div className="absolute top-20 left-6 right-6">
                          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <Smartphone className="w-5 h-5 text-blue-400 animate-bounce" />
                              <span className="text-white font-medium">Keep Shaking!</span>
                            </div>
                            <div className="flex justify-center space-x-2">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    i < shakeCount ? 'bg-blue-500' : 'bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-white/70 mt-2">
                              {3 - shakeCount} more shake{3 - shakeCount !== 1 ? 's' : ''} to unlock
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notifications */}
                      <div className="space-y-2 mb-16 w-full px-6">
                        <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">AI Integration</p>
                              <p className="text-xs opacity-70">Smart automation ready to deploy</p>
                            </div>
                            {notifications.ai > 0 && (
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">{notifications.ai}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Swipe to Unlock / Enable Motion */}
                      <div className="absolute bottom-8 left-6 right-6 space-y-3">
                        {/* Motion Permission Button (iOS) */}
                        {typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
                          <button
                            onClick={requestMotionPermission}
                            className="w-full h-12 bg-blue-500/80 backdrop-blur-xl rounded-2xl border border-blue-400/30 text-white font-medium text-sm"
                          >
                            📱 Enable Shake to Unlock
                          </button>
                        )}
                        
                        <div 
                          className="relative h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden cursor-pointer"
                          onClick={handleUnlockSwipe}
                          onTouchEnd={handleUnlockSwipe}
                        >
                          <div 
                          className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-[#00D4FF] to-[#00C4FF] transition-transform duration-300"
                            style={{ transform: `translateX(${swipeProgress - 100}%)` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center space-x-4 text-white p-4">
                              <Lock className="w-5 h-5" />
                              <span className="font-medium text-center">
                                 Shake your phone or tap to unlock
                              </span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Home Screen
                    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 p-6">
                      {activeApp ? (
                        // App View
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <button 
                              onClick={() => setActiveApp(null)}
                              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                            >
                              <ArrowRight className="w-4 h-4 rotate-180" />
                              <span className="text-sm">Back</span>
                            </button>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <Home className="w-5 h-5 text-white/70" />
                          </div>
                          
                          {services.find(s => s.id === activeApp) && (
                            <div className="bg-white rounded-3xl flex-1 shadow-xl overflow-hidden">
                              <div 
                                className="h-20 flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: services.find(s => s.id === activeApp)?.color }}
                              >
                                {services.find(s => s.id === activeApp)?.title}
                              </div>
                              {services.find(s => s.id === activeApp)?.demoContent}
                            </div>
                          )}
                        </div>
                      ) : (
                        // App Grid
                        <>
                          <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Webbotica Services</h2>
                            <p className="text-white/70 text-sm">Tap any app to explore our solutions</p>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-8">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className="relative cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
                                onClick={() => handleAppClick(service.id)}
                              >
                                <div 
                                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-3 relative"
                                  style={{ backgroundColor: service.color }}
                                >
                                  {service.icon}
                                  {notifications[service.id as keyof typeof notifications] > 0 && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-lg">
                                      <span className="text-xs font-bold text-white">
                                        {notifications[service.id as keyof typeof notifications]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-white text-center text-sm font-medium">{service.title}</p>
                                <p className="text-white/60 text-center text-xs">{service.subtitle}</p>
                              </div>
                            ))}
                          </div>

                          {/* Dock with AI Assistant */}
                          <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                              <div className="flex justify-center items-center space-x-5">
                                <Phone className="w-6 h-6 text-white/70" />
                                <Mail className="w-6 h-6 text-white/70" />
                                
                                {/* AI Assistant Button - Highlighted */}
                                <div className="relative">
                                  <button className="w-12 h-12 bg-gradient-to-r from-[#00C4CC] via-[#73C572] to-[#F4B800] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95">
                                    <Mic className="w-6 h-6 text-white" />
                                  </button>
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                                </div>
                                
                                <Camera className="w-6 h-6 text-white/70" />
                                <Settings className="w-6 h-6 text-white/70" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-4 px-6 py-3 rounded-full backdrop-blur-xl border"
               style={{
                 backgroundColor: 'rgba(245, 247, 250, 0.05)',
                 borderColor: 'rgba(0, 180, 216, 0.2)'
               }}>
            <Sparkles className="w-5 h-5" style={{ color: '#00B4D8' }} />
            <span className="text-white font-medium">
              {!isUnlocked ? '📱 Shake your phone or click to unlock and explore!' : 'Amazing! Now tap any app to see our solutions in action!'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VirtualPhoneExperience