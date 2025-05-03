import Image from 'next/image';

export interface Property {
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

interface PropertyCardProps {
  property: {
    bedrooms: number;
    bathrooms: number;
    floorsize?: number;
    price: number;
    address: string;
    title?: string;
    image_url: string;
    listing_id: string;
  };
  showActions?: boolean;
  isSaved?: boolean;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
}

export default function PropertyCard({ property, showActions = false, isSaved = false, onLike, onDislike }: PropertyCardProps) {
  const { bedrooms, bathrooms, floorsize, price, address, title, image_url, listing_id } = property;
  
  return (
    <div className="bg-white rounded-[16px] sm:rounded-[18px] shadow-[0_2px_15px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="relative">
        <div className="relative h-[160px] sm:h-[180px] w-full overflow-hidden">
          <Image 
            src={image_url} 
            alt={title || address}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="absolute top-2.5 right-2.5 flex space-x-1.5">
          <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
            {bedrooms} {bedrooms === 1 ? 'bed' : 'beds'}
          </span>
          <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
            {bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}
          </span>
        </div>
      </div>
      <div className="p-3.5 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1 mb-1">{title || address}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">{address}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm sm:text-base text-gray-900">
            ${price?.toLocaleString()}
            {floorsize ? <span className="font-normal text-gray-600 text-xs sm:text-sm ml-1">({Math.round(price / floorsize)}/sqft)</span> : null}
          </p>
          
          {showActions && (
            <div className="flex space-x-1 sm:space-x-2">
              <button 
                onClick={() => onDislike?.(listing_id)} 
                className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button 
                onClick={() => onLike?.(listing_id)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 ${
                  isSaved 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={isSaved ? 'currentColor' : 'none'}
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 