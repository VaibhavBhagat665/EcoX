import { useState, useCallback } from 'react';

// FIXED: Proper API configuration with validation
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Validate API key on module load
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will use fallback responses.');
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  action?: string;
  parameters?: Record<string, any>;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'energy' | 'waste' | 'transportation' | 'consumption';
  actionable: boolean;
  estimatedSavings?: {
    carbon: number; // kg CO2
    energy: number; // kWh
    cost: number; // USD
  };
}

// Environmental context for AI
export const getEnvironmentalContext = () => ({
  userMetrics: {
    carbonFootprint: 2.5, // tons CO2/year
    energyUsage: 850, // kWh/month
    ecoScore: 87,
  },
  currentConditions: {
    temperature: 22,
    humidity: 65,
    airQuality: 'Good',
    season: 'spring',
  },
  goals: {
    carbonReduction: 20, // percentage
    energySavings: 15, // percentage
  }
});

// FIXED: Improved API call with proper error handling
const callGeminiAPI = async (userMessage: string): Promise<string> => {
  // Return fallback immediately if no API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
    return getFallbackResponse(userMessage);
  }

  try {
    const context = getEnvironmentalContext();
    const systemPrompt = `You are EcoX AI Assistant, an environmental sustainability expert. Help users reduce their carbon footprint and live more sustainably. 

User's current metrics:
- Carbon footprint: ${context.userMetrics.carbonFootprint} tons CO2/year
- Energy usage: ${context.userMetrics.energyUsage} kWh/month  
- Eco score: ${context.userMetrics.ecoScore}/100

Provide practical, actionable advice. Keep responses concise but helpful.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser question: ${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 404) {
        console.error('Gemini API endpoint not found (404). Check API URL and model name.');
        return getFallbackResponse(userMessage);
      } else if (response.status === 403) {
        console.error('Gemini API access forbidden (403). Check API key permissions.');
        return getFallbackResponse(userMessage);
      } else if (response.status === 429) {
        console.error('Gemini API rate limit exceeded (429).');
        return "I'm receiving too many requests right now. Please try again in a moment.";
      } else {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Invalid response format from Gemini API:', data);
      return getFallbackResponse(userMessage);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "I'm having trouble connecting to my AI services. Please check your internet connection and try again.";
    }
    
    return getFallbackResponse(userMessage);
  }
};

// FIXED: Comprehensive fallback responses
const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('energy') || message.includes('electricity')) {
    return "Here are some energy-saving tips: Use LED bulbs, unplug devices when not in use, set your thermostat 2°C lower in winter and higher in summer, and use natural light during the day.";
  }
  
  if (message.includes('carbon') || message.includes('footprint')) {
    return "To reduce your carbon footprint: Walk, bike, or use public transport instead of driving. Eat less meat, buy local produce, reduce waste, and switch to renewable energy if possible.";
  }
  
  if (message.includes('waste') || message.includes('recycle')) {
    return "Waste reduction tips: Reduce single-use items, reuse containers, recycle properly, compost organic waste, and buy products with minimal packaging.";
  }
  
  if (message.includes('water')) {
    return "Water conservation tips: Take shorter showers, fix leaks promptly, use water-efficient appliances, collect rainwater for plants, and avoid running water unnecessarily.";
  }
  
  if (message.includes('transport') || message.includes('travel')) {
    return "Sustainable transportation: Walk or bike for short trips, use public transport, carpool, work from home when possible, and consider electric or hybrid vehicles.";
  }
  
  return "I'd love to help you live more sustainably! You can ask me about energy saving, reducing carbon footprint, waste management, water conservation, or sustainable transportation. What would you like to know?";
};

// AI Chat Hook - FIXED: Better error handling and state management
export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await callGeminiAPI(currentInput);
      
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const sendContextualMessage = useCallback(async (message: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await callGeminiAPI(message);
      
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    sendContextualMessage,
  };
};

// AI Recommendations - FIXED: Better fallback handling
export const useAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
        // Use fallback recommendations immediately
        setRecommendations(getFallbackRecommendations());
        setIsLoading(false);
        return;
      }

      const context = getEnvironmentalContext();
      const prompt = `Based on these environmental metrics, generate 3 specific, actionable recommendations:
      - Carbon footprint: ${context.userMetrics.carbonFootprint} tons CO2/year
      - Energy usage: ${context.userMetrics.energyUsage} kWh/month
      - Eco score: ${context.userMetrics.ecoScore}/100
      
      Format each recommendation as a JSON object with title, description, impact (high/medium/low), and category (energy/waste/transportation/consumption).`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Try to parse AI response, fallback on error
        try {
          const aiText = data.candidates[0].content.parts[0].text;
          // For now, use fallback until proper JSON parsing is implemented
          setRecommendations(getFallbackRecommendations());
        } catch (parseError) {
          console.error('Error parsing AI recommendations:', parseError);
          setRecommendations(getFallbackRecommendations());
        }
      } else {
        setRecommendations(getFallbackRecommendations());
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations(getFallbackRecommendations());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateRecommendations,
    recommendations,
    isLoading,
  };
};

const getFallbackRecommendations = (): AIRecommendation[] => [
  {
    id: '1',
    title: 'Optimize Energy Usage',
    description: 'Reduce AC usage by 2°C to save 15% energy during peak hours.',
    impact: 'high',
    category: 'energy',
    actionable: true,
    estimatedSavings: {
      carbon: 45.2,
      energy: 127.5,
      cost: 25.40
    }
  },
  {
    id: '2',
    title: 'Switch to Digital Receipts',
    description: 'Reduce paper waste by 80% by using digital receipts.',
    impact: 'medium',
    category: 'waste',
    actionable: true,
    estimatedSavings: {
      carbon: 12.8,
      energy: 0,
      cost: 0
    }
  },
  {
    id: '3',
    title: 'Use Public Transportation',
    description: 'Replace 2 car trips per week with public transport to reduce emissions.',
    impact: 'high',
    category: 'transportation',
    actionable: true,
    estimatedSavings: {
      carbon: 32.6,
      energy: 0,
      cost: 18.00
    }
  }
];

// Voice Command Processing - FIXED: Better error handling
export const processVoiceCommand = async (transcript: string): Promise<VoiceCommand> => {
  try {
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-api-key-here') {
      const prompt = `Analyze this voice command and determine the appropriate action: "${transcript}"
      
      Available actions:
      - showCarbonFootprint: for carbon footprint queries
      - showEnergyUsage: for energy usage questions
      - showRecommendations: for sustainability recommendations
      - startChallenge: for starting eco challenges
      - navigateToDashboard: for dashboard navigation
      - openChat: for opening chat
      - generalQuery: for general questions
      
      Return the most appropriate action name.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
        const aiAction = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase();
        
        // Map AI response to actions
        const actionMap: Record<string, string> = {
          'carbon': 'showCarbonFootprint',
          'energy': 'showEnergyUsage',
          'recommend': 'showRecommendations',
          'challenge': 'startChallenge',
          'dashboard': 'navigateToDashboard',
          'chat': 'openChat'
        };

        for (const [key, action] of Object.entries(actionMap)) {
          if (aiAction?.includes(key)) {
            return {
              transcript,
              confidence: 0.9,
              action,
              parameters: { query: transcript }
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing voice command with AI:', error);
  }

  // Fallback to simple keyword matching
  const commands = {
    'carbon footprint': { action: 'showCarbonFootprint' },
    'energy usage': { action: 'showEnergyUsage' },
    'recommendations': { action: 'showRecommendations' },
    'start challenge': { action: 'startChallenge' },
    'show dashboard': { action: 'navigateToDashboard' },
    'open chat': { action: 'openChat' },
  };

  const normalizedTranscript = transcript.toLowerCase();
  
  for (const [phrase, command] of Object.entries(commands)) {
    if (normalizedTranscript.includes(phrase)) {
      return {
        transcript,
        confidence: 0.95,
        ...command
      };
    }
  }

  // If no specific command found, treat as general query
  return {
    transcript,
    confidence: 0.8,
    action: 'generalQuery',
    parameters: { query: transcript }
  };
};

// AI Insights Generator - FIXED: Better error handling
export const generateAIInsights = async (data: any) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
      return getFallbackInsights();
    }

    const context = getEnvironmentalContext();
    const prompt = `Analyze this environmental data and provide insights:
    ${JSON.stringify(data)}
    
    User context: ${JSON.stringify(context)}
    
    Provide actionable insights and predictions for environmental improvements.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      insights: [result.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights available'],
      predictions: {},
      recommendations: []
    };
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return getFallbackInsights();
  }
};

const getFallbackInsights = () => ({
  insights: [
    'Your eco score of 87/100 is excellent! Focus on transportation and energy usage to reach 90+.',
    'Consider switching to renewable energy sources to further reduce your carbon footprint.',
    'Small daily changes can lead to significant environmental impact over time.'
  ],
  predictions: {
    monthlyProgress: '+5% improvement expected',
    yearlyGoals: 'On track to meet 20% carbon reduction goal'
  },
  recommendations: getFallbackRecommendations()
});