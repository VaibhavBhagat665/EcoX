/**
 * WalletConnect component for EcoX
 * Handles wallet connection, displays balance, and manages wallet state
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Copy, ExternalLink, Loader2 } from 'lucide-react';
import {
  connectMetaMask,
  getConnectedAccounts,
  isMetaMaskAvailable,
  onAccountsChanged,
  readTokenBalance,
  formatAddress,
} from '@/lib/web3';

interface WalletState {
  address: string | null;
  balance: string;
  isConnecting: boolean;
  isLoadingBalance: boolean;
}

export function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnecting: false,
    isLoadingBalance: false,
  });

  const [showBalance, setShowBalance] = useState(false);

  // Initialize wallet state
  useEffect(() => {
    async function initializeWallet() {
      if (!isMetaMaskAvailable()) return;

      try {
        const accounts = await getConnectedAccounts();
        if (accounts.length > 0) {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
          loadBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    }

    initializeWallet();

    // Listen for account changes
    const cleanup = onAccountsChanged((accounts) => {
      if (accounts.length > 0) {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
        loadBalance(accounts[0]);
      } else {
        setWallet(prev => ({ ...prev, address: null, balance: '0' }));
      }
    });

    return cleanup;
  }, []);

  // Load token balance
  const loadBalance = async (address: string) => {
    setWallet(prev => ({ ...prev, isLoadingBalance: true }));
    
    try {
      const balance = await readTokenBalance(address);
      setWallet(prev => ({ 
        ...prev, 
        balance: balance,
        isLoadingBalance: false 
      }));
    } catch (error) {
      console.error('Failed to load balance:', error);
      setWallet(prev => ({ 
        ...prev, 
        balance: '0',
        isLoadingBalance: false 
      }));
    }
  };

  // Connect wallet
  const handleConnect = async () => {
    if (!isMetaMaskAvailable()) {
      alert('MetaMask is required. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const address = await connectMetaMask();
      if (address) {
        setWallet(prev => ({ ...prev, address, isConnecting: false }));
        loadBalance(address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        alert('Address copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (wallet.address) {
      window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
    }
  };

  // Refresh balance
  const refreshBalance = () => {
    if (wallet.address) {
      loadBalance(wallet.address);
    }
  };

  if (!wallet.address) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={wallet.isConnecting}
        className="wallet-connect-btn"
        variant="outline"
      >
        {wallet.isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="wallet-connected flex items-center gap-2">
      {/* Balance Badge */}
      <Badge 
        variant="secondary" 
        className={`balance-badge cursor-pointer transition-all duration-300 ${
          wallet.isLoadingBalance ? 'animate-pulse' : ''
        } ${parseFloat(wallet.balance) > 0 ? 'bg-green-100 text-green-800 shadow-lg' : ''}`}
        onClick={() => setShowBalance(!showBalance)}
      >
        {wallet.isLoadingBalance ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <span className="token-icon mr-1">🌱</span>
        )}
        {wallet.balance} ECO
      </Badge>

      {/* Address Badge */}
      <Badge 
        variant="outline" 
        className="address-badge cursor-pointer"
        onClick={copyAddress}
      >
        <Wallet className="mr-1 h-3 w-3" />
        {formatAddress(wallet.address)}
        <Copy className="ml-1 h-3 w-3" />
      </Badge>

      {/* Wallet Details Popover */}
      {showBalance && (
        <Card className="absolute top-full right-0 mt-2 z-50 w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Wallet Details</h3>
                <p className="text-sm text-muted-foreground">
                  {formatAddress(wallet.address, 8)}
                </p>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">ECO Balance:</span>
                  <div className="flex items-center gap-1">
                    {wallet.isLoadingBalance ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshBalance}
                        className="h-6 w-6 p-0"
                      >
                        🔄
                      </Button>
                    )}
                  </div>
                </div>
                <div className={`text-2xl font-bold text-center ${
                  parseFloat(wallet.balance) > 0 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {wallet.balance} ECO
                </div>
              </div>

              <div className="border-t pt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={viewOnExplorer}
                  className="flex-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WalletConnect;
