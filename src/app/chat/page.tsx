'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import PropertyCard from '@/components/molecules/PropertyCard';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Property interface
interface Property {
  listing_id: string;
  basic_info: {
    price_value: number;
    price_is_numeric: boolean;
    full_address: string;
    street_address: string;
    suburb: string;
    state: string;
    postcode: string;
    bedrooms_count: number;
    bathrooms_count: number;
    car_parks: string;
    land_size: string;
    property_type: string;
  };
  media: {
    image_urls: string[];
    main_image_url: string;
    video_url: string;
  };
  agent: {
    agent_name: string;
    agency: string;
    contact_number: string;
    email: string;
  };
  events: {
    inspection_date: string;
    inspection_times: string[];
    auction_date: string;
    listing_date: string;
    last_updated_date: string;
  };
  metadata: {
    created_at: string;
    updated_at: string;
    last_analysis_at: string;
    source: string;
    status: string;
  };
  analysis: Record<string, unknown>;
  investment_info?: {
    rental_yield: number;
    capital_gain: number;
    current_price: number;
    weekly_rent: number;
  };
  planning_info?: Record<string, unknown>;
  recommendation?: {
    score: number;
    highlights: string[];
    concerns: string[];
    explanation: string;
  };
}

interface PropertyWithRecommendation {
  property: Property;
  recommendation: {
    score: number;
    highlights: string[];
    concerns: string[];
    explanation: string;
  };
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
  latest_recommendation?: PropertyRecommendationResponse;
}

interface PropertyRecommendationResponse {
  properties: Array<{
    property: {
      listing_id: string;
      basic_info: {
        price_value: number | null;
        price_is_numeric: boolean;
        full_address: string;
        street_address: string;
        suburb: string;
        state: string;
        postcode: string;
        bedrooms_count: number;
        bathrooms_count: number;
        car_parks: string;
        land_size: string;
        property_type: string;
      };
      media: {
        image_urls: string[];
      };
      agent: {
        agent_name: string;
      };
      events: {
        inspection_date: string | null;
        auction_date: string | null;
      };
      metadata: {
        created_at: string;
        updated_at: string;
        source: string;
        status: string;
      };
      analysis: Record<string, unknown> | null;
      investment_info?: {
        rental_yield: number;
        capital_gain: number;
        current_price: number;
        weekly_rent: number;
      };
      planning_info?: {
        zone_name?: string;
        height_limit?: string;
        floor_space_ratio?: string;
        min_lot_size?: string;
        is_heritage?: boolean;
        flood_risk?: boolean;
        landslide_risk?: boolean;
        zoning?: string;
        overlays?: string[];
        potential?: string;
      };
    };
    recommendation: {
      score: number;
      highlights: string[];
      concerns: string[];
      explanation: string;
    };
  }>;
}

// Client-side only counter for generating unique IDs
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

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

// Transform API response to Property interface
const transformPropertyData = (propertyWithRecommendation: PropertyRecommendationResponse['properties'][0]): Property => {
  const { property, recommendation } = propertyWithRecommendation;
  
  return {
    listing_id: property.listing_id,
    basic_info: {
      price_value: property.basic_info.price_value || 0,
      price_is_numeric: property.basic_info.price_is_numeric,
      full_address: property.basic_info.full_address,
      street_address: property.basic_info.street_address,
      suburb: property.basic_info.suburb,
      state: property.basic_info.state,
      postcode: property.basic_info.postcode,
      bedrooms_count: property.basic_info.bedrooms_count,
      bathrooms_count: property.basic_info.bathrooms_count,
      car_parks: property.basic_info.car_parks,
      land_size: property.basic_info.land_size,
      property_type: property.basic_info.property_type,
    },
    media: {
      image_urls: property.media.image_urls,
      main_image_url: property.media.image_urls[0] || '/placeholder-property.jpg',
      video_url: '',
    },
    agent: {
      agent_name: property.agent.agent_name,
      agency: '',
      contact_number: '',
      email: '',
    },
    events: {
      inspection_date: property.events.inspection_date || '',
      inspection_times: [],
      auction_date: property.events.auction_date || '',
      listing_date: '',
      last_updated_date: property.metadata.updated_at,
    },
    metadata: {
      created_at: property.metadata.created_at,
      updated_at: property.metadata.updated_at,
      last_analysis_at: '',
      source: property.metadata.source,
      status: property.metadata.status,
    },
    analysis: property.analysis || {},
    investment_info: property.investment_info ? {
      rental_yield: property.investment_info.rental_yield,
      capital_gain: property.investment_info.capital_gain,
      current_price: property.investment_info.current_price,
      weekly_rent: property.investment_info.weekly_rent,
    } : undefined,
    planning_info: property.planning_info || undefined,
    recommendation: recommendation ? {
      score: recommendation.score,
      highlights: recommendation.highlights,
      concerns: recommendation.concerns,
      explanation: recommendation.explanation,
    } : undefined,
  };
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUniqueId(),
      type: 'assistant',
      content: 'Hello! I\'m your AI property assistant. How can I help you find your dream home today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessedRef = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const historyLoadedRef = useRef(false);

  // Initialize session ID on mount
  useEffect(() => {
    const currentSessionId = getOrCreateSessionId();
    if (currentSessionId) {
      setSessionId(currentSessionId);
    }
  }, []);

  // Initialize saved properties from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedProperties');
    if (saved) {
      setSavedProperties(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save properties to localStorage when updated
  useEffect(() => {
    localStorage.setItem('savedProperties', JSON.stringify(Array.from(savedProperties)));
  }, [savedProperties]);

  // Add this effect to load conversation history when the session ID changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId || historyLoadedRef.current) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/v1/conversation/${sessionId}`);
        if (!response.ok) {
          console.error('History fetch failed:', {
            status: response.status,
            statusText: response.statusText
          });
          return;
        }
        
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const history = data.messages.map((msg: {
            type?: string;
            recommendation?: PropertyRecommendationResponse;
            role?: string;
            content?: string;
          }) => {
            if (msg.type === 'property_recommendation' && msg.recommendation && msg.recommendation.properties) {
              return msg.recommendation.properties.map((propertyWithRecommendation) => ({
                id: generateUniqueId(),
                type: 'property' as MessageType,
                content: "Here's a property that matches your criteria:",
                property: transformPropertyData(propertyWithRecommendation),
              }));
            } else if (msg.role === 'user') {
              return {
                id: generateUniqueId(),
                type: 'user' as MessageType,
                content: msg.content || '',
              };
            } else if (msg.role === 'assistant') {
              return {
                id: generateUniqueId(),
                type: 'assistant' as MessageType,
                content: msg.content || '',
              };
            }
            return null;
          }).flat().filter(Boolean);
          
          setMessages(history);
        }
      } catch (error) {
        console.error('Error loading history:', error);
        // 出错时至少保留初始欢迎消息
        setMessages([{
          id: generateUniqueId(),
          type: 'assistant',
          content: 'Hello! I\'m your AI property assistant. How can I help you find your dream home today?',
        }]);
      } finally {
        historyLoadedRef.current = true;
      }
    };

    loadHistory();
  }, [sessionId]);

  // Call API to get response
  const handleApiCall = useCallback(async (userInput: string) => {
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        session_id: sessionId || undefined,
        user_input: userInput,
        preferences,
        search_params: searchParams,
      };

      console.log('Sending request:', JSON.stringify(chatRequest, null, 2));

      const response = await fetch('http://localhost:8000/api/v1/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Chat API failed with status ${response.status}. Details: ${errorText}`);
      }

      const data: ChatResponse = await response.json();
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      console.log('Response text:', data.response);
      console.log('Latest recommendations:', JSON.stringify(data.latest_recommendation, null, 2));
      
      // Save updated preferences and search parameters
      if (data.preferences) {
        console.log('Updated preferences:', data.preferences);
        setPreferences(data.preferences);
      }
      if (data.search_params) {
        console.log('Updated search params:', data.search_params);
        setSearchParams(data.search_params);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: generateUniqueId(),
        type: 'assistant',
        content: data.response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // If there are latest recommendations, show them
      if (data.latest_recommendation?.properties) {
        console.log('Number of properties:', data.latest_recommendation.properties.length);
        // Add each property as a message
        for (const propertyWithRecommendation of data.latest_recommendation.properties) {
          console.log('Processing property:', JSON.stringify(propertyWithRecommendation, null, 2));
          const transformedProperty = transformPropertyData(propertyWithRecommendation);
          console.log('Transformed property:', JSON.stringify(transformedProperty, null, 2));
          const propertyMessage: Message = {
            id: generateUniqueId(),
            type: 'property',
            content: 'Here\'s a property that matches your criteria:',
            property: transformedProperty
          };
          
          console.log('Adding property message:', JSON.stringify(propertyMessage, null, 2));
          setMessages((prev) => [...prev, propertyMessage]);
        }

        // Don't add summary message again since we already added the response
      } else {
        console.log('No recommendations found in response');
      }
    } catch (error) {
      console.error('Error in chat flow:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueId(),
        type: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}. Please try again later.`
          : 'Sorry, I encountered an error while processing your request. Please try again later.',
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
        id: generateUniqueId(),
        type: 'user',
        content: decodedMessage,
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Call handleApiCall with the initial message
      handleApiCall(decodedMessage);
    }
  }, [handleApiCall, sessionId]);

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
      id: generateUniqueId(),
      type: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    
    // Call handleApiCall with user input
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

  // Handle property saving
  const handleSaveProperty = async (listing_id: string) => {
    try {
      // Find the property from messages
      const propertyMessage = messages.find(m => 
        m.type === 'property' && 
        m.property?.listing_id === listing_id
      );
      
      if (!propertyMessage?.property) {
        console.error('Property not found in messages');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/saved_properties/?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property: propertyMessage.property,
          recommendation: propertyMessage.property.recommendation
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save property: ${response.statusText}`);
      }

      setSavedProperties(prev => {
        const newSet = new Set(prev);
        newSet.add(listing_id);
        return newSet;
      });
    } catch (error) {
      console.error('Error saving property:', error);
      // You might want to show an error toast here
    }
  };

  // Handle property removal from saved list
  const handleRemoveProperty = async (listing_id: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/saved_properties/${sessionId}/${listing_id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove property: ${response.statusText}`);
      }

      setSavedProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(listing_id);
        return newSet;
      });
    } catch (error) {
      console.error('Error removing property:', error);
      // You might want to show an error toast here
    }
  };

  // Add function to start new chat
  const startNewChat = useCallback(() => {
    // Generate new session ID
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
    
    // Reset chat state
    setMessages([{
      id: generateUniqueId(),
      type: 'assistant',
      content: 'Hello! I\'m your AI property assistant. How can I help you find your dream home today?',
    }]);
    setPreferences({});
    setSearchParams({});
    historyLoadedRef.current = false;
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
                    <div className="ml-12 relative group">
                      <PropertyCard 
                        property={message.property!}
                        showActions={true}
                        isSaved={savedProperties.has(message.property!.listing_id)}
                        onLike={handleSaveProperty}
                        onDislike={handleRemoveProperty}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start max-w-[75%] space-x-3">
                    {message.type === 'assistant' && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex-shrink-0 flex items-center justify-center text-white">
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
                      <div className={`prose ${message.type === 'user' ? 'prose-invert' : ''} max-w-none prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-pre:my-1 prose-pre:bg-gray-100/10 prose-pre:rounded-lg prose-pre:p-2`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            a: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
                              <a 
                                href={href}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return (
                                <code
                                  className={`${inline ? 'bg-gray-100/10 rounded px-1 py-0.5' : 'block bg-gray-100/10 rounded p-2 overflow-x-auto'} ${match ? `language-${match[1]}` : ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
                              <pre className="bg-gray-100/10 rounded-lg p-2 overflow-x-auto" {...props}>{children}</pre>
                            ),
                            ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
                              <ul className="list-disc list-inside" {...props}>{children}</ul>
                            ),
                            ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
                              <ol className="list-decimal list-inside" {...props}>{children}</ol>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
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