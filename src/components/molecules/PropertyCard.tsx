'use client';

import React from 'react';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

interface PropertyCardProps {
  property: Property;
  onLike: () => void;
  onDislike: () => void;
}

export default function PropertyCard({ property, onLike, onDislike }: PropertyCardProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const handleLike = () => {
    if (!liked && !disliked) {
      setLiked(true);
      onLike();
    }
  };
  
  const handleDislike = () => {
    if (!liked && !disliked) {
      setDisliked(true);
      onDislike();
    }
  };
  
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-[16px] bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] mb-5"
    >
      {/* Property Image */}
      <div className="relative h-60 w-full bg-gray-50 overflow-hidden">
        {/* Placeholder for image - in a real app, use actual property images */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-gradient-to-br from-gray-800 to-black px-3.5 py-1.5 rounded-full text-sm font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
          {property.price}
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 text-gray-900">{property.title}</h3>
        <p className="text-gray-500 text-sm mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {property.location}
        </p>
        
        {/* Property Specs */}
        <div className="flex gap-6 text-sm py-4 mb-4 border-t border-b border-gray-100">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="font-medium text-gray-900">{property.bedrooms}</span>
            <span className="ml-1 text-gray-500">Beds</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-gray-900">{property.bathrooms}</span>
            <span className="ml-1 text-gray-500">Baths</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span className="font-medium text-gray-900">{property.area}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-5 line-clamp-2">{property.description}</p>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <motion.button 
            onClick={handleDislike} 
            disabled={liked || disliked}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center h-10 px-5 rounded-full transition-all duration-300 ${
              disliked
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } ${(liked || disliked) && !disliked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <XMarkIcon className="h-4 w-4 mr-1.5" />
            <span className="text-sm font-medium">Not for me</span>
          </motion.button>
          
          <motion.button 
            onClick={handleLike} 
            disabled={liked || disliked}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center h-10 px-5 rounded-full transition-all duration-300 ${
              liked
                ? 'bg-gradient-to-br from-gray-800 to-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } ${(liked || disliked) && !liked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {liked ? (
              <HeartIconSolid className="h-4 w-4 mr-1.5 text-white" />
            ) : (
              <HeartIcon className="h-4 w-4 mr-1.5" />
            )}
            <span className="text-sm font-medium">{liked ? 'Liked' : 'Like'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 