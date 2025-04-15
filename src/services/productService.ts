
import { Product } from "@/types/product";

// Mock service to simulate fetching product data
// In a real application, this would connect to a backend API

export const findAlternativeProducts = async (
  input: string,
  isUrl: boolean = true
): Promise<{
  originalProduct: Product | null;
  alternatives: Product[];
  error?: string;
}> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate product identification
  // In a real app, this would call a backend service that:
  // 1. For URLs: scrape the product page to get details
  // 2. For images: use AI to identify the product

  // Mock data for demonstration
  
  // If input is invalid (simulate error case for some inputs)
  if (input.includes("error") || input === "") {
    return {
      originalProduct: null,
      alternatives: [],
      error: "Unable to process the request. Please check your input and try again."
    };
  }

  // Mock original product
  const originalProduct: Product = isUrl
    ? {
        id: "orig-001",
        name: "Premium Noise-Cancelling Headphones",
        description: "High-end wireless headphones with active noise cancellation",
        price: 349.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        source: "PremiumAudio.com",
        url: "https://example.com/headphones",
        rating: 4.7,
        savings: 0,
      }
    : {
        id: "orig-002",
        name: "Designer Leather Handbag",
        description: "Luxury designer handbag with genuine leather",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
        source: "LuxuryBrands.com",
        url: "https://example.com/handbag",
        rating: 4.8,
        savings: 0,
      };

  // Mock alternative products
  const alternativeProducts: Product[] = isUrl
    ? [
        {
          id: "alt-001",
          name: "Soundcore Noise-Cancelling Headphones",
          description: "Wireless headphones with active noise cancellation and 40h battery",
          price: 149.99,
          imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500",
          source: "Electronics.com",
          url: "https://example.com/alternative-1",
          rating: 4.5,
          savings: originalProduct.price - 149.99,
        },
        {
          id: "alt-002",
          name: "AudioTech Pro Headphones",
          description: "Professional-grade wireless headphones with noise isolation",
          price: 199.99,
          imageUrl: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=500",
          source: "AudioGear.com",
          url: "https://example.com/alternative-2",
          rating: 4.6,
          savings: originalProduct.price - 199.99,
        },
        {
          id: "alt-003",
          name: "SoundWave Noise-Cancelling Headphones",
          description: "Budget-friendly wireless headphones with noise cancellation",
          price: 129.95,
          imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
          source: "SoundWave.com",
          url: "https://example.com/alternative-3",
          rating: 4.3,
          savings: originalProduct.price - 129.95,
        },
      ]
    : [
        {
          id: "alt-004",
          name: "Stylish Faux Leather Handbag",
          description: "High-quality designer-inspired handbag with vegan leather",
          price: 149.99,
          imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
          source: "FashionDeals.com",
          url: "https://example.com/alternative-4",
          rating: 4.4,
          savings: originalProduct.price - 149.99,
        },
        {
          id: "alt-005",
          name: "Classic Leather Tote",
          description: "Genuine leather tote bag with modern design",
          price: 299.99,
          imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500",
          source: "BagWorld.com",
          url: "https://example.com/alternative-5",
          rating: 4.6,
          savings: originalProduct.price - 299.99,
        },
        {
          id: "alt-006",
          name: "Urban Style Handbag",
          description: "Contemporary design with premium materials",
          price: 199.95,
          imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500",
          source: "UrbanStyle.com",
          url: "https://example.com/alternative-6",
          rating: 4.5,
          savings: originalProduct.price - 199.95,
        },
      ];

  return {
    originalProduct,
    alternatives: alternativeProducts,
  };
};
