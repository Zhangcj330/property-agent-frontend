'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/molecules/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<PropertyWithRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chat_session_id');
    setSessionId(storedSessionId);
  }, []);

  // Load saved properties when session ID is available
  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!sessionId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/saved_properties/${sessionId}`);
        if (!response.ok) {
          throw new Error(`Failed to load saved properties: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSavedProperties(data.properties);
      } catch (error) {
        console.error('Error loading saved properties:', error);
        setError(error instanceof Error ? error.message : 'Failed to load saved properties');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProperties();
  }, [sessionId]);

  // Handle property removal
  const handleRemoveProperty = async (listing_id: string) => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/saved_properties/${sessionId}/${listing_id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove property: ${response.statusText}`);
      }

      // Remove property from local state
      setSavedProperties(prev => prev.filter(p => p.property.listing_id !== listing_id));
    } catch (error) {
      console.error('Error removing property:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-12">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl py-5 px-5 sm:px-8 sticky top-0 z-10 border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Saved Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : savedProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h3>
            <p className="text-gray-500">Properties you save will appear here</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="grid grid-cols-1 gap-6">
              {savedProperties.map((item) => (
                <motion.div
                  key={item.property.listing_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard
                    property={{ ...item.property, recommendation: item.recommendation }}
                    showActions={true}
                    isSaved={true}
                    onDislike={() => handleRemoveProperty(item.property.listing_id)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
} 