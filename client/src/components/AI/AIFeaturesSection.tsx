import React, { useState } from 'react';
import { VoiceAssistant } from './VoiceAssistant';
import { Button } from '@/components/ui/button';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAIRecommendations } from '@/lib/ai';

interface PredictionData {
  energySavings: number;
  carbonReduction: number;
  wasteMinimization: number;
  period: string;
}

export const AIFeaturesSection: React.FC = () => {
  const { 
    isListening, 
    isSupported, 
    transcript, 
    error, 
    startListening, 
    stopListening, 
    speak,
    clearError 
  } = useVoiceAssistant();
  
  const { generateRecommendations, isLoading: aiLoading } = useAIRecommendations();
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  
  const [predictions] = useState<PredictionData>({
    energySavings: 23,
    carbonReduction: 87,
    wasteMinimization: 45,
    period: 'Next 7 days'
  });

  const sampleCommands = [
    "What's my carbon footprint today?",
    "Show energy usage recommendations",
    "Start eco challenge"
  ];

  const handleVoiceCommand = async (command: string) => {
    speak(`Processing command: ${command}`);
  };

  const handleStartListening = () => {
    if (error) clearError();
    setShowVoicePanel(true);
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
    setShowVoicePanel(false);
  };

  const handleViewDetailedAnalytics = () => {
    console.log('Opening detailed analytics...');
  };

  return (
    <section className="section-padding container-padding" id="analytics">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-responsive-lg font-bold mb-4 text-gradient-primary">
            AI-Powered Features
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Experience intelligent environmental analysis with advanced AI capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Assistant Card */}
          <div className="card-pro group">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 glass-accent rounded-xl flex items-center justify-center mr-4 group-hover:pulse-glow transition-all">
                <i className="fas fa-microphone text-lg text-accent-primary" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold">Voice Assistant</h3>
            </div>
            
            <p className="text-muted mb-6 leading-relaxed">
              Interact with EcoX using natural voice commands for instant environmental insights.
            </p>

            {isSupported ? (
              <div className="space-y-4">
                {/* Voice Status */}
                <div className="glass-pro rounded-xl p-4 border border-border-accent">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted">Status</span>
                    <span className={`text-sm font-mono px-2 py-1 rounded-lg ${
                      error ? 'bg-red-500/20 text-red-400' : 
                      isListening ? 'bg-accent-primary/20 text-accent-primary' : 
                      'bg-surface-glass text-secondary'
                    }`}>
                      {error ? 'Error' : isListening ? 'Listening' : 'Ready'}
                    </span>
                  </div>
                  
                  {/* Audio Visualizer */}
                  {isListening && (
                    <div className="flex justify-center space-x-1 mb-3">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-accent-primary rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Transcript */}
                  {transcript && (
                    <div className="mt-3 p-3 bg-surface-glass rounded-lg">
                      <div className="text-xs text-accent-primary mb-1">Transcript:</div>
                      <div className="text-sm text-primary">{transcript}</div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="text-sm text-red-400">{error}</div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <Button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`w-full ${
                    isListening 
                      ? 'btn-secondary' 
                      : 'btn-primary'
                  }`}
                  disabled={!isSupported}
                >
                  <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} mr-2`} />
                  {isListening ? 'Stop Listening' : 'Start Voice Command'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 bg-surface-glass rounded-xl">
                <i className="fas fa-exclamation-triangle text-2xl text-accent-orange mb-3" />
                <p className="text-muted">Voice commands not supported in this browser</p>
              </div>
            )}

            {/* Quick Commands */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-secondary">Quick Commands:</h4>
              <div className="space-y-2">
                {sampleCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => handleVoiceCommand(command)}
                    className="block w-full text-left text-sm p-3 bg-surface-glass hover:bg-surface-glass-hover rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  >
                    <span className="text-accent-primary mr-2">$</span>
                    <span className="text-muted font-mono">{command}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Predictive Analytics Card */}
          <div className="card-pro group">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 glass-accent rounded-xl flex items-center justify-center mr-4 group-hover:pulse-glow transition-all">
                <i className="fas fa-chart-line text-lg text-accent-blue" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold">Smart Analytics</h3>
            </div>
            
            <p className="text-muted mb-6 leading-relaxed">
              AI-powered predictions to optimize your environmental impact and sustainability goals.
            </p>

            {/* Metrics Grid */}
            <div className="space-y-4 mb-6">
              <div className="metric-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="metric-label">Energy Optimization</span>
                  <div className="flex items-center">
                    <span className="text-accent-primary font-bold">+{predictions.energySavings}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill"
                    style={{ width: `${predictions.energySavings}%` }}
                  />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="metric-label">Carbon Reduction</span>
                  <div className="flex items-center">
                    <span className="text-accent-blue font-bold">{predictions.carbonReduction}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${predictions.carbonReduction}%`,
                      background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))'
                    }}
                  />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="metric-label">Waste Minimization</span>
                  <div className="flex items-center">
                    <span className="text-accent-purple font-bold">-{predictions.wasteMinimization}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${predictions.wasteMinimization}%`,
                      background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-orange))'
                    }}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleViewDetailedAnalytics}
              className="w-full btn-secondary group-hover:btn-primary transition-all duration-300"
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-bar mr-2" />
                  View Detailed Analytics
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      {showVoicePanel && (
        <VoiceAssistant 
          isVisible={showVoicePanel}
          onClose={() => setShowVoicePanel(false)}
        />
      )}
    </section>
  );
};