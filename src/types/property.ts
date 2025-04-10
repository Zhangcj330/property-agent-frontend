export interface Property {
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
  analysis: {
    interior_features?: {
      kitchen_condition?: string;
      flooring_type?: string;
      flooring_condition?: string;
      bathroom_condition?: string;
    };
    visible_defects?: {
      general_disrepair?: string;
      structural_damage?: string;
      roof_gutter_damage?: string;
      external_cracks?: string;
    };
    environment?: {
      greenery?: string;
      privacy?: string;
      pole_or_line_of_sight?: string;
      noise_exposure?: string;
      land_flatness?: string;
      lighting_conditions?: string;
      sustainability_features?: string[];
      road_proximity?: string;
    };
    exterior_features?: {
      roof_material?: string;
      parking_type?: string;
      solar_panels?: string;
      garden_condition?: string;
      external_fencing?: string;
      facade_condition?: string;
      building_materials?: string;
    };
    interior_quality_style?: {
      renovation_status?: string;
      kitchen_style?: string;
      paint_decor?: string;
      design_style?: string;
      lighting_natural_light?: string;
    };
  };
  investment_info?: {
    rental_yield?: number;
    capital_gain?: number;
    current_price?: number;
    weekly_rent?: number;
    cashflow?: number;
    potential_rent?: number;
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
  recommendation?: {
    score: number;
    highlights: string[];
    concerns: string[];
    explanation: string;
  };
  features?: {
    interior: string[];
    exterior: string[];
  };
  defects?: string[];
  location_info?: {
    pois?: {
      name: string;
      distance: string;
    }[];
    lifestyle_score?: number;
    transit_score?: number;
    safety_score?: number;
  };
} 