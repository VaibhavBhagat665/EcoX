import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, User, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { 
    signUp, 
    signInWithEmailPassword, 
    signInWithGoogleAuth,
    sendPasswordReset,
    loading, 
    error, 
    isAuthenticated, 
    clearError 
  } = useAuth();
  const { toast } = useToast();

  // Memoize initial form state to prevent recreating object
  const initialFormState = useMemo(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  }), []);

  // Stable reset function
  const resetForm = useCallback(() => {
    setFormErrors({});
    setFormData(initialFormState);
    if (clearError) {
      clearError();
    }
  }, [initialFormState, clearError]);

  // Handle successful authentication - simplified with ref to prevent loops
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      resetForm();
      
      // Use setTimeout to prevent potential timing issues with toast
      const timeoutId = setTimeout(() => {
        toast({
          title: "Welcome to EcoX!",
          description: "You're now part of the sustainable future community",
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isOpen]); // Removed onClose and resetForm to prevent loops

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]); // Removed resetForm dependency

  // Clear errors when switching tabs
  useEffect(() => {
    setFormErrors({});
    if (clearError) {
      clearError();
    }
  }, [activeTab]); // Removed clearError dependency

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (activeTab === 'signup') {
      if (!formData.displayName) {
        errors.displayName = 'Display name is required';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, activeTab]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    setFormErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (activeTab === 'signin') {
        await signInWithEmailPassword({
          email: formData.email,
          password: formData.password
        });
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName
        });
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  }, [formData, activeTab, signInWithEmailPassword, signUp, validateForm]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithGoogleAuth();
    } catch (err) {
      console.error('Google sign-in failed:', err);
    }
  }, [signInWithGoogleAuth]);

  const handlePasswordReset = useCallback(async () => {
    if (!formData.email) {
      setFormErrors({ email: 'Please enter your email address first' });
      return;
    }

    try {
      await sendPasswordReset(formData.email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for reset instructions",
      });
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  }, [formData.email, sendPasswordReset, toast]);

  const handleSwitchTab = useCallback((tab: 'signin' | 'signup') => {
    setActiveTab(tab);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key and body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md mx-4 relative animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 glass-morphism-eco rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-3xl text-eco-primary">🌱</div>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold mb-2 text-white">
            Welcome to EcoX
          </h2>
          <p className="text-white/70">Join the sustainable future</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex glass-morphism-dark rounded-2xl p-1 mb-6" role="tablist">
          <button 
            onClick={() => handleSwitchTab('signin')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary/50 ${
              activeTab === 'signin' 
                ? 'glass-morphism-eco text-white' 
                : 'text-white/70 hover:text-white'
            }`}
            role="tab"
            aria-selected={activeTab === 'signin'}
          >
            Sign In
          </button>
          <button 
            onClick={() => handleSwitchTab('signup')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary/50 ${
              activeTab === 'signup' 
                ? 'glass-morphism-eco text-white' 
                : 'text-white/70 hover:text-white'
            }`}
            role="tab"
            aria-selected={activeTab === 'signup'}
          >
            Sign Up
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-morphism-dark rounded-lg p-3 bg-red-500/10 border border-red-500/30 mb-4">
            <p className="text-red-400 text-sm" role="alert">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="signin-email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    id="signin-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.email ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="your@email.com"
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                </div>
                {formErrors.email && (
                  <p id="email-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="signin-password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="signin-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.password ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="••••••••"
                    aria-describedby={formErrors.password ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.password && (
                  <p id="password-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full glass-morphism-eco hover:bg-eco-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handlePasswordReset}
                className="w-full text-eco-primary hover:text-eco-secondary text-sm"
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </div>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="block text-sm font-medium text-white/80 mb-2">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    id="signup-name"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.displayName ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="Enter your full name"
                    aria-describedby={formErrors.displayName ? 'name-error' : undefined}
                  />
                </div>
                {formErrors.displayName && (
                  <p id="name-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.displayName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    id="signup-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.email ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="your@email.com"
                    aria-describedby={formErrors.email ? 'signup-email-error' : undefined}
                  />
                </div>
                {formErrors.email && (
                  <p id="signup-email-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="signup-password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.password ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="Create a password"
                    aria-describedby={formErrors.password ? 'signup-password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.password && (
                  <p id="signup-password-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password" className="block text-sm font-medium text-white/80 mb-2">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 glass-morphism-dark border-none focus:ring-2 text-white placeholder-white/50 ${
                      formErrors.confirmPassword ? 'focus:ring-red-500/50' : 'focus:ring-eco-primary/50'
                    }`}
                    placeholder="Confirm your password"
                    aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.confirmPassword && (
                  <p id="confirm-password-error" className="text-red-400 text-xs mt-1" role="alert">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full glass-morphism-eco hover:bg-eco-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          )}
        </form>

        {/* Social Auth */}
        <div className="mt-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-slate text-white/60">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            type="button"
            className="w-full glass-morphism-dark hover:bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-eco-primary/50 text-white"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Chrome className="h-4 w-4 mr-2" />
            )}
            Continue with Google
          </Button>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
          aria-label="Close authentication modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
};