/**
 * Token Display component for header
 * Shows ECO token logo and balance with click to navigate to tokens page
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/lib/api';
import { Coins, Loader2 } from 'lucide-react';

interface TokenDisplayProps {
  onClick?: () => void;
}

export function TokenDisplay({ onClick }: TokenDisplayProps) {
  const { isAuthenticated, user } = useAuth();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadBalance() {
      if (!isAuthenticated || !user) return;

      setIsLoading(true);
      try {
        // Try to get balance from user profile or API
        if (user.uid) {
          // Use user ID to get token balance from database
          try {
            const response = await getTokenBalance(user.uid);
            setBalance(response.balance || '0');
          } catch (apiError) {
            // If API fails, check if user has walletAddress
            if ((user as any).walletAddress) {
              const response = await getTokenBalance((user as any).walletAddress);
              setBalance(response.balance || '0');
            } else {
              // Default to 0 for new users without wallet
              setBalance('0');
            }
          }
        } else {
          setBalance('0');
        }
      } catch (error) {
        console.error('Failed to load token balance:', error);
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    }

    loadBalance();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return null; // Don't show tokens for unauthenticated users
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 glass-pro px-4 py-2 rounded-xl hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 group"
      aria-label="View ECO Tokens"
    >
      {/* ECO Token Logo */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">E</span>
        </div>
        {/* Animated ring for premium feel */}
        <div className="absolute inset-0 w-8 h-8 border-2 border-green-400/30 rounded-full animate-pulse"></div>
      </div>

      {/* Token Count */}
      <div className="flex items-center space-x-1">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
        ) : (
          <>
            <span className="text-white font-semibold text-sm group-hover:text-green-400 transition-colors">
              {parseFloat(balance).toLocaleString()}
            </span>
            <span className="text-green-400 text-xs font-medium">ECO</span>
          </>
        )}
      </div>

      {/* Subtle hover indicator */}
      <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}

export default TokenDisplay;
