'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import Image from 'next/image';
import { HeartIcon as HeartIconOutline, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';
import { 
  HomeIcon, 
  HomeModernIcon,
  TruckIcon,
  Square3Stack3DIcon,
  StarIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  isSaved?: boolean;
  onLike?: (listing_id: string) => void;
  onDislike?: (listing_id: string) => void;
}

export default function PropertyCard({ 
  property, 
  showActions = false,
  isSaved = false,
  onLike,
  onDislike
}: PropertyCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const CardContent = ({ isDialog = false }: { isDialog?: boolean }) => (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${!isDialog && 'hover:shadow-md'}`}>
      {/* Property Image */}
      <div className="relative h-48 w-full">
        <img
          src={property.media.main_image_url || '/placeholder-house.jpg'}
          alt={property.basic_info.full_address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white font-semibold text-lg">
            ${property.basic_info.price_value?.toLocaleString() || 'Price on request'}
          </div>
        </div>
        {showActions && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isSaved ? onDislike?.(property.listing_id) : onLike?.(property.listing_id);
              }}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200"
            >
              {isSaved ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIconOutline className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          {property.basic_info.full_address}
        </h3>

        {/* Specifications */}
        <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
          <div className="flex items-center gap-1">
            <HomeIcon className="w-4 h-4" />
            <span>{property.basic_info.bedrooms_count} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <HomeModernIcon className="w-4 h-4" />
            <span>{property.basic_info.bathrooms_count} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <TruckIcon className="w-4 h-4" />
            <span>{property.basic_info.car_parks} cars</span>
          </div>
          {property.basic_info.land_size && (
            <div className="flex items-center gap-1">
              <Square3Stack3DIcon className="w-4 h-4" />
              <span>{property.basic_info.land_size}m²</span>
            </div>
          )}
        </div>

        {/* Recommendation Score */}
        {property.recommendation && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <StarIcon className="w-5 h-5" />
              <span className="font-medium">Match Score: {Math.round(property.recommendation.score * 100)}%</span>
            </div>
            {property.recommendation.highlights && property.recommendation.highlights.length > 0 && (
              <div className="space-y-2">
                {property.recommendation.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <ChartBarIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {property.recommendation?.explanation && (
          <div className="text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <ClipboardDocumentIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{property.recommendation.explanation}</span>
            </div>
          </div>
        )}

        {/* Location */}
        {isDialog && property.basic_info.suburb && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{property.basic_info.suburb}, {property.basic_info.state} {property.basic_info.postcode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        <CardContent />
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full">
            <CardContent isDialog={true} />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 