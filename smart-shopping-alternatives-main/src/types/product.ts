
export interface Product {
  id: string;
  name: string;
  description?: string; // Description might also be missing sometimes
  price: number | null; // Price can be null if not found
  imageUrl?: string | null; // Image URL is optional and can be null
  source?: string; // Source might be optional
  url: string;
  rating?: number; // Rating is optional
  savings?: number; // Savings is optional
}
