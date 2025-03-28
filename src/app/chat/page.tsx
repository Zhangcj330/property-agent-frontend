'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '@/components/molecules/PropertyCard';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Property interface
interface Property {
  id: number;
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  location: string;
  image: string;
  description: string;
}

// Message types
type MessageType = 'user' | 'assistant' | 'property';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  property?: Property;
}

// API interface
interface ChatRequest {
  session_id?: string;
  user_input: string;
  preferences?: Record<string, string>;
  search_params?: Record<string, string>;
}

interface ChatResponse {
  session_id: string;
  response: string;
  preferences?: Record<string, string>;
  search_params?: Record<string, string>;
  is_complete: boolean;
}

// Client-side only counter for generating unique IDs
let messageIdCounter = 1;

// Session ID management
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    // Generate UUID v4
    sessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'assistant',
      content: 'Hello! I\'m your AI property assistant. How can I help you find your dream home today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessedRef = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session ID on mount
  useEffect(() => {
    const currentSessionId = getOrCreateSessionId();
    setSessionId(currentSessionId);
  }, []);

  // Call API to get response
  const handleApiCall = useCallback(async (userInput: string) => {
    setIsLoading(true);

    try {
      const payload: ChatRequest = {
        session_id: sessionId!,  // We know it's not null because we initialize it on mount
        user_input: userInput,
        preferences: preferences,
        search_params: searchParams
      };

      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      // Save updated preferences and search parameters if provided
      if (data.preferences) {
        setPreferences(data.preferences);
      }
      if (data.search_params) {
        setSearchParams(data.search_params);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: String(messageIdCounter++),
        type: 'assistant',
        content: data.response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: String(messageIdCounter++),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, preferences, searchParams]);

  // Handle initial message from URL
  useEffect(() => {
    if (!sessionId) return; // Wait for session ID to be initialized
    
    const params = new URLSearchParams(window.location.search);
    const initialMessage = params.get('initial_message');
    
    if (initialMessage && !initialMessageProcessedRef.current) {
      initialMessageProcessedRef.current = true;
      const decodedMessage = decodeURIComponent(initialMessage);
      
      // Add user message
      const userMessage: Message = {
        id: String(messageIdCounter++),
        type: 'user',
        content: decodedMessage,
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Call API
      handleApiCall(decodedMessage);
    }
  }, [handleApiCall, sessionId]); // Add sessionId as dependency

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Set chat container height to viewport height minus header
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight;
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = `calc(${vh}px - 64px - 1px)`;
      }
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: String(messageIdCounter++),
      type: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    
    // Call API with user input
    await handleApiCall(userInput);
  };

  // Handle input changes with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Reset height to auto to properly calculate scrollHeight
    e.target.style.height = 'auto';
    // Set height based on content (with max height)
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  // Handle property feedback
  const handlePropertyFeedback = (propertyId: number, liked: boolean) => {
    // In a real app, you would send this feedback to your backend
    console.log(`Property ${propertyId} ${liked ? 'liked' : 'disliked'}`);
    
    // Add a response based on the feedback
    const feedbackResponse: Message = {
      id: String(messageIdCounter++),
      type: 'assistant',
      content: liked 
        ? 'Great! I\'ll keep that in mind for future recommendations. Would you like to see more properties like this one?' 
        : 'Thanks for the feedback. Can you tell me what you didn\'t like about it so I can refine my recommendations?',
    };
    
    setMessages((prev) => [...prev, feedbackResponse]);
  };

  // Add function to start new chat
  const startNewChat = useCallback(() => {
    // Generate new session ID
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
    
    // Reset chat state
    setMessages([{
      id: '0',
      type: 'assistant',
      content: 'Hello! I\'m your AI property assistant. How can I help you find your dream home today?',
    }]);
    setPreferences({});
    setSearchParams({});
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8f8f8] overflow-hidden">
      {/* Chat Header */}
      <header className="bg-white/70 backdrop-blur-xl py-5 px-5 sm:px-8 sticky top-0 z-10 border-b border-gray-100/50 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <div>
              <h1 className="font-medium text-lg text-gray-900">Property Assistant</h1>
              <p className="text-xs text-gray-500 font-medium">Online • Replies instantly</p>
            </div>
          </div>
          {/* Add New Chat Button */}
          <button
            onClick={startNewChat}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-5 sm:px-8 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="overflow-y-auto flex-1 scroll-smooth px-3 pt-6 pb-2"
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-7`}
              >
                {message.type === 'property' ? (
                  <div className="w-full max-w-lg">
                    <div className="flex items-start mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex-shrink-0 flex items-center justify-center text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                      </div>
                      <div className="chat-bubble chat-bubble-assistant rounded-[18px] py-3.5 px-4 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] text-gray-800">{message.content}</div>
                    </div>
                    <div className="ml-12">
                      <PropertyCard 
                        property={message.property!} 
                        onLike={() => handlePropertyFeedback(message.property!.id, true)}
                        onDislike={() => handlePropertyFeedback(message.property!.id, false)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start max-w-[75%]">
                    {message.type === 'assistant' && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex-shrink-0 flex items-center justify-center text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                      </div>
                    )}
                    <div 
                      className={`chat-bubble rounded-[18px] py-3.5 px-4 ${
                        message.type === 'user' 
                          ? 'chat-bubble-user bg-gradient-to-br from-gray-800 to-black text-white shadow-[0_2px_15px_rgba(0,0,0,0.2)]'
                          : 'chat-bubble-assistant bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.type === 'user' && (
                      <div className="w-9 h-9 rounded-full ml-3 overflow-hidden flex-shrink-0 bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full p-2 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-7"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex-shrink-0 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <div className="bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] rounded-[18px] py-3.5 px-5 min-w-[70px] flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messageEndRef} />
        </div>
      </main>
      
      {/* Input Bar */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl py-5 px-5 sm:px-8 border-t border-gray-100/40 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="flex items-end rounded-[18px] bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus-within:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message..."
              className="flex-1 py-3.5 px-4 resize-none min-h-[24px] max-h-[150px] border-none focus:outline-none bg-transparent text-gray-800"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3.5 mr-1 disabled:text-gray-300 transition-colors duration-200"
              style={{ 
                color: input.trim() ? 'rgb(31, 41, 55)' : 'rgb(209, 213, 219)'
              }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 