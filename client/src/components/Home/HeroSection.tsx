import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface HeroStats {
  carbonReduced: string;
  activeUsers: string;
  energySaved: string;
}

export const HeroSection: React.FC = () => {
  const [stats, setStats] = useState<HeroStats>({
    carbonReduced: '2.5M',
    activeUsers: '150K+',
    energySaved: '98%'
  });

  // Simulate real-time stat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        carbonReduced: `${(2.5 + Math.random() * 0.1).toFixed(1)}M`,
        activeUsers: `${Math.floor(150 + Math.random() * 10)}K+`,
        energySaved: `${Math.floor(97 + Math.random() * 3)}%`
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartExploring = () => {
    const dashboardSection = document.getElementById('dashboard');
    dashboardSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    console.log('Opening demo...');
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black -mt-20 pt-20"
      id="home"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70 brightness-125 contrast-110"
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        >
          {/* Multiple source formats for better browser compatibility */}
          <source src="https://cdn.pixabay.com/video/2025/06/03/283533_large.mp4" type="video/mp4" />
          
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        
        {/* Dark overlay to ensure text readability - reduced opacity */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Optional: Gradient overlay for additional styling - reduced opacity */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30"></div>
      </div>

      {/* Enhanced Background Effects (now on top of video) */}
      <div className="absolute inset-0 z-10">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Geometric Shapes - reduced opacity to work with video */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-green-400/5 to-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-blue-500/3 to-cyan-500/3 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Moving Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Hero Content - proper spacing for header overlap */}
      <div className="relative z-20 text-center max-w-7xl mx-auto px-6 pt-0 pb-20">
        <div className="slide-up">
          {/* Status Badge - no extra margin needed now */}
          <div className="inline-flex px-8 py-4 mb-12">
            {/* <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Environmental Intelligence Platform</span>
            <div className="px-3 py-1 bg-green-400/20 text-green-400 text-xs font-bold rounded-full">LIVE</div> */}
          </div>

          {/* Main Title */}
          <div className="mb-8">
            <h1 className="heading-xl mb-4 font-black">
              <span className="text-white inline">Eco</span><span className="text-gradient-primary inline">X</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mb-6 rounded-full"></div>
          </div>
          
          {/* Subtitle */}
          <div className="mb-16 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed drop-shadow-lg">
              Harness the power of <span className="text-green-400 font-semibold">AI-driven insights</span>, 
              <span className="text-blue-400 font-semibold"> real-time monitoring</span>, and 
              <span className="text-purple-400 font-semibold"> immersive 3D visualizations</span> to build a sustainable future.
            </p>
            
            {/* Key Features */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              {['AI Analytics', 'Real-time Data', '3D Visualization', 'Carbon Tracking'].map((feature, index) => (
                <div 
                  key={feature}
                  className="glass-pro px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-green-400 hover:border-green-400/50 transition-all duration-300 cursor-default backdrop-blur-md"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {feature}
                </div>
              ))}
            </div> */}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <button
              onClick={handleStartExploring}
              className="btn-primary text-lg px-10 py-5 font-bold backdrop-blur-sm"
            >
              <span className="flex items-center">
                Start Exploring
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button
              onClick={handleWatchDemo}
              className="btn-secondary text-lg px-10 py-5 font-semibold backdrop-blur-md"
            >
              <span className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 001 1h4M9 10V9a1 1 0 011-1h4a1 1 0 011 1v1m-4 5.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Live Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                value: stats.carbonReduced, 
                label: 'Tons CO₂ Reduced', 
                sublabel: 'Global Impact',
                icon: '🌱',
                color: 'green',
                trend: '+12.3%'
              },
              { 
                value: stats.activeUsers, 
                label: 'Active Users', 
                sublabel: 'Worldwide Community',
                icon: '👥',
                color: 'blue',
                trend: '+8.7%'
              },
              { 
                value: stats.energySaved, 
                label: 'Efficiency Improvement', 
                sublabel: 'Average User Impact',
                icon: '⚡',
                color: 'purple',
                trend: '+2.1%'
              }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="interactive-card group backdrop-blur-md"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                {/* Icon */}
                <div className="text-4xl mb-4">{stat.icon}</div>
                
                {/* Main Value */}
                <div className="stats-counter mb-2">{stat.value}</div>
                
                {/* Trend */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  stat.color === 'green' ? 'bg-green-400/20 text-green-400' :
                  stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                  'bg-purple-400/20 text-purple-400'
                }`}>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {stat.trend}
                </div>
                
                {/* Labels */}
                <div className="space-y-1">
                  <div className="text-white font-semibold text-lg">{stat.label}</div>
                  <div className="text-gray-400 text-sm">{stat.sublabel}</div>
                </div>
                
                {/* Progress Indicator */}
                <div className="progress-bar h-2 mt-4">
                  <div 
                    className="progress-fill transition-all duration-1000 ease-out"
                    style={{ 
                      width: stat.color === 'green' ? '75%' : stat.color === 'blue' ? '82%' : '98%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center text-gray-400">
              <span className="text-xs uppercase tracking-wide mb-2">Scroll to explore</span>
              <div className="w-px h-8 bg-gradient-to-b from-green-400 to-transparent animate-pulse"></div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 border border-green-400/30 rounded-full animate-rotate-slow z-30"></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 border border-blue-400/30 rounded-lg animate-float z-30"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-purple-400/30 rounded-full animate-pulse z-30"></div>
    </section>
  );
};