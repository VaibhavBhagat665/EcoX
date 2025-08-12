import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Activity, Brain, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface VoiceAssistantProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isVisible, onClose }) => {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [confidence, setConfidence] = React.useState(0);
  const [error, setError] = React.useState('');
  const [lastCommand, setLastCommand] = React.useState<any>(null);

  // Auto-close when listening stops
  useEffect(() => {
    if (!isListening && isVisible && !error) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, isVisible, onClose, error]);

  // Simulate voice processing
  useEffect(() => {
    if (isVisible && !isListening && !error) {
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
      
      const timer = setTimeout(() => {
        setTranscript('Analyze current environmental impact parameters');
        setConfidence(0.94);
        setIsListening(false);
        setLastCommand({
          action: 'Environmental Impact Analysis',
          confidence: 0.94,
          parameters: { scope: 'current', detail: 'comprehensive' }
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleCancel = () => {
    setIsListening(false);
    setError('');
    setTranscript('');
    setLastCommand(null);
    onClose();
  };

  const handleProcess = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-up"
      role="dialog"
      aria-label="Voice Assistant Interface"
      aria-live="polite"
    >
      <div className="glass-pro rounded-2xl p-8 w-96 max-w-[90vw] border-2 border-border-accent shadow-xl">
        <div className="text-center">
          {/* Voice Core Interface */}
          <div className="relative mb-8">
            <div className={`w-20 h-20 glass-accent rounded-full flex items-center justify-center mx-auto relative ${
              isListening ? 'pulse-glow' : ''
            }`}>
              <Mic className={`w-8 h-8 text-accent-primary ${
                isListening ? 'animate-pulse' : ''
              }`} />
              
              {/* Activity Ring */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-2 border-accent-primary/30 animate-ping" />
              )}
              
              {/* Processing Ring */}
              {!isListening && transcript && (
                <div className="absolute inset-0 rounded-full border-2 border-accent-blue/60" />
              )}
            </div>
            
            {/* Status Badge */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className={`px-3 py-1 rounded-full text-xs font-mono border ${
                error ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                isListening ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/40' :
                transcript ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/40' :
                'bg-surface-glass text-muted border-border-primary'
              }`}>
                {error ? 'ERROR' : isListening ? 'LISTENING' : transcript ? 'PROCESSED' : 'READY'}
              </div>
            </div>
          </div>
          
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary mb-2">Voice Assistant</h3>
            <div className="flex items-center justify-center space-x-2">
              <Brain className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-accent-primary font-mono">
                AI PROCESSING
              </span>
            </div>
          </div>
          
          {/* Status Message */}
          <div className="mb-6 p-4 glass-pro rounded-xl border border-border-primary">
            {error ? (
              <div className="flex items-center justify-center text-red-400">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">Processing error: {error}</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center justify-center text-accent-primary">
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                <span className="text-sm">Analyzing voice input...</span>
              </div>
            ) : transcript ? (
              <div className="flex items-center justify-center text-accent-blue">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Command processed successfully</span>
              </div>
            ) : (
              <span className="text-sm text-muted">Voice interface ready for input</span>
            )}
          </div>
          
          {/* Audio Visualizer */}
          {isListening && (
            <div className="flex justify-center space-x-1 mb-6" aria-hidden="true">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-accent-primary to-accent-blue rounded-full transition-all duration-300 animate-pulse"
                  style={{
                    height: `${Math.random() * 25 + 15}px`,
                    animationDelay: `${i * 60}ms`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Transcript Display */}
          {transcript && (
            <div className="glass-pro rounded-xl p-4 mb-6 text-left border border-border-accent">
              <div className="flex items-center mb-2">
                <Activity className="w-4 h-4 text-accent-blue mr-2" />
                <span className="text-xs text-accent-blue font-mono uppercase tracking-wide">
                  Transcript
                </span>
              </div>
              <div className="text-sm text-primary font-mono leading-relaxed">
                "{transcript}"
              </div>
              {confidence > 0 && (
                <div className="mt-3 pt-3 border-t border-border-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted">Confidence:</span>
                    <span className="text-xs font-mono text-accent-primary">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div 
                      className="progress-fill"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Command Recognition */}
          {lastCommand && (
            <div className="glass-accent rounded-xl p-4 mb-6 text-left border border-accent-primary/30">
              <div className="flex items-center mb-2">
                <Zap className="w-4 h-4 text-accent-primary mr-2" />
                <span className="text-xs text-accent-primary font-mono uppercase tracking-wide">
                  Command Ready
                </span>
              </div>
              <div className="text-sm text-primary font-semibold mb-1">
                {lastCommand.action}
              </div>
              <div className="text-xs text-muted">
                Confidence: {Math.round(lastCommand.confidence * 100)}% • Ready to execute
              </div>
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-xs text-red-400 font-mono uppercase tracking-wide">
                  Error
                </span>
              </div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}
          
          {/* Control Panel */}
          <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 btn-secondary h-11"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {transcript && !isListening && !error && (
              <Button
                onClick={handleProcess}
                className="flex-1 btn-primary h-11"
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute
              </Button>
            )}
          </div>
          
          {/* Quick Commands Guide */}
          {!transcript && !error && (
            <div className="mt-6 glass-pro rounded-xl p-4 border border-border-primary">
              <div className="flex items-center mb-3">
                <Brain className="w-4 h-4 text-accent-primary mr-2" />
                <span className="text-xs text-accent-primary font-mono uppercase tracking-wide">
                  Voice Commands
                </span>
              </div>
              <div className="space-y-2 text-left">
                {[
                  'Analyze environmental impact',
                  'Show energy recommendations', 
                  'Start carbon tracking'
                ].map((command, index) => (
                  <div key={index} className="text-xs text-muted leading-relaxed">
                    <span className="text-accent-primary mr-2">•</span>
                    <span className="font-mono">{command}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};