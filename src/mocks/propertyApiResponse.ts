import { PropertyApiResponse } from '@/app/chat/page';

export const mockPropertyApiResponse: PropertyApiResponse = {
  properties: [
    {
      property: {
        listing_id: "P12345",
        basic_info: {
          price_value: 1250000,
          price_is_numeric: true,
          full_address: "42 Ocean View Drive, Bondi Beach, NSW 2026",
          street_address: "42 Ocean View Drive",
          suburb: "Bondi Beach",
          state: "NSW",
          postcode: "2026",
          bedrooms_count: 3,
          bathrooms_count: 2,
          car_parks: "2",
          land_size: "450 sqm",
          property_type: "House"
        },
        media: {
          image_urls: [
            "https://view.com.au/viewstatic/images/listing/1-bedroom-apartment-in-bondi-nsw-2026/500-w/16056415-1-62B4D46.jpg",
            "https://example.com/properties/p12345/img2.jpg",
            "https://example.com/properties/p12345/img3.jpg"
          ],
          main_image_url: "https://view.com.au/viewstatic/images/listing/1-bedroom-apartment-in-bondi-nsw-2026/500-w/16056415-1-62B4D46.jpg",
          video_url: "https://example.com/properties/p12345/video.mp4"
        },
        agent: {
          agent_name: "Sarah Johnson",
          agency: "Coastal Real Estate",
          contact_number: "0412 345 678",
          email: "sarah.j@coastalrealestate.com.au"
        },
        events: {
          inspection_date: "2024-04-06",
          inspection_times: [
            "11:00 AM - 11:30 AM",
            "2:00 PM - 2:30 PM"
          ],
          auction_date: "2024-04-20",
          listing_date: "2024-03-15",
          last_updated_date: "2024-03-30"
        },
        metadata: {
          created_at: "2024-03-15T09:00:00.000Z",
          updated_at: "2024-03-30T14:30:00.000Z",
          last_analysis_at: "2024-03-30T14:35:00.000Z",
          source: "domain",
          status: "active"
        },
        analysis: {
          price_history: {
            last_sold: "2020-06-15",
            last_sold_price: 980000,
            price_change_percentage: 27.5
          }
        }
      },
      recommendation: {
        score: 0.92,
        highlights: [
          "Beachside location with stunning ocean views",
          "Recently renovated kitchen with high-end appliances",
          "North-facing living areas with abundant natural light",
          "Walking distance to Bondi Beach and local cafes",
          "Double garage with additional storage"
        ],
        concerns: [
          "High-traffic area during peak beach season",
          "Property may require some exterior maintenance"
        ],
        explanation: "This property strongly matches your preferences for a beachside lifestyle with modern amenities. The location offers an excellent balance of coastal living and urban convenience, while the recent renovations add significant value."
      }
    },
    {
      property: {
        listing_id: "P12346",
        basic_info: {
          price_value: 880000,
          price_is_numeric: true,
          full_address: "15/88 Crown Street, Surry Hills, NSW 2010",
          street_address: "15/88 Crown Street",
          suburb: "Surry Hills",
          state: "NSW",
          postcode: "2010",
          bedrooms_count: 2,
          bathrooms_count: 2,
          car_parks: "1",
          land_size: "85 sqm",
          property_type: "Apartment"
        },
        media: {
          image_urls: [
            "https://view.com.au/viewstatic/images/listing/3-bedroom-apartment-in-bondi-nsw-2026/500-w/16570962-1-C20F2A2.jpg",
            "https://example.com/properties/p12346/img2.jpg"
          ],
          main_image_url: "https://view.com.au/viewstatic/images/listing/3-bedroom-apartment-in-bondi-nsw-2026/500-w/16570962-1-C20F2A2.jpg",
          video_url: "https://example.com/properties/p12346/video.mp4"
        },
        agent: {
          agent_name: "Michael Chen",
          agency: "Urban Property Group",
          contact_number: "0498 765 432",
          email: "m.chen@upg.com.au"
        },
        events: {
          inspection_date: "2024-04-07",
          inspection_times: [
            "12:00 PM - 12:30 PM"
          ],
          auction_date: "",
          listing_date: "2024-03-20",
          last_updated_date: "2024-03-29"
        },
        metadata: {
          created_at: "2024-03-20T10:15:00.000Z",
          updated_at: "2024-03-29T16:45:00.000Z",
          last_analysis_at: "2024-03-29T16:50:00.000Z",
          source: "realestate.com.au",
          status: "active"
        },
        analysis: {
          price_history: {
            last_sold: "2018-11-30",
            last_sold_price: 720000,
            price_change_percentage: 22.2
          }
        }
      },
      recommendation: {
        score: 0.85,
        highlights: [
          "Premium inner-city location",
          "Modern security building with lift access",
          "Recently updated bathroom with luxury finishes",
          "Close to trendy cafes and restaurants",
          "Excellent public transport connections"
        ],
        concerns: [
          "Limited parking in the area",
          "Some street noise during peak hours"
        ],
        explanation: "This apartment offers excellent value in a highly sought-after location. The modern features and proximity to lifestyle amenities align well with your preferences for inner-city living. The property has shown steady value growth and is well-maintained."
      }
    }
  ]
}; 