/**
 * Token Trading & Wallet Panel for EcoX
 * Displays token balance, trading options, and earnings from activities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft,
  Activity,
  Zap,
  Leaf,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { getTokenBalance, mintTokens, burnTokens, getTransactions } from '@/lib/api';
import { readTokenBalance, connectMetaMask, getConnectedAccounts, formatAddress } from '@/lib/web3';
import { useAuth } from '@/hooks/useAuth';

interface TokenData {
  balance: string;
  value: number;
  change24h: number;
  totalEarned: number;
  pendingRewards: number;
}

interface Transaction {
  id: string;
  type: 'mint' | 'burn' | 'trade' | 'reward';
  amount: number;
  timestamp: Date;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

export function TokenTradingPanel() {
  const { isAuthenticated, user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenData>({
    balance: '0',
    value: 0,
    change24h: 5.7,
    totalEarned: 0,
    pendingRewards: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock ECO token price (in demo, this would come from a real price feed)
  const ecoTokenPrice = 0.85; // $0.85 per ECO token

  // Load wallet and token data
  useEffect(() => {
    async function loadWalletData() {
      if (!isAuthenticated) return;

      try {
        // Check for connected wallet
        const accounts = await getConnectedAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await loadTokenBalance(accounts[0]);
        }

        // Load transaction history
        if (user) {
          const txHistory = await getTransactions(user.uid);
          setTransactions(txHistory.map((tx: any) => ({
            id: tx.txId,
            type: tx.type,
            amount: tx.amount,
            timestamp: new Date(tx.createdAt),
            description: tx.metadata?.reason || `${tx.type} transaction`,
            status: 'completed',
            txHash: tx.txHash
          })));
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    }

    loadWalletData();
  }, [isAuthenticated, user]);

  const loadTokenBalance = async (address: string) => {
    try {
      const balance = await readTokenBalance(address);
      const numBalance = parseFloat(balance);
      
      setTokenData(prev => ({
        ...prev,
        balance,
        value: numBalance * ecoTokenPrice,
        totalEarned: numBalance,
        pendingRewards: Math.floor(Math.random() * 10) // Mock pending rewards
      }));
    } catch (error) {
      console.error('Failed to load token balance:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await connectMetaMask();
      if (address) {
        setWalletAddress(address);
        await loadTokenBalance(address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!walletAddress || !tradeAmount) return;

    try {
      setIsLoading(true);
      const amount = parseFloat(tradeAmount);
      const result = await mintTokens(walletAddress, amount, {
        type: 'manual_mint',
        reason: 'Test token mint'
      });

      if (result.success) {
        alert(`Successfully minted ${amount} ECO tokens!`);
        await loadTokenBalance(walletAddress);
        setTradeAmount('');
      } else {
        alert('Failed to mint tokens');
      }
    } catch (error) {
      console.error('Mint failed:', error);
      alert('Mint transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!walletAddress || !tradeAmount) return;

    try {
      setIsLoading(true);
      const amount = parseFloat(tradeAmount);
      const result = await burnTokens(walletAddress, amount);

      if (result.success) {
        alert(`Successfully burned ${amount} ECO tokens!`);
        await loadTokenBalance(walletAddress);
        setTradeAmount('');
      } else {
        alert('Failed to burn tokens');
      }
    } catch (error) {
      console.error('Burn failed:', error);
      alert('Burn transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="token-trading-panel p-6 text-center">
        <div className="mb-6">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Sign in to view your ECO tokens and start trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-trading-panel space-y-6">
      {/* Token Balance Overview */}
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">ECO Token Balance</CardTitle>
                <CardDescription>Your environmental impact tokens</CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => walletAddress && loadTokenBalance(walletAddress)}
              variant="ghost" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Balance */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-white">{tokenData.balance}</span>
                  <span className="text-lg text-green-400">ECO</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-400">≈ {formatCurrency(tokenData.value)}</span>
                  <Badge variant={tokenData.change24h >= 0 ? "default" : "destructive"} className="text-xs">
                    {tokenData.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(tokenData.change24h)}%
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Total Earned</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{tokenData.totalEarned}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Pending</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{tokenData.pendingRewards}</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="space-y-4">
              {walletAddress ? (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">Connected Wallet</span>
                  </div>
                  <span className="text-sm font-mono text-white">{formatAddress(walletAddress)}</span>
                  <Badge variant="outline" className="mt-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Connected
                  </Badge>
                </div>
              ) : (
                <Button onClick={handleConnectWallet} disabled={isLoading} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading & Activities Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="earn">Earn Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'mint' ? 'bg-green-400/20 text-green-400' :
                        tx.type === 'burn' ? 'bg-red-400/20 text-red-400' :
                        'bg-blue-400/20 text-blue-400'
                      }`}>
                        {tx.type === 'mint' ? <ArrowUpRight className="w-4 h-4" /> :
                         tx.type === 'burn' ? <ArrowDownLeft className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        tx.type === 'mint' ? 'text-green-400' : 
                        tx.type === 'burn' ? 'text-red-400' : 'text-white'
                      }`}>
                        {tx.type === 'burn' ? '-' : '+'}{tx.amount} ECO
                      </p>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Start earning tokens by completing environmental actions!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade" className="space-y-4">
          {/* Token Trading */}
          <Card>
            <CardHeader>
              <CardTitle>Trade ECO Tokens</CardTitle>
              <CardDescription>Mint or burn tokens (Demo Mode)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  {tradeAmount && (
                    <p className="text-xs text-gray-400 mt-1">
                      ≈ {formatCurrency(parseFloat(tradeAmount) * ecoTokenPrice)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleMintTokens}
                    disabled={!walletAddress || !tradeAmount || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Mint Tokens
                  </Button>
                  <Button 
                    onClick={handleBurnTokens}
                    disabled={!walletAddress || !tradeAmount || isLoading}
                    variant="destructive"
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Burn Tokens
                  </Button>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-300">Demo Mode</p>
                      <p className="text-xs text-gray-400">
                        This is a demonstration. Real trading would require proper DEX integration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earn" className="space-y-4">
          {/* Earn Tokens Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span>Earn ECO Tokens</span>
              </CardTitle>
              <CardDescription>Complete environmental actions to earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: 'Energy Efficiency',
                    description: 'Submit electricity bill showing reduced usage',
                    reward: '10-50 ECO',
                    difficulty: 'Easy',
                    icon: <Zap className="w-5 h-5" />
                  },
                  {
                    action: 'Solar Installation',
                    description: 'Install and verify solar panel system',
                    reward: '100-500 ECO',
                    difficulty: 'Hard',
                    icon: <div className="w-5 h-5 text-yellow-400">☀️</div>
                  },
                  {
                    action: 'Transportation',
                    description: 'Use public transport or bike instead of car',
                    reward: '5-20 ECO',
                    difficulty: 'Easy',
                    icon: <div className="w-5 h-5">🚲</div>
                  },
                  {
                    action: 'Waste Reduction',
                    description: 'Implement composting or recycling program',
                    reward: '15-40 ECO',
                    difficulty: 'Medium',
                    icon: <div className="w-5 h-5">♻️</div>
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center text-green-400">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.action}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>
                          <span className="text-xs text-green-400 font-medium">{item.reward}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TokenTradingPanel;
