'use client'

import React, { useState, useEffect } from 'react'

interface WorkflowStep {
  id: number
  name: string
  icon: React.ReactNode
  description: string
  details: string
  duration: number
  status: 'pending' | 'active' | 'completed'
  visual: React.ReactNode
  metrics: {
    before: string
    after: string
    improvement: string
  }
}

const WorkflowAutomationDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 1,
      name: 'Lead Capture',
      icon: <div className="w-8 h-8 bg-[#00B4D8] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/>
        </svg>
      </div>,
      description: 'Intelligent form processing and data extraction',
      details: 'Enterprise client Sarah from TechStart Inc submits inquiry',
      duration: 0,
      status: 'pending',
      visual: <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        <div className="w-14 h-14 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-[#00B4D8] to-[#0096C7] rounded-full animate-pulse w-full"></div>
          </div>
          <div className="text-sm font-medium text-slate-700">Contact information captured</div>
          <div className="text-xs text-slate-500">Processing enterprise inquiry...</div>
        </div>
      </div>,
      metrics: {
        before: '2-4 hours manual review',
        after: 'Instant processing',
        improvement: '99% faster response'
      }
    },
    {
      id: 2,
      name: 'AI Analysis',
      icon: <div className="w-8 h-8 bg-[#0077B6] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>,
      description: 'Advanced lead scoring and qualification',
      details: 'High-value enterprise lead identified: 96% conversion probability',
      duration: 2,
      status: 'pending',
      visual: <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Lead Quality Score</span>
          <span className="text-lg font-bold text-emerald-600">96%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full w-[96%] shadow-sm"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="text-xs font-medium text-emerald-700">Budget Range</div>
            <div className="text-sm font-bold text-emerald-800">$250K - $500K</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="text-xs font-medium text-blue-700">Decision Timeline</div>
            <div className="text-sm font-bold text-blue-800">Q1 2025</div>
          </div>
        </div>
      </div>,
      metrics: {
        before: '45 min manual research',
        after: '2 seconds AI analysis',
        improvement: '1,350x faster'
      }
    },
    {
      id: 3,
      name: 'CRM Integration',
      icon: <div className="w-8 h-8 bg-[#023E8A] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd"/>
        </svg>
      </div>,
      description: 'Seamless data synchronization across platforms',
      details: 'Contact profile created, opportunity logged, team alerted',
      duration: 1,
      status: 'pending',
      visual: <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-3">
          {[
            { task: 'Contact profile created', status: 'completed' },
            { task: 'Deal opportunity registered', status: 'completed' },
            { task: 'Sales team notification sent', status: 'completed' }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700 flex-1">{item.task}</span>
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          ))}
        </div>
      </div>,
      metrics: {
        before: '20 min manual data entry',
        after: '1 second automation',
        improvement: '1,200x efficiency gain'
      }
    },
    {
      id: 4,
      name: 'Personalized Outreach',
      icon: <div className="w-8 h-8 bg-[#0096C7] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
        </svg>
      </div>,
      description: 'AI-crafted communication with personal touch',
      details: 'Tailored enterprise proposal email with demo scheduling',
      duration: 3,
      status: 'pending',
      visual: <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-full flex items-center justify-center">
            <span className="text-sm text-white font-bold">AI</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Enterprise Solutions Team</div>
            <div className="text-xs text-slate-500">sarah.johnson@techstart.com</div>
          </div>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed mb-3 p-3 bg-slate-50 rounded-lg">
          "Hi Sarah, I noticed TechStart's recent expansion into European markets. Our enterprise platform has helped similar companies scale their operations by 300%..."
        </div>
        <div className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] p-3 rounded-lg text-center">
          <span className="text-white font-semibold text-sm">Schedule Enterprise Demo</span>
        </div>
      </div>,
      metrics: {
        before: 'Next day manual response',
        after: '3 seconds AI generation',
        improvement: '99.7% faster delivery'
      }
    },
    {
      id: 5,
      name: 'Smart Assignment',
      icon: <div className="w-8 h-8 bg-[#48CAE4] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      </div>,
      description: 'Optimal representative matching algorithm',
      details: 'Alex Chen (Enterprise Specialist) assigned with full context',
      duration: 1,
      status: 'pending',
      visual: <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-800">Alex Chen</div>
            <div className="text-xs text-slate-500 mb-1">Enterprise Solutions Specialist</div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600">97% close rate</span>
            </div>
          </div>
        </div>
      </div>,
      metrics: {
        before: 'Random assignment',
        after: 'AI-optimized matching',
        improvement: '45% higher conversion'
      }
    },
    {
      id: 6,
      name: 'Meeting Scheduled',
      icon: <div className="w-8 h-8 bg-[#90E0EF] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      </div>,
      description: 'Automated calendar coordination',
      details: '45-min enterprise demo confirmed for Tuesday, 3:00 PM EST',
      duration: 300,
      status: 'pending',
      visual: <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-800">Enterprise Platform Demo</div>
          <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Confirmed</div>
        </div>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            <span>Tuesday, February 6th • 3:00 PM - 3:45 PM EST</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/>
            </svg>
            <span>Sarah Johnson (TechStart) & Alex Chen (Enterprise Team)</span>
          </div>
        </div>
      </div>,
      metrics: {
        before: '5-7 email back-and-forth',
        after: 'One-click scheduling',
        improvement: '3 days faster booking'
      }
    }
  ])

  const [totalTime, setTotalTime] = useState(0)

  useEffect(() => {
    if (!isActive || isPaused) return

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % (workflowSteps.length + 2)
        
        setWorkflowSteps(prevSteps => 
          prevSteps.map((step, index) => ({
            ...step,
            status: index < nextStep ? 'completed' : index === nextStep ? 'active' : 'pending'
          }))
        )

        if (nextStep > 0 && nextStep <= workflowSteps.length) {
          const completedSteps = workflowSteps.slice(0, nextStep)
          const timeInSeconds = completedSteps.reduce((acc, step) => acc + step.duration, 0)
          setTotalTime(timeInSeconds)
        } else if (nextStep === 0) {
          setTotalTime(0)
        }

        return nextStep
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [isActive, isPaused, workflowSteps.length])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const getStepClasses = (step: WorkflowStep) => {
    switch (step.status) {
      case 'active':
        return 'border-[#00B4D8] bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl shadow-[#00B4D8]/20 scale-105 ring-2 ring-[#00B4D8]/30'
      case 'completed':
        return 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-200/30'
      default:
        return 'border-slate-200 bg-white hover:shadow-md'
    }
  }

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-8 py-3 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] hover:from-[#0077B6] hover:to-[#023E8A] text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              <span>Resume Demo</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>Pause Demo</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
          <span>{showMetrics ? 'Hide' : 'Show'} Performance</span>
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">AI Workflow Engine</h3>
            <p className="text-slate-600">Enterprise-grade automation in action</p>
            <div className="text-sm text-slate-500 mt-1">Processing step {Math.max(currentStep, 1)} of {workflowSteps.length}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00B4D8] to-[#0077B6] bg-clip-text text-transparent">{formatTime(totalTime)}</div>
            <div className="text-sm text-slate-500">Total Processing Time</div>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-4 mb-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-[#00B4D8] via-[#0077B6] to-[#023E8A] h-4 rounded-full transition-all duration-1000 shadow-sm"
            style={{ width: `${(currentStep / workflowSteps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 font-medium">Lead Captured</span>
          <span className={`font-semibold ${currentStep >= workflowSteps.length ? 'text-emerald-600' : 'text-[#00B4D8]'}`}>
            {currentStep >= workflowSteps.length ? 'Workflow Complete!' : 'Processing...'}
          </span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid gap-6 lg:grid-cols-2">
        {workflowSteps.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-2xl border-2 p-6 transition-all duration-500 hover:shadow-lg ${getStepClasses(step)}`}
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className={`transition-all duration-300 ${
                step.status === 'active' ? 'animate-pulse' : ''
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{step.name}</h4>
                <p className="text-slate-600 text-sm mb-2 leading-relaxed">{step.description}</p>
                {step.status !== 'pending' && (
                  <p className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full inline-block font-medium">
                    {step.details}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium mb-2">{formatTime(step.duration)}</div>
                <div>
                  {step.status === 'completed' && (
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-7 h-7 bg-[#00B4D8] rounded-full flex items-center justify-center animate-spin shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-7 h-7 bg-slate-300 rounded-full shadow-sm"></div>
                  )}
                </div>
              </div>
            </div>
            
            {step.status !== 'pending' && (
              <div className="mt-4">
                {step.visual}
              </div>
            )}
            
            {showMetrics && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="text-red-600 font-semibold mb-1">Before AI</div>
                    <div className="text-slate-600">{step.metrics.before}</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="text-emerald-600 font-semibold mb-1">With AI</div>
                    <div className="text-slate-600">{step.metrics.after}</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                    {step.metrics.improvement}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {currentStep >= workflowSteps.length && (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">Enterprise Workflow Complete!</h3>
            <p className="text-slate-600 text-lg">From website visitor to qualified demo in {formatTime(totalTime)}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-emerald-200 shadow-lg">
              <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Automated Process</div>
              <div className="text-xs text-slate-500">Zero manual intervention required</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-blue-200 shadow-lg">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00B4D8] to-[#0077B6] bg-clip-text text-transparent mb-2">{formatTime(totalTime)}</div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Total Processing Time</div>
              <div className="text-xs text-slate-500">Enterprise-grade speed</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-purple-200 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">96%</div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Lead Quality Score</div>
              <div className="text-xs text-slate-500">AI-powered qualification</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PremiumAISolutions: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-slate-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-3 px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-white">Live AI Demonstration</span>
              <div className="w-1 h-1 rounded-full bg-white/50"></div>
              <span className="text-xs text-white/70">Interactive Experience</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8">
              <span className="block text-white mb-2">Experience Our</span>
              <span className="block bg-gradient-to-r from-[#00B4D8] via-[#0077B6] to-[#023E8A] bg-clip-text text-transparent">
                Digital Solutions
              </span>
            </h1>
            
            <p className="text-base sm:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed text-white/80 mb-8 sm:mb-10 px-4">
              Interact with our virtual phone to explore each service. Tap any app to see it in action!
              Watch AI automatically transform website visitors into qualified leads with enterprise-grade precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] hover:from-[#0077B6] hover:to-[#023E8A] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Start Free Trial
              </button>
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-xl font-semibold transition-all duration-300 bg-white/5 backdrop-blur-sm">
                Schedule Demo
              </button>
            </div>
          </div>

          {/* Main Demo Container */}
          <div className="rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-8 lg:p-12 bg-white/95 backdrop-blur-sm shadow-2xl mx-2 sm:mx-0">
            
            {/* Demo Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-800">AI Workflow Engine</h2>
                  <p className="text-sm sm:text-lg text-slate-600">Enterprise automation in real-time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs sm:text-sm font-semibold text-emerald-700">Live Processing</span>
              </div>
            </div>

            {/* Live Demo Area */}
            <WorkflowAutomationDemo isActive={true} />
          </div>

          {/* Benefits Section */}
          <div className="mt-12 sm:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">Lightning Fast Processing</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Complete enterprise workflows in seconds, not hours. AI-powered automation delivers instant results.</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">Perfect Accuracy</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">AI-driven precision ensures zero errors and captures every opportunity with intelligent qualification.</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">24/7 Operation</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Continuous operation ensures your business never sleeps, capturing leads around the clock.</p>
            </div>
          </div>

          {/* ROI Section */}
          <div className="mt-12 sm:mt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16 text-white shadow-2xl mx-2 sm:mx-0">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">Enterprise Results</h3>
              <p className="text-base sm:text-xl lg:text-2xl text-slate-300">Measurable impact on your business performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-emerald-400 mb-2 sm:mb-3">97%</div>
                <div className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Time Reduction</div>
                <div className="text-xs sm:text-sm text-slate-400">From 6 hours to 5 minutes per lead</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00B4D8] mb-2 sm:mb-3">5x</div>
                <div className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Lead Generation</div>
                <div className="text-xs sm:text-sm text-slate-400">Never miss a high-value opportunity</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-purple-400 mb-2 sm:mb-3">45%</div>
                <div className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Higher Conversion</div>
                <div className="text-xs sm:text-sm text-slate-400">AI-optimized lead matching</div>
              </div>
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white rounded-xl font-bold hover:from-[#0077B6] hover:to-[#023E8A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg">
                Start Your Enterprise Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumAISolutions