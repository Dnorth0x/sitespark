export interface Specification {
  id: number;
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  imageUrl: string;
  tagline: string;
  pros: string[]; // An array of strings
  cons: string[]; // An array of strings
  affiliateLink: string; // The user's affiliate link
  specifications: Specification[]; // Array of specifications
}

// Pexels API types
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

export interface PexelsSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
}