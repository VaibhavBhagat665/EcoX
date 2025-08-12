import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatWithAssistant } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isAuthenticated || !user) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(user.uid, inputValue);

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    { label: 'Carbon footprint', action: 'carbon-footprint', icon: 'leaf' },
    { label: 'Energy tips', action: 'energy-tips', icon: 'bolt' },
    { label: 'Challenges', action: 'challenges', icon: 'trophy' },
  ];

  const handleQuickAction = async (action: string) => {
    const queries = {
      'carbon-footprint': 'What is my current carbon footprint and how can I reduce it?',
      'energy-tips': 'Give me personalized energy saving tips for my home.',
      'challenges': 'What eco challenges can I join to improve my environmental impact?'
    };

    const query = queries[action as keyof typeof queries];
    if (query && isAuthenticated && user) {
      setInputValue(query);
      await handleSendMessage();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendMessage();
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="chat-widget">
      {/* Chat Toggle Button */}
      <button
        onClick={handleToggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 ${
          isOpen 
            ? 'glass-pro border-2 border-accent-primary shadow-lg' 
            : 'btn-primary hover:scale-105'
        }`}
        aria-label={isOpen ? "Close AI chat assistant" : "Open AI chat assistant"}
        data-testid="chat-toggle"
      >
        <i 
          className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-xl ${
            isOpen ? 'text-accent-primary' : 'text-black'
          }`} 
          aria-hidden="true"
        />
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-80 h-[500px] glass-pro rounded-2xl p-4 animate-scale-up shadow-xl border border-border-accent"
          role="dialog"
          aria-label="AI Chat Assistant"
          aria-live="polite"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-blue flex items-center justify-center">
                <i className="fas fa-robot text-white text-sm" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold text-primary text-sm">EcoX Assistant</div>
                <div className="text-xs text-muted flex items-center">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mr-2 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <button 
              onClick={handleToggleChat}
              className="text-muted hover:text-primary transition-colors p-1 rounded-lg hover:bg-surface-glass focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              aria-label="Close chat"
            >
              <i className="fas fa-times text-sm" aria-hidden="true" />
            </button>
          </div>

          {/* Authentication Check */}
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-4">
              <div className="w-16 h-16 glass-accent rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-lock text-2xl text-accent-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2 text-primary">Sign in Required</h3>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                Access personalized AI assistance for your environmental journey
              </p>
              <Button className="btn-primary text-sm px-6">
                <i className="fas fa-sign-in-alt mr-2" aria-hidden="true" />
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto space-y-3 mb-4 pr-2" aria-label="Chat messages">
                {messages.length === 0 && (
                  <div className="glass-pro rounded-xl p-3 border border-border-primary">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-robot text-white text-xs" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-primary">
                          Hi! I'm your EcoX AI assistant. How can I help you reduce your environmental impact today?
                        </div>
                        <div className="text-xs text-muted mt-1">Just now</div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`glass-pro rounded-xl p-3 border border-border-primary ${
                      message.role === 'user' ? 'ml-4' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-accent-blue' 
                          : 'bg-accent-primary'
                      }`}>
                        <i className={`fas ${
                          message.role === 'user' ? 'fa-user' : 'fa-robot'
                        } text-white text-xs`} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-primary leading-relaxed">
                          {message.content}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="glass-pro rounded-xl p-3 border border-border-primary">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                      <div className="text-sm text-muted">Thinking...</div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about sustainability..."
                  className="flex-1 glass-pro border-border-primary focus:border-accent-primary text-primary placeholder-muted text-sm"
                  disabled={isLoading}
                  aria-label="Chat message input"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="btn-primary px-3"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <i className="fas fa-paper-plane text-black" aria-hidden="true" />
                  )}
                </Button>
              </form>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                    className="text-xs bg-surface-glass hover:bg-surface-glass-hover disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50 flex items-center space-x-1"
                  >
                    <i className={`fas fa-${action.icon} text-accent-primary`} aria-hidden="true" />
                    <span className="text-muted">{action.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
