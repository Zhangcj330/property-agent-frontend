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
  recommendation?: {
    score: number;
    highlights: string[];
    concerns: string[];
    explanation: string;
  };
} 