import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { AuthModal } from '@/components/Auth/AuthModal';

export const Header: React.FC = () => {
  const [location] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const { isListening, toggleListening, isSupported } = useVoiceAssistant();

  const navigation = [
    { name: 'Home', href: '/', id: 'home' },
    { name: 'Dashboard', href: '#dashboard', id: 'dashboard' },
    { name: 'Analytics', href: '#analytics', id: 'analytics' },
    { name: 'Community', href: '#community', id: 'community' },
  ];

  const handleNavClick = (href: string, id: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const handleVoiceToggle = () => {
    if (isSupported) {
      toggleListening();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-morphism-dark" role="banner">
        <nav className="container mx-auto px-6 py-4" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 glass-accent rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">
                  Eco<span className="text-gradient-primary">X</span>
                </span>
                <span className="text-xs text-gray-400 font-medium -mt-1">Environmental Intelligence Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, item.id)}
                  className="text-white hover:text-eco-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary/50 rounded-lg px-2 py-1"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                </button>
              ))}

              
              {/* Voice Assistant Toggle */}
              {isSupported && (
                <button 
                  onClick={handleVoiceToggle}
                  className={`glass-pro p-3 rounded-xl hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 ${
                    isListening ? 'pulse-glow border-green-400/50' : ''
                  }`}
                  aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
                  data-testid="voice-toggle"
                >
                  <svg className={`w-5 h-5 ${isListening ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}

              {/* User Profile / Auth */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="glass-pro rounded-xl px-4 py-2 flex items-center space-x-3 hover:glass-pro-hover transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                  <button 
                    onClick={signOut}
                    className="glass-pro p-3 rounded-xl hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-400 hover:text-white" 
                    aria-label="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="btn-primary px-5"
                  aria-label="Sign in to EcoX"
                >
                  <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden glass-pro p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 hover:glass-pro-hover transition-all duration-300" 
              aria-label="Toggle mobile menu"
              aria-expanded={showMobileMenu}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-6 glass-pro rounded-2xl p-6 animate-fade-up">
              <div className="space-y-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href, item.id)}
                    className="block w-full text-left px-4 py-3 text-white hover:text-green-400 hover:bg-white/5 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 font-medium"
                  >
                    {item.name}
                  </button>
                ))}
                
                <div className="border-t border-white/10 pt-4 mt-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{user?.displayName || 'User'}</span>
                          <span className="text-xs text-gray-400">Online</span>
                        </div>
                      </div>
                      <button 
                        onClick={signOut}
                        className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuth(true);
                        setShowMobileMenu(false);
                      }}
                      className="btn-primary w-full"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </>
  );
};
