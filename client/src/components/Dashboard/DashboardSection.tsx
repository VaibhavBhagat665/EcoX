import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAIRecommendations } from '@/lib/ai';

interface EnvironmentalMetrics {
  temperature: number;
  humidity: number;
  airQuality: string;
  energyUsage: number;
  carbonFootprint: number;
  timestamp: Date;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export const DashboardSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { generateRecommendations, recommendations, isLoading: aiLoading } = useAIRecommendations();
  
  // Simulate real-time metrics
  const [metrics, setMetrics] = useState<EnvironmentalMetrics>({
    temperature: 22,
    humidity: 65,
    airQuality: 'Good',
    energyUsage: 3.2,
    carbonFootprint: 2.5,
    timestamp: new Date()
  });

  // Fetch real-time environmental data
  const { data: liveMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/environmental/metrics'],
    queryFn: async () => {
      return {
        temperature: 22 + (Math.random() - 0.5) * 4,
        humidity: 65 + (Math.random() - 0.5) * 20,
        airQuality: ['Excellent', 'Good', 'Moderate'][Math.floor(Math.random() * 3)],
        energyUsage: 3.2 + (Math.random() - 0.5) * 1.0,
        carbonFootprint: 2.5 + (Math.random() - 0.5) * 0.5,
        timestamp: new Date()
      };
    },
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (liveMetrics) {
      setMetrics(liveMetrics);
    }
  }, [liveMetrics]);

  useEffect(() => {
    if (isAuthenticated) {
      generateRecommendations();
    }
  }, [isAuthenticated, generateRecommendations]);

  const handleExpand3DView = () => {
    console.log('Opening 3D view...');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scanQR':
        console.log('Opening QR scanner...');
        break;
      case 'trackCarbon':
        console.log('Opening carbon tracker...');
        break;
      case 'joinChallenge':
        const communitySection = document.getElementById('community');
        communitySection?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-400 bg-green-400/20 border-green-400/50';
      case 'medium': return 'text-blue-400 bg-blue-400/20 border-blue-400/50';
      case 'low': return 'text-purple-400 bg-purple-400/20 border-purple-400/50';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
      case 'medium': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
      case 'low': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
      default: return null;
    }
  };

  // if (!isAuthenticated) {
  //   return (
  //     <section className="section-padding bg-black" id="dashboard">
  //       <div className="container mx-auto max-w-7xl text-center container-padding">
  //         <div className="card-pro max-w-2xl mx-auto">
  //           <div className="w-20 h-20 glass-accent rounded-2xl flex items-center justify-center mx-auto mb-8">
  //             <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  //             </svg>
  //           </div>
  //           <h2 className="text-responsive-lg font-bold mb-6 text-white">Unlock Your Environmental Dashboard</h2>
  //           <p className="text-xl text-gray-300 mb-8 leading-relaxed">
  //             Get personalized environmental insights, AI-powered recommendations, and real-time monitoring data
  //           </p>
  //           <button className="btn-primary text-lg">
  //             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  //             </svg>
  //             Sign In to Continue
  //           </button>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section className="section-padding bg-black" id="dashboard">
      <div className="container mx-auto max-w-7xl container-padding">
        <div className="text-center mb-20">
          <h2 className="heading-lg mb-6 text-white">
            Environmental Intelligence <span className="text-gradient-primary">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring, AI insights, and predictive analytics for sustainable decision making
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Takes up 3 columns */}
          <div className="xl:col-span-3 space-y-8">
            {/* Real-time Metrics */}
            <div className="card-pro">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="w-12 h-12 glass-accent rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Live Environmental Metrics
                </h3>
                {metricsLoading && (
                  <div className="w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    value: `${metrics.temperature.toFixed(1)}°C`,
                    label: 'Temperature',
                    color: 'green',
                    change: '+2.1°'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 5l2 2" />
                      </svg>
                    ),
                    value: `${Math.round(metrics.humidity)}%`,
                    label: 'Humidity',
                    color: 'blue',
                    change: '-1.2%'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    value: metrics.airQuality,
                    label: 'Air Quality',
                    color: 'purple',
                    change: 'Stable'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    value: `${metrics.energyUsage.toFixed(1)}kW`,
                    label: 'Energy Usage',
                    color: 'orange',
                    change: '-0.3kW'
                  }
                ].map((metric, index) => (
                  <div key={metric.label} className="metric-card group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 ${
                      metric.color === 'green' ? 'bg-green-400/20 text-green-400 group-hover:bg-green-400/30' :
                      metric.color === 'blue' ? 'bg-blue-400/20 text-blue-400 group-hover:bg-blue-400/30' :
                      metric.color === 'purple' ? 'bg-purple-400/20 text-purple-400 group-hover:bg-purple-400/30' :
                      'bg-orange-400/20 text-orange-400 group-hover:bg-orange-400/30'
                    }`}>
                      {metric.icon}
                    </div>
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label mb-2">{metric.label}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      metric.color === 'green' ? 'bg-green-400/10 text-green-400' :
                      metric.color === 'blue' ? 'bg-blue-400/10 text-blue-400' :
                      metric.color === 'purple' ? 'bg-purple-400/10 text-purple-400' :
                      'bg-orange-400/10 text-orange-400'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-xs text-gray-400 text-right">
                Last updated: {metrics.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="card-pro">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="w-12 h-12 glass-accent rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  AI-Powered Recommendations
                </h3>
                {aiLoading && (
                  <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                )}
              </div>
              
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="glass-pro rounded-xl p-6 hover:glass-pro-hover transition-all duration-300 group">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2 text-lg">{rec.title}</h4>
                          <p className="text-gray-300 mb-4 leading-relaxed">{rec.description}</p>
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold flex items-center space-x-1 ${getImpactColor(rec.impact)}`}>
                              {getImpactIcon(rec.impact)}
                              <span>{rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact</span>
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-400/10 px-3 py-1 rounded-full">
                              {rec.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg mb-2">AI is analyzing your data...</p>
                    <p className="text-sm">Personalized recommendations will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-8">
            {/* 3D Visualization Preview */}
            <div className="card-pro">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-10 h-10 glass-accent rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                3D Environment
              </h3>
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-500/20 to-purple-500/20"></div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-blue-400 animate-rotate-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm text-gray-300">3D Visualization</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button className="btn-secondary text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m12 0h-4a1 1 0 011 1v4m0 8v4a1 1 0 01-1 1h-4M4 16v4a1 1 0 001 1h4" />
                    </svg>
                    Expand
                  </button>
                </div>
              </div>
              <button 
                onClick={handleExpand3DView}
                className="btn-primary w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m12 0h-4a1 1 0 011 1v4m0 8v4a1 1 0 01-1 1h-4M4 16v4a1 1 0 001 1h4" />
                </svg>
                Full Screen View
              </button>
            </div>

            {/* Quick Actions */}
            <div className="card-pro">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  {
                    action: 'scanQR',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    ),
                    title: 'Scan Product QR',
                    subtitle: 'Check environmental impact',
                    color: 'green'
                  },
                  {
                    action: 'trackCarbon',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ),
                    title: 'Track Carbon Footprint',
                    subtitle: 'Monitor daily emissions',
                    color: 'blue'
                  },
                  {
                    action: 'joinChallenge',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ),
                    title: 'Join Eco Challenge',
                    subtitle: 'Compete with community',
                    color: 'purple'
                  }
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleQuickAction(item.action)}
                    className="w-full glass-pro rounded-xl p-4 text-left hover:glass-pro-hover transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        item.color === 'green' ? 'bg-green-400/20 text-green-400 group-hover:bg-green-400/30' :
                        item.color === 'blue' ? 'bg-blue-400/20 text-blue-400 group-hover:bg-blue-400/30' :
                        'bg-purple-400/20 text-purple-400 group-hover:bg-purple-400/30'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.subtitle}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Carbon Footprint Summary */}
            <div className="card-pro">
              <h3 className="text-xl font-bold text-white mb-6">Today's Impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">2.1 kg</div>
                  <div className="text-sm text-gray-400 mb-4">CO₂ Saved Today</div>
                  <div className="progress-bar h-2 mb-2">
                    <div className="progress-fill" style={{ width: '68%' }}></div>
                  </div>
                  <div className="text-xs text-gray-400">68% better than average</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">15.2 kWh</div>
                    <div className="text-xs text-gray-400">Energy Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">8.4L</div>
                    <div className="text-xs text-gray-400">Water Saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}