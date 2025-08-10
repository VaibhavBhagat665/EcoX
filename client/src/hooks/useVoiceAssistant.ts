import { useState, useEffect, useCallback, useRef } from 'react';

// Define types for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  action?: string;
  parameters?: Record<string, any>;
}

interface VoiceAssistantState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  lastCommand: VoiceCommand | null;
}

// Gemini API integration for voice commands
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Process voice command with AI
const processVoiceCommand = async (transcript: string): Promise<VoiceCommand> => {
  try {
    const prompt = `You are an AI assistant for an environmental sustainability app called EcoX. 
    
    Analyze this voice command: "${transcript}"
    
    Determine which action the user wants:
    1. "showCarbonFootprint" - for queries about carbon footprint, emissions, CO2
    2. "showEnergyUsage" - for energy consumption, electricity, power usage
    3. "showRecommendations" - for eco tips, sustainability advice, recommendations
    4. "startChallenge" - for challenges, competitions, goals
    5. "navigateToDashboard" - for dashboard, overview, main screen
    6. "openChat" - for chat, talk, assistant
    7. "generalQuery" - for other environmental questions
    
    Respond with just the action name (e.g., "showCarbonFootprint") and nothing else.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiAction = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      // Validate AI response
      const validActions = [
        'showCarbonFootprint', 'showEnergyUsage', 'showRecommendations', 
        'startChallenge', 'navigateToDashboard', 'openChat', 'generalQuery'
      ];
      
      if (validActions.includes(aiAction)) {
        return {
          transcript,
          confidence: 0.9,
          action: aiAction,
          parameters: { query: transcript }
        };
      }
    }
  } catch (error) {
    console.error('AI processing error:', error);
  }

  // Fallback to keyword matching
  const commands = {
    'carbon': 'showCarbonFootprint',
    'footprint': 'showCarbonFootprint',
    'emissions': 'showCarbonFootprint',
    'energy': 'showEnergyUsage',
    'power': 'showEnergyUsage',
    'electricity': 'showEnergyUsage',
    'recommendations': 'showRecommendations',
    'tips': 'showRecommendations',
    'advice': 'showRecommendations',
    'challenge': 'startChallenge',
    'competition': 'startChallenge',
    'dashboard': 'navigateToDashboard',
    'overview': 'navigateToDashboard',
    'chat': 'openChat',
    'talk': 'openChat',
  };

  const normalizedTranscript = transcript.toLowerCase();
  
  for (const [keyword, action] of Object.entries(commands)) {
    if (normalizedTranscript.includes(keyword)) {
      return {
        transcript,
        confidence: 0.85,
        action,
        parameters: { query: transcript }
      };
    }
  }

  return {
    transcript,
    confidence: 0.7,
    action: 'generalQuery',
    parameters: { query: transcript }
  };
};

export const useVoiceAssistant = () => {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null,
    lastCommand: null,
  });

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const isInitialized = useRef(false);

  // Check browser support
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!(SpeechRecognition && window.speechSynthesis);
    
    setState(prev => ({ ...prev, isSupported }));
    return isSupported;
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (isInitialized.current || !checkSupport()) return false;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      synthesisRef.current = window.speechSynthesis;
      
      // Configure speech recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setState(prev => ({ ...prev, isListening: true, error: null, transcript: '' }));
      };
      
      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setState(prev => ({ ...prev, isListening: false }));
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Network connection issue. Check your internet.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Check your audio settings.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service not available. Try again later.';
            break;
          default:
            errorMessage = `Recognition error: ${event.error}`;
        }
        
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: errorMessage
        }));
      };
      
      recognitionRef.current.onresult = async (event: any) => {
        try {
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;
          
          console.log('Voice transcript:', transcript, 'Confidence:', confidence);
          
          setState(prev => ({ 
            ...prev, 
            transcript, 
            confidence 
          }));
          
          if (result.isFinal && confidence > 0.5) {
            try {
              const command = await processVoiceCommand(transcript);
              setState(prev => ({ ...prev, lastCommand: command }));
              
              // Execute command
              await executeVoiceCommand(command);
            } catch (error) {
              console.error('Command processing error:', error);
              setState(prev => ({ 
                ...prev, 
                error: 'Failed to process voice command. Please try again.' 
              }));
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Error processing speech. Please try again.' 
          }));
        }
      };
      
      isInitialized.current = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Failed to initialize voice recognition' 
      }));
      return false;
    }
  }, [checkSupport]);

  // Initialize on component mount
  useEffect(() => {
    checkSupport();
    
    // Auto-initialize after user interaction
    const handleUserInteraction = () => {
      if (initializeSpeechRecognition()) {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [initializeSpeechRecognition]);

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Voice recognition not supported in this browser. Try Chrome or Edge.' 
      }));
      return false;
    }

    if (!recognitionRef.current && !initializeSpeechRecognition()) {
      return false;
    }
    
    if (state.isListening) {
      console.log('Already listening...');
      return false;
    }

    try {
      setState(prev => ({ ...prev, error: null, transcript: '', lastCommand: null }));
      recognitionRef.current.start();
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start voice recognition. Please try again.' 
      }));
      return false;
    }
  }, [state.isSupported, state.isListening, initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      try {
        recognitionRef.current.stop();
        return true;
      } catch (error) {
        console.error('Failed to stop listening:', error);
        setState(prev => ({ ...prev, error: 'Failed to stop voice recognition.' }));
        return false;
      }
    }
    return false;
  }, [state.isListening]);

  // Speak text with AI-powered responses
  const speak = useCallback(async (text: string, options?: { 
    voice?: string; 
    rate?: number; 
    pitch?: number; 
    volume?: number; 
  }): Promise<void> => {
    if (!state.isSupported || !synthesisRef.current) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        synthesisRef.current!.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply options
        utterance.rate = options?.rate || 0.9;
        utterance.pitch = options?.pitch || 1.0;
        utterance.volume = options?.volume || 1.0;
        
        // Select voice
        const voices = synthesisRef.current!.getVoices();
        if (options?.voice) {
          const selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(options.voice!.toLowerCase())
          );
          if (selectedVoice) utterance.voice = selectedVoice;
        } else {
          // Use a pleasant, clear voice
          const preferredVoice = voices.find(voice => 
            (voice.name.includes('Google') && voice.lang.includes('en')) ||
            (voice.name.includes('Samantha')) ||
            (voice.name.includes('Karen')) ||
            (voice.lang.includes('en-US') && voice.name.includes('Female'))
          );
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          console.log('Speech synthesis completed');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        synthesisRef.current!.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis failed:', error);
        reject(error);
      }
    });
  }, [state.isSupported]);

  // Execute voice command with AI responses
  const executeVoiceCommand = useCallback(async (command: VoiceCommand) => {
    console.log('Executing voice command:', command);
    
    try {
      switch (command.action) {
        case 'showCarbonFootprint':
          await speak('Your current carbon footprint is 2.5 tons of CO2 per year, which is 15% below the national average. Great progress! Would you like specific tips to reduce it further?');
          // Navigate to carbon footprint section
          const dashboardElement = document.getElementById('dashboard');
          if (dashboardElement) {
            dashboardElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;

        case 'showEnergyUsage':
          await speak('Your energy usage this month is 850 kilowatt hours, which is 12% lower than last month. Excellent work! Your biggest savings came from adjusting your thermostat.');
          break;

        case 'showRecommendations':
          await speak('I have 3 personalized recommendations for you. The top suggestion is to reduce your air conditioning by 2 degrees to save 15% more energy and 25 dollars monthly.');
          const analyticsElement = document.getElementById('analytics');
          if (analyticsElement) {
            analyticsElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;

        case 'startChallenge':
          await speak('Starting the Zero Waste Week challenge! You can earn up to 500 points by reducing waste and compete with friends. Are you ready to begin?');
          const communityElement = document.getElementById('community');
          if (communityElement) {
            communityElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;

        case 'navigateToDashboard':
          await speak('Opening your environmental dashboard with all your latest stats and achievements.');
          const dashElement = document.getElementById('dashboard');
          if (dashElement) {
            dashElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;

        case 'openChat':
          await speak('Opening AI chat assistant. You can ask me anything about sustainability and environmental impact.');
          const chatButton = document.querySelector('[data-testid="chat-toggle"]') as HTMLButtonElement;
          if (chatButton) {
            chatButton.click();
          }
          break;

        case 'generalQuery':
          const query = command.parameters?.query || '';
          await speak(`I heard "${query}". Let me help you with that environmental question.`);
          
          // Try to get AI response for general queries
          try {
            const response = await fetch(GEMINI_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `As an environmental sustainability assistant, provide a brief helpful response to: "${query}"`
                  }]
                }]
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (aiResponse) {
                // Speak the AI response (limit length)
                const shortResponse = aiResponse.substring(0, 200);
                await speak(shortResponse);
              }
            }
          } catch (error) {
            console.error('AI response error:', error);
          }
          break;

        default:
          await speak('I didn\'t understand that command. You can ask about your carbon footprint, energy usage, recommendations, or start a challenge.');
      }
    } catch (error) {
      console.error('Error executing voice command:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to execute command. Please try again.' 
      }));
      await speak('Sorry, I encountered an error processing that command. Please try again.');
    }
  }, [speak]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      return stopListening();
    } else {
      return startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    if (!state.isSupported || !synthesisRef.current) return [];
    return synthesisRef.current.getVoices();
  }, [state.isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && state.isListening) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
      if (synthesisRef.current) {
        try {
          synthesisRef.current.cancel();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };
  }, [state.isListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speak,
    clearError,
    getVoices,
    executeVoiceCommand,
  };
};