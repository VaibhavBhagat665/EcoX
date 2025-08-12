/**
 * Dedicated ECO Tokens page
 * Full page experience for token management, earning, and trading
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { TokenTradingPanel } from '@/components/Wallet/TokenTradingPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Coins, 
  TrendingUp, 
  Zap, 
  Award, 
  Leaf, 
  Users, 
  Star,
  ChevronRight
} from 'lucide-react';

export const Tokens: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const handleBackToHome = () => {
    setLocation('/');
  };

  const earnOpportunities = [
    {
      title: 'Daily Energy Check',
      description: 'Monitor and report your daily energy consumption',
      reward: '5-15 ECO',
      difficulty: 'Easy',
      time: '5 min',
      icon: <Zap className="w-6 h-6" />,
      category: 'Energy'
    },
    {
      title: 'Solar Panel Installation',
      description: 'Install solar panels and submit verification photos',
      reward: '200-500 ECO',
      difficulty: 'Hard',
      time: '1-2 days',
      icon: <div className="w-6 h-6 text-yellow-400">☀️</div>,
      category: 'Renewable'
    },
    {
      title: 'Carbon Footprint Analysis',
      description: 'Complete a comprehensive carbon footprint assessment',
      reward: '25-50 ECO',
      difficulty: 'Medium',
      time: '30 min',
      icon: <Leaf className="w-6 h-6" />,
      category: 'Assessment'
    },
    {
      title: 'Community Challenge',
      description: 'Participate in monthly environmental challenges',
      reward: '10-100 ECO',
      difficulty: 'Variable',
      time: '1 week',
      icon: <Users className="w-6 h-6" />,
      category: 'Community'
    },
    {
      title: 'Eco-Friendly Transport',
      description: 'Use sustainable transportation for a week',
      reward: '15-30 ECO',
      difficulty: 'Easy',
      time: '7 days',
      icon: <div className="w-6 h-6">🚲</div>,
      category: 'Transport'
    },
    {
      title: 'Waste Reduction Program',
      description: 'Implement composting or zero-waste practices',
      reward: '20-40 ECO',
      difficulty: 'Medium',
      time: '2 weeks',
      icon: <div className="w-6 h-6">♻️</div>,
      category: 'Waste'
    }
  ];

  const achievements = [
    { title: 'First Steps', description: 'Complete your first environmental action', reward: '10 ECO', unlocked: true },
    { title: 'Energy Saver', description: 'Save 100 kWh of energy', reward: '50 ECO', unlocked: true },
    { title: 'Solar Pioneer', description: 'Install renewable energy system', reward: '200 ECO', unlocked: false },
    { title: 'Community Leader', description: 'Help 10 people start their eco journey', reward: '100 ECO', unlocked: false },
    { title: 'Carbon Neutral', description: 'Offset 1000 kg of CO2', reward: '500 ECO', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>
      
      {/* Main content with proper spacing */}
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-green-900/20 to-blue-900/20">
          <div className="container mx-auto max-w-7xl container-padding">
            {/* Back Button */}
            <Button 
              onClick={handleBackToHome}
              variant="ghost" 
              className="mb-8 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            {/* Page Header */}
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center relative">
                  <Coins className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-green-400/30 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h1 className="heading-xl mb-6 text-white">
                ECO <span className="text-gradient-primary">Tokens</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Earn tokens by taking environmental actions. Trade, spend, or hold your ECO tokens to contribute to a sustainable future.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mt-8 rounded-full"></div>
            </div>

            {/* Token Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              {[
                { label: 'Current Price', value: '$0.85', change: '+5.7%', icon: TrendingUp, positive: true },
                { label: 'Total Supply', value: '10M', change: 'Fixed', icon: Coins, positive: null },
                { label: 'Active Users', value: '12.5K', change: '+12%', icon: Users, positive: true },
                { label: 'CO₂ Offset', value: '8.2M kg', change: '+18%', icon: Leaf, positive: true }
              ].map((stat, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-green-400" />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                    {stat.positive !== null && (
                      <Badge variant={stat.positive ? "default" : "destructive"} className="text-xs">
                        {stat.change}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Token Management Section */}
        <section className="section-padding">
          <div className="container mx-auto max-w-7xl container-padding">
            <TokenTradingPanel />
          </div>
        </section>

        {/* Earning Opportunities */}
        <section className="section-padding bg-white/5">
          <div className="container mx-auto max-w-7xl container-padding">
            <div className="text-center mb-12">
              <h2 className="heading-lg mb-6 text-white">
                Earn <span className="text-gradient-primary">ECO Tokens</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Complete environmental actions and challenges to earn tokens. Every action counts towards a sustainable future.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnOpportunities.map((opportunity, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform duration-300">
                        {opportunity.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {opportunity.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-white group-hover:text-green-400 transition-colors">
                      {opportunity.title}
                    </CardTitle>
                    <CardDescription>{opportunity.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Reward:</span>
                        <span className="text-green-400 font-semibold">{opportunity.reward}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Difficulty:</span>
                        <Badge variant={opportunity.difficulty === 'Easy' ? 'default' : opportunity.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">
                          {opportunity.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white">{opportunity.time}</span>
                      </div>
                      <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                        Start Action
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="section-padding">
          <div className="container mx-auto max-w-7xl container-padding">
            <div className="text-center mb-12">
              <h2 className="heading-lg mb-6 text-white">
                Achievements & <span className="text-gradient-primary">Milestones</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Unlock special rewards by reaching environmental milestones and making lasting impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className={`border ${achievement.unlocked ? 'bg-green-900/20 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.unlocked ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {achievement.unlocked ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <Star className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${achievement.unlocked ? 'text-green-400' : 'text-white'}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-semibold text-sm">
                            {achievement.reward}
                          </span>
                          <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs">
                            {achievement.unlocked ? "Unlocked" : "Locked"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tokens;
