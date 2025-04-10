'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import Image from 'next/image';
import { HeartIcon as HeartIconOutline, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  MapPinIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  SwatchIcon,
  BanknotesIcon,
  ScaleIcon,
  GlobeAsiaAustraliaIcon as TreeIcon
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageUrls = property.media.image_urls || [];
  const totalImages = imageUrls.length;
  
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };
  
  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  const CardContent = ({ isDialog = false }: { isDialog?: boolean }) => (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${!isDialog && 'hover:shadow-md'} ${!isDialog && 'h-[600px]'}`}>
      {/* Property Image with Carousel */}
      <div className={`relative ${isDialog ? 'h-72' : 'h-48'} w-full`}>
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {imageUrls.map((url, index) => (
              <Image
                key={index}
                src={url || '/placeholder-house.jpg'}
                alt={`${property.basic_info.full_address} - View ${index + 1}`}
                fill
                className="object-cover transition-opacity duration-300"
                style={{
                  opacity: index === (isDialog ? currentImageIndex : 0) ? 1 : 0,
                  zIndex: index === (isDialog ? currentImageIndex : 0) ? 1 : 0
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Image Navigation Controls (visible only in dialog) */}
        {isDialog && totalImages > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2.5 rounded-full text-white z-10 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2.5 rounded-full text-white z-10 transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
              {imageUrls.map((_, index) => (
                <span 
                  key={index} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`block w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-200 ${index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'}`}
                ></span>
              ))}
            </div>
          </>
        )}
        
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
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
      <div className={`p-4 ${!isDialog && 'h-[408px] overflow-hidden'}`}>
        {/* Address and Basic Info - Always on top */}
        <h3 className="font-semibold text-gray-900 mb-2 truncate" title={property.basic_info.full_address}>
          {property.basic_info.full_address}
        </h3>

        {/* Basic Specifications - Always second - Optimized for one row */}
        <div className="grid grid-cols-4 mb-3 text-gray-600">
          <div className="flex items-center gap-1">
            <HomeIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{property.basic_info.bedrooms_count} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <HomeModernIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{property.basic_info.bathrooms_count} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <TruckIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{property.basic_info.car_parks} car</span>
          </div>
          {property.basic_info.land_size && (
            <div className="flex items-center gap-1">
              <Square3Stack3DIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{property.basic_info.land_size}</span>
            </div>
          )}
        </div>
        
        {/* Additional Property Type Info */}
        {property.basic_info.property_type && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              {property.basic_info.property_type}
            </div>
            {property.events.inspection_date && (
              <div className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full truncate">
                {property.events.inspection_date}
              </div>
            )}
          </div>
        )}
        
        {/* Match Score and Recommendation Details - simplified version of dialog mode */}
        {!isDialog && property.recommendation && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <StarIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <span className="font-medium text-sm text-gray-800">Match Score: {Math.round(property.recommendation.score * 100)}%</span>
                  {property.investment_info?.rental_yield && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Yield: <span className="font-medium">{property.investment_info.rental_yield.toFixed(2)}%</span>
                      {property.investment_info.capital_gain && (
                        <span className={`ml-2 ${property.investment_info.capital_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Capital Growth: {property.investment_info.capital_gain >= 0 ? '+' : ''}{property.investment_info.capital_gain.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Simplified explanation shown first */}
            {property.recommendation?.explanation && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 line-clamp-3">{property.recommendation.explanation}</p>
              </div>
            )}
            
            {/* Highlights and Concerns in separate boxes - Grid layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Highlights Box */}
              {property.recommendation?.highlights && property.recommendation.highlights.length > 0 && (
                <div className="bg-indigo-50 bg-opacity-60 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-900 mb-2">Highlights</h5>
                  <div className="space-y-1.5">
                    {property.recommendation.highlights.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                    {property.recommendation.highlights.length > 3 && (
                      <div className="text-xs text-gray-500 mt-1 pl-3.5">
                        +{property.recommendation.highlights.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Concerns Box */}
              {property.recommendation?.concerns && property.recommendation.concerns.length > 0 && (
                <div className="bg-gray-50 bg-opacity-60 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-900 mb-2">Concerns</h5>
                  <div className="space-y-1.5">
                    {property.recommendation.concerns.slice(0, 3).map((concern, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1 flex-shrink-0"></div>
                        <span>{concern}</span>
                      </div>
                    ))}
                    {property.recommendation.concerns.length > 3 && (
                      <div className="text-xs text-gray-500 mt-1 pl-3.5">
                        +{property.recommendation.concerns.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded Details for Dialog */}
        {isDialog && property.analysis && (
          <div className="mt-5 space-y-5">
            {/* Recommendation details in full dialog mode */}
            {property.recommendation && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-indigo-100 rounded-full p-1.5 flex-shrink-0">
                    <StarIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span>Recommendation Details</span>
                </h4>
                
                {/* Explanation */}
                {property.recommendation.explanation && (
                  <div className="mb-4 text-sm text-gray-700">
                    {property.recommendation.explanation}
                  </div>
                )}
                
                {/* Grid layout for highlights and concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Highlights */}
                  {property.recommendation.highlights && property.recommendation.highlights.length > 0 && (
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-900 mb-2">Highlights</h5>
                      <div className="grid grid-cols-1 gap-1.5">
                        {property.recommendation.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concerns */}
                  {property.recommendation.concerns && property.recommendation.concerns.length > 0 && (
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-900 mb-2">Concerns</h5>
                      <div className="grid grid-cols-1 gap-1.5">
                        {property.recommendation.concerns.map((concern, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                            <span>{concern}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property Features - Combined Interior and Exterior */}
            {property.analysis.interior_features && Object.keys(property.analysis.interior_features).length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0">
                    <HomeModernIcon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span>Interior Features</span>
                </h4>
                
                {/* Single column layout for interior only */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {/* Interior Features */}
                  {Object.entries(property.analysis.interior_features).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                      <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interior Quality & Style */}
            {property.analysis.interior_quality_style && Object.keys(property.analysis.interior_quality_style).length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-purple-100 rounded-full p-1.5 flex-shrink-0">
                    <SwatchIcon className="w-5 h-5 text-purple-700" />
                  </div>
                  <span>Interior Quality & Style</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(property.analysis.interior_quality_style).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                      <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Environment Analysis */}
            {property.analysis.environment && Object.keys(property.analysis.environment).length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-green-100 rounded-full p-1.5 flex-shrink-0">
                    <TreeIcon className="w-5 h-5 text-green-700" />
                  </div>
                  <span>Environment</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(property.analysis.environment).filter(([key, value]) => 
                    key !== 'sustainability_features' && value !== undefined && value !== null && value !== ''
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></div>
                      <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Exterior Features */}
            {property.analysis.exterior_features && Object.keys(property.analysis.exterior_features).length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-amber-100 rounded-full p-1.5 flex-shrink-0">
                    <BuildingOfficeIcon className="w-5 h-5 text-amber-700" />
                  </div>
                  <span>Exterior Features</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(property.analysis.exterior_features).filter(([_, value]) => 
                    value !== undefined && value !== null && value !== ''
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></div>
                      <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Defect Assessment */}
            {property.analysis.visible_defects && Object.keys(property.analysis.visible_defects).length > 0 && (
              <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-rose-100 rounded-full p-1.5 flex-shrink-0">
                    <ShieldCheckIcon className="w-5 h-5 text-rose-700" />
                  </div>
                  <span>Defect Assessment</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(property.analysis.visible_defects).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></div>
                      <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Info */}
            {property.investment_info && Object.values(property.investment_info).some(v => v !== null && v !== undefined) && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                    <BanknotesIcon className="w-5 h-5 text-blue-700" />
                  </div>
                  <span>Investment Metrics</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {property.investment_info.rental_yield !== null && property.investment_info.rental_yield !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <span className="text-gray-600 whitespace-nowrap">Rental Yield:</span>
                      <span className="font-medium text-gray-900 truncate">{property.investment_info.rental_yield.toFixed(2)}%</span>
                    </div>
                  )}
                  {property.investment_info.capital_gain !== null && property.investment_info.capital_gain !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <span className="text-gray-600 whitespace-nowrap">Capital Gain:</span>
                      <span className={`font-medium ${property.investment_info.capital_gain >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                        {property.investment_info.capital_gain >= 0 ? '+' : ''}{property.investment_info.capital_gain.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {property.investment_info.weekly_rent !== null && property.investment_info.weekly_rent !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <span className="text-gray-600 whitespace-nowrap">Weekly Rent:</span>
                      <span className="font-medium text-gray-900 truncate">${property.investment_info.weekly_rent}</span>
                    </div>
                  )}
                  {property.investment_info.current_price !== null && property.investment_info.current_price !== undefined && 
                    property.investment_info.current_price !== property.basic_info.price_value && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <span className="text-gray-600 whitespace-nowrap">Estimated Price:</span>
                      <span className="font-medium text-gray-900 truncate">${property.investment_info.current_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Planning Info */}
            {property.planning_info && Object.entries(property.planning_info).some(([_, value]) => value !== undefined && value !== null) && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0">
                    <ScaleIcon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span>Planning Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(property.planning_info).map(([key, value]) => (
                    value !== undefined && value !== null ? (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                        <span className="text-gray-600 capitalize whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium text-gray-900 truncate">{value === true ? 'Yes' : value === false ? 'No' : value}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        {isDialog && property.basic_info.suburb && (
          <div className="mt-5 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 flex-shrink-0 text-gray-500" />
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
        
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-xl transform transition-all">
            <div className="max-h-[80vh] overflow-y-auto">
              <CardContent isDialog={true} />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 