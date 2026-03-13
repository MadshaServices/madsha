'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, MinusCircle, Headphones, ThumbsUp, ThumbsDown } from 'lucide-react';

// ✅ Add this interface (missing in your code)
interface ChatSupportProps {
  onClose?: () => void;
  initialOpen?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatSupport({ onClose, initialOpen = false }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to MADSHA! I\'m Tom. How can I help you today? 😊'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Log conversation to database
  const logConversation = async (userMsg: string, botReply: string, topic?: string) => {
    try {
      await fetch('/api/log-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId.current
        },
        body: JSON.stringify({
          userMessage: userMsg,
          botResponse: botReply,
          topic: topic || 'general',
          page: window.location.pathname,
          timestamp: new Date()
        })
      });
    } catch (error) {
      console.error('Failed to log conversation:', error);
    }
  };

  // Handle feedback
  const handleFeedback = async (messageId: string, helpful: boolean, comment?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: sessionId.current,
          messageId,
          helpful,
          comment
        })
      });
      setShowFeedback(null);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const userMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMessageId,
      role: 'user',
      content: userMessage
    }]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      
      let assistantMessage = data.message || 'Sorry, I could not understand.';
      
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: assistantMessage
      }]);

      // Log conversation
      await logConversation(userMessage, assistantMessage, detectTopic(userMessage));
      
      // Show feedback for this message
      setShowFeedback(assistantMessageId);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: errorMessageId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again. 🙏'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple topic detection
  const detectTopic = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('password') || lower.includes('reset')) return 'password';
    if (lower.includes('register') || lower.includes('signup')) return 'registration';
    if (lower.includes('order') || lower.includes('track')) return 'order';
    if (lower.includes('payment') || lower.includes('pay')) return 'payment';
    if (lower.includes('delivery') || lower.includes('ship')) return 'delivery';
    if (lower.includes('account')) return 'account';
    return 'other';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isSubmitDisabled = isLoading || !input.trim();

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="group fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-50"
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-72' : 'w-96'}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-blue-600 font-bold text-xl">T</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Tom 🤖</h3>
                <span className="bg-green-400 w-2 h-2 rounded-full animate-pulse"></span>
              </div>
              <p className="text-xs text-blue-100">Learning from conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-500 rounded p-1 transition-colors"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={handleClose}
              className="text-white hover:bg-blue-500 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <span className="font-semibold text-blue-600 mr-2">Tom:</span>
                      )}
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Feedback buttons for assistant messages */}
                  {showFeedback === message.id && message.role === 'assistant' && (
                    <div className="flex justify-start gap-2 mt-1 ml-2">
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
                      >
                        👍 Helpful
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt('What was wrong with this answer?');
                          if (comment) handleFeedback(message.id, false, comment);
                        }}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition"
                      >
                        👎 Not Helpful
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="text-left">
                  <div className="inline-block bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}