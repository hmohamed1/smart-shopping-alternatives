import { useState } from "react";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
// EmptyState is not used here, removing import
// import EmptyState from "@/components/ui/EmptyState";
import Header from "@/components/Header";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button"; // Import Button
import { findAlternativeProducts } from "@/services/productService";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard"; // Import ProductCard

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  const handleSubmit = async (input: string | File, isUrl: boolean) => {
    setIsLoading(true);
    setError(null);
    setOriginalProduct(null); // Reset previous results
    setAlternatives([]);      // Reset previous results
    setHasSearched(true);     // Mark that a search has been attempted

    try {
      // Input validation (basic example)
      if (!input || (typeof input === 'string' && input.trim() === '')) {
         throw new Error("Please provide a valid URL or image.");
      }

      const result = await findAlternativeProducts(input, isUrl);

      if (result.error) {
        setError(result.error);
      } else {
        setOriginalProduct(result.originalProduct);
        setAlternatives(result.alternatives);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setOriginalProduct(null);
    setAlternatives([]);
    setError(null);
    setHasSearched(false); // Reset search state
    // Optionally scroll back to top
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to scroll to top and reset (used by button in testimonials)
  const showSearchInterface = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    resetSearch();
  };

  // Determine what content to show below the input area
  const renderContentArea = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
          <ErrorMessage message={error} />
          <Button onClick={resetSearch} variant="link" className="mt-4 text-shopping-primary">
            Try Again
          </Button>
        </div>
      );
    }

    if (hasSearched) {
      if (alternatives.length > 0 && originalProduct) {
        // Show results
        return (
           <ResultsSection
             originalProduct={originalProduct}
             alternatives={alternatives}
             resetSearch={resetSearch}
           />
        );
      } else {
        // Show "No Alternatives Found" state
        return (
          <div className="max-w-4xl mx-auto text-center bg-white rounded-xl shadow-md p-8">
             {/* Custom message instead of EmptyState component */}
             <h3 className="text-xl font-semibold text-shopping-dark mb-2">
                 No Cheaper Alternatives Found
             </h3>
             <p className="text-gray-600 max-w-md mx-auto mb-6">
                 {originalProduct?.name ? `We couldn't find any cheaper alternatives for "${originalProduct.name}" right now.` : "We couldn't find any cheaper alternatives for this product right now. Try searching for something else."}
             </p>
            {/* Display original product even if no alternatives found, if available */}
            {originalProduct && (
                 <div className="mt-6 border-t pt-6">
                     <h4 className="text-lg font-semibold mb-4">Original Product Identified:</h4>
                     <div className="max-w-xs mx-auto"> {/* Constrain width */}
                        <ProductCard product={originalProduct} isOriginal={true} />
                     </div>
                 </div>
            )}
            <Button onClick={resetSearch} className="mt-6">
              Start New Search
            </Button>
          </div>
        );
      }
    }

    // Default state (before any search or after reset)
    return (
      <>
        <FeatureSection />
        {/* Testimonials Section */}
        <div className="py-12 bg-shopping-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-shopping-dark mb-8">
              Save Up To 70% On Your Purchases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { category: "Electronics", savings: "Save up to 45%" },
                { category: "Fashion", savings: "Save up to 70%" },
                { category: "Home Goods", savings: "Save up to 50%" },
              ].map((item) => (
                <div
                  key={item.category}
                  className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-shopping-dark mb-2">{item.category}</h3>
                  <p className="text-shopping-savings font-semibold text-lg">{item.savings}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={showSearchInterface}
              className="mt-10"
            >
              Start Saving Now
            </Button>
          </div>
        </div>
      </>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section & Input */}
      <div className="bg-gradient-to-r from-shopping-primary/10 to-shopping-secondary/10 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-shopping-dark mb-4 sm:text-5xl">
            Find Cheaper Alternatives <span className="text-shopping-primary">For Any Product</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Save money by discovering similar, more affordable products. Just paste a URL or upload a photo.
          </p>

          {/* Input Section Area */}
          <div className="max-w-4xl mx-auto">
             {/* Always show input unless loading or showing results/error */}
             {!isLoading && !error && (!hasSearched || alternatives.length === 0) && (
                 <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
             )}
          </div>
        </div>
      </div>

      {/* Content Area (Loading, Error, Results, No Results, or Default Features/Testimonials) */}
      <div className="py-12 px-4">
         {renderContentArea()}
      </div>


      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="font-bold text-xl text-shopping-primary">Smart Shopping Alternatives</span>
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Smart Shopping Alternatives helps you find the best deals from across the web.
              Our technology compares products to find cheaper alternatives that match your needs.
            </p>
            <div className="mt-8">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Smart Shopping Alternatives. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
