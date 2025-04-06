'use client';

import { useState } from 'react';
import PropertyCard from '@/components/molecules/PropertyCard';
import Link from 'next/link';
import { Property } from '@/types/property';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Mock saved properties (in a real app, this would come from API/backend)
const savedProperties: Property[] = [
  {
    listing_id: '1',
    basic_info: {
      price_value: 1750000,
      price_is_numeric: true,
      full_address: '123 Downtown Street, City Center',
      street_address: '123 Downtown Street',
      suburb: 'City Center',
      state: 'NSW',
      postcode: '2000',
      bedrooms_count: 2,
      bathrooms_count: 2,
      car_parks: '1',
      land_size: '1,200 sqm',
      property_type: 'Apartment'
    },
    media: {
      image_urls: ['https://view.com.au/viewstatic/images/listing/1-bedroom-apartment-in-bondi-nsw-2026/500-w/16056415-1-62B4D46.jpg'],
      main_image_url: 'https://view.com.au/viewstatic/images/listing/1-bedroom-apartment-in-bondi-nsw-2026/500-w/16056415-1-62B4D46.jpg',
      video_url: ''
    },
    agent: {
      agent_name: 'John Smith',
      agency: 'Premier Real Estate',
      contact_number: '0400 000 000',
      email: 'john@premier.com'
    },
    events: {
      inspection_date: '',
      inspection_times: [],
      auction_date: '',
      listing_date: '',
      last_updated_date: '2024-03-20'
    },
    metadata: {
      created_at: '2024-03-20',
      updated_at: '2024-03-20',
      last_analysis_at: '',
      source: 'view.com.au',
      status: 'active'
    },
    analysis: {},
    recommendation: {
      score: 0.85,
      highlights: ['Prime downtown location', 'Modern finishes', 'Great city views'],
      concerns: ['High price per square meter'],
      explanation: 'A beautiful modern apartment in the heart of downtown with stunning city views and high-end finishes.'
    }
  },
  {
    listing_id: '2',
    basic_info: {
      price_value: 2250000,
      price_is_numeric: true,
      full_address: '456 Riverside Avenue, East End',
      street_address: '456 Riverside Avenue',
      suburb: 'East End',
      state: 'NSW',
      postcode: '2000',
      bedrooms_count: 3,
      bathrooms_count: 3,
      car_parks: '2',
      land_size: '2,100 sqm',
      property_type: 'Penthouse'
    },
    media: {
      image_urls: ['https://view.com.au/viewstatic/images/listing/3-bedroom-apartment-in-bondi-nsw-2026/500-w/16570962-1-C20F2A2.jpg'],
      main_image_url: 'https://view.com.au/viewstatic/images/listing/3-bedroom-apartment-in-bondi-nsw-2026/500-w/16570962-1-C20F2A2.jpg',
      video_url: ''
    },
    agent: {
      agent_name: 'Sarah Johnson',
      agency: 'Luxury Homes',
      contact_number: '0400 111 111',
      email: 'sarah@luxuryhomes.com'
    },
    events: {
      inspection_date: '',
      inspection_times: [],
      auction_date: '',
      listing_date: '',
      last_updated_date: '2024-03-20'
    },
    metadata: {
      created_at: '2024-03-20',
      updated_at: '2024-03-20',
      last_analysis_at: '',
      source: 'view.com.au',
      status: 'active'
    },
    analysis: {},
    recommendation: {
      score: 0.9,
      highlights: ['Exclusive penthouse', 'Private terrace', 'Premium amenities'],
      concerns: ['High maintenance costs'],
      explanation: 'Exclusive penthouse with a private terrace, panoramic views, and premium amenities including a gym and pool.'
    }
  }
];

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState(savedProperties);
  
  // Handle property removal
  const handleRemoveProperty = (listing_id: string) => {
    setProperties(properties.filter(property => property.listing_id !== listing_id));
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Saved Properties</h1>
        <Link 
          href="/chat" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md"
        >
          Find More Properties
        </Link>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-neutral-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No saved properties yet</h2>
          <p className="text-neutral-500 mb-6">Properties you like will appear here for easy access</p>
          <Link 
            href="/chat" 
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-gray-800 to-black rounded-full shadow-sm hover:from-gray-900 hover:to-black transition-all duration-200 hover:shadow-md"
          >
            Start exploring properties
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.listing_id} className="group relative">
              <PropertyCard property={property} />
              <button
                onClick={() => handleRemoveProperty(property.listing_id)}
                className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-100 text-gray-400 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                title="Remove from saved properties"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 