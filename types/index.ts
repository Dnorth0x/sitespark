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