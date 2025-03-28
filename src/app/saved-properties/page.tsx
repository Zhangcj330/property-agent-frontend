'use client';

import { useState } from 'react';
import PropertyCard from '@/components/molecules/PropertyCard';
import Link from 'next/link';

// Mock saved properties (in a real app, this would come from API/backend)
const savedProperties = [
  {
    id: 1,
    title: 'Modern Apartment in Downtown',
    price: '$2,500/month',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200 sq ft',
    location: 'Downtown, City Center',
    image: '/property-1.jpg',
    description: 'A beautiful modern apartment in the heart of downtown with stunning city views and high-end finishes.',
  },
  {
    id: 3,
    title: 'Luxury Penthouse with Terrace',
    price: '$4,500/month',
    bedrooms: 3,
    bathrooms: 3,
    area: '2,100 sq ft',
    location: 'Riverside, East End',
    image: '/property-3.jpg',
    description: 'Exclusive penthouse with a private terrace, panoramic views, and premium amenities including a gym and pool.',
  }
];

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState(savedProperties);
  
  // Handle property removal
  const handleRemoveProperty = (id: number) => {
    setProperties(properties.filter(property => property.id !== id));
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Properties</h1>
      
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-neutral-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No saved properties yet</h2>
          <p className="text-neutral-500 mb-6">Properties you like will appear here for easy access</p>
          <Link href="/chat" className="btn btn-primary">
            Start exploring properties
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="relative">
              <PropertyCard 
                property={property}
                onLike={() => {}} // No-op for saved page
                onDislike={() => handleRemoveProperty(property.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 