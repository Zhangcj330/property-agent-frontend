'use client';

import { useState } from 'react';
import PropertyCard from '@/components/molecules/PropertyCard';
import Link from 'next/link';
import { Property } from '@/types/property';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Mock saved properties (in a real app, this would come from API/backend)
const savedProperties: Property[] = [
  {
    listing_id: 'listing-16617566',
    basic_info: {
      price_value: 3552866,
      price_is_numeric: true,
      full_address: '52 Hawthorne Avenue, Chatswood, NSW 2067',
      street_address: '52 Hawthorne Avenue',
      suburb: 'Chatswood',
      state: 'NSW',
      postcode: '2067',
      bedrooms_count: 5,
      bathrooms_count: 3,
      car_parks: '3',
      land_size: '651㎡',
      property_type: 'House'
    },
    media: {
      image_urls: [
        'https://view.com.au/viewstatic/images/listing/5-bedroom-house-in-chatswood-nsw-2067/500-w/16617566-1-F83667E.jpg',
        'https://view.com.au/viewstatic/images/listing/5-bedroom-house-in-chatswood-nsw-2067/500-w/16617566-2-A2BAC1B.jpg',
        'https://view.com.au/viewstatic/images/listing/5-bedroom-house-in-chatswood-nsw-2067/500-w/16617566-15-1D9DD18.jpg'
      ],
      main_image_url: 'https://view.com.au/viewstatic/images/listing/5-bedroom-house-in-chatswood-nsw-2067/500-w/16617566-1-F83667E.jpg',
      video_url: ''
    },
    agent: {
      agent_name: 'Ray White Ay Realty Chatswood',
      agency: 'Ray White',
      contact_number: '0400 000 000',
      email: 'chatswood@raywhite.com'
    },
    events: {
      inspection_date: 'Auction Sat 17 May',
      inspection_times: [],
      auction_date: '',
      listing_date: '',
      last_updated_date: '2024-04-10'
    },
    metadata: {
      created_at: '2024-04-10',
      updated_at: '2024-04-10',
      last_analysis_at: '2024-04-10',
      source: 'scraper',
      status: 'active'
    },
    analysis: {
      interior_features: {
        kitchen_condition: 'Modern/Updated',
        flooring_type: 'Wood',
        flooring_condition: 'Good',
        bathroom_condition: 'Modern/Updated'
      },
      visible_defects: {
        general_disrepair: 'Absent',
        structural_damage: 'Absent',
        roof_gutter_damage: 'Absent',
        external_cracks: 'Absent'
      },
      environment: {
        greenery: 'Abundant',
        privacy: 'High',
        pole_or_line_of_sight: 'No',
        noise_exposure: 'Low',
        land_flatness: 'Slightly Sloped',
        lighting_conditions: 'Bright',
        sustainability_features: [],
        road_proximity: 'Far'
      },
      exterior_features: {
        roof_material: 'Tile',
        parking_type: 'Driveway',
        solar_panels: 'No',
        garden_condition: 'Well-maintained',
        external_fencing: 'None',
        facade_condition: 'Well-maintained',
        building_materials: 'Brick'
      },
      interior_quality_style: {
        renovation_status: 'Partially Renovated',
        kitchen_style: 'Modern/Updated',
        paint_decor: 'Neutral',
        design_style: 'Transitional',
        lighting_natural_light: 'Bright'
      }
    },
    investment_info: {
      rental_yield: 2.25,
      capital_gain: -19.07,
      current_price: 3552866,
      weekly_rent: 1534
    },
    planning_info: {
      zone_name: 'R2 Low Density Residential',
      height_limit: '8.5m',
      floor_space_ratio: '0.5:1',
      min_lot_size: '600㎡',
      is_heritage: false,
      flood_risk: false,
      landslide_risk: false
    },
    recommendation: {
      score: 0.75,
      highlights: [
        '5 Bedrooms',
        'Modern/Updated Kitchen and Bathroom',
        'Abundant Greenery',
        'High Privacy',
        'Low Noise Exposure',
        'Well-maintained Garden',
        'Bright Natural Light'
      ],
      concerns: [
        'Slightly Sloped Land',
        'No external fencing',
        'Negative capital growth trend'
      ],
      explanation: 'This property offers a generous 5 bedrooms, modern interiors, and a desirable environment with high privacy and low noise. The well-maintained condition and bright spaces are major positives, though the sloped land and lack of fencing might need consideration.'
    }
  },
  {
    listing_id: 'listing-16519979',
    basic_info: {
      price_value: 2850000,
      price_is_numeric: true,
      full_address: '35 Baldry Street, Chatswood, NSW 2067',
      street_address: '35 Baldry Street',
      suburb: 'Chatswood',
      state: 'NSW',
      postcode: '2067',
      bedrooms_count: 4,
      bathrooms_count: 3,
      car_parks: '1',
      land_size: '405㎡',
      property_type: 'House'
    },
    media: {
      image_urls: [
        'https://view.com.au/viewstatic/images/listing/4-bedroom-house-in-chatswood-nsw-2067/500-w/16519979-1-F17E8AA.jpg',
        'https://view.com.au/viewstatic/images/listing/4-bedroom-house-in-chatswood-nsw-2067/500-w/16519979-2-5058B2E.jpg',
        'https://view.com.au/viewstatic/images/listing/4-bedroom-house-in-chatswood-nsw-2067/500-w/16519979-9-8BB20B4.jpg'
      ],
      main_image_url: 'https://view.com.au/viewstatic/images/listing/4-bedroom-house-in-chatswood-nsw-2067/500-w/16519979-1-F17E8AA.jpg',
      video_url: ''
    },
    agent: {
      agent_name: 'Ray White Epping NSW',
      agency: 'Ray White',
      contact_number: '0400 111 111',
      email: 'epping@raywhite.com'
    },
    events: {
      inspection_date: 'Sat 20 Apr 11:00 AM - 11:30 AM',
      inspection_times: ['Sat 20 Apr 11:00 AM - 11:30 AM'],
      auction_date: '',
      listing_date: '2024-04-06',
      last_updated_date: '2024-04-06'
    },
    metadata: {
      created_at: '2024-04-06',
      updated_at: '2024-04-06',
      last_analysis_at: '2024-04-06',
      source: 'scraper',
      status: 'active'
    },
    analysis: {
      interior_features: {
        kitchen_condition: 'Modern/Updated',
        flooring_type: 'Wood',
        flooring_condition: 'Good',
        bathroom_condition: 'Modern/Updated'
      },
      visible_defects: {
        general_disrepair: 'Absent',
        structural_damage: 'Absent',
        roof_gutter_damage: 'Absent',
        external_cracks: 'Absent'
      },
      environment: {
        greenery: 'Abundant',
        privacy: 'Moderate',
        pole_or_line_of_sight: 'Absent',
        noise_exposure: 'Low',
        land_flatness: 'Flat',
        lighting_conditions: 'Bright',
        sustainability_features: [],
        road_proximity: 'Far'
      },
      exterior_features: {
        roof_material: 'Tile',
        parking_type: 'Street',
        solar_panels: 'No',
        garden_condition: 'Basic/Minimal',
        external_fencing: 'Partially Fenced',
        facade_condition: 'Well-maintained',
        building_materials: 'Brick'
      },
      interior_quality_style: {
        renovation_status: 'Partially Renovated',
        kitchen_style: 'Modern/Updated',
        paint_decor: 'Neutral',
        design_style: 'Transitional',
        lighting_natural_light: 'Bright'
      }
    },
    investment_info: {
      rental_yield: 2.8,
      capital_gain: 5.2,
      current_price: 2850000,
      weekly_rent: 1280
    },
    planning_info: {
      zone_name: 'R2 Low Density Residential',
      height_limit: '8.5m',
      floor_space_ratio: '0.5:1',
      min_lot_size: '400㎡',
      is_heritage: false,
      flood_risk: false,
      landslide_risk: false
    },
    recommendation: {
      score: 0.7,
      highlights: [
        '4 Bedrooms',
        'Modern/Updated Kitchen and Bathroom',
        'Abundant Greenery',
        'Low Noise Exposure',
        'Flat Land',
        'Bright Natural Light'
      ],
      concerns: [
        'Street Parking Only',
        'Basic/Minimal Garden',
        'Partially Fenced',
        'Moderate Privacy'
      ],
      explanation: 'This property boasts 4 bedrooms, modern interiors, and a pleasant environment with abundant greenery and low noise. While the updated interiors and flat land are attractive features, the street parking and minimal garden might be considerations for some buyers.'
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