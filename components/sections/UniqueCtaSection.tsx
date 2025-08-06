import React, { useState } from 'react';

const UniqueCtaSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative bg-[#1E2A38] py-24 px-6 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00B4D8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#FFBE0B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-full mb-8">
          <div className="w-2 h-2 bg-[#00B4D8] rounded-full mr-3"></div>
          <span className="text-[#00B4D8] text-sm font-medium tracking-wide">DIGITAL ARCHITECTS</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="text-[#F5F7FA]">Ready to </span>
          <span className="text-[#00B4D8]">Automate</span>
          <br />
          <span className="bg-gradient-to-r from-[#FFBE0B] to-[#00B4D8] bg-clip-text text-transparent">
            Your Business?
          </span>
        </h2>

        <p className="text-[#F5F7FA]/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Stop doing repetitive tasks manually. Let AI handle your workflows 
          while you focus on what matters most.
        </p>

        {/* Single Powerful CTA */}
        <div className="relative inline-block">
          <button 
            className="group relative px-8 py-4 bg-[#00B4D8] hover:bg-[#00B4D8]/90 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animated Background Shine */}
            <div className={`
              absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
              transform transition-transform duration-700
              ${isHovered ? 'translate-x-full' : '-translate-x-full'}
            `}></div>

            {/* Button Content */}
            <div className="relative flex items-center gap-4">
              <div className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${isHovered ? 'bg-[#FFBE0B] scale-125' : 'bg-[#F5F7FA] scale-100'}
              `}></div>
              
              <span className="text-[#F5F7FA] text-lg font-semibold">
                Start Your Automation Journey
              </span>
              
              <svg 
                className={`w-5 h-5 text-[#F5F7FA] transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Simple Trust Line */}
        <p className="mt-8 text-[#F5F7FA]/60 text-sm">
          Setup in 24 hours • Enterprise security • No hidden fees
        </p>
      </div>
    </div>
  );
};

export default UniqueCtaSection;