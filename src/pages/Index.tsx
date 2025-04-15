
import { useState } from "react";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import Header from "@/components/Header";
import FeatureSection from "@/components/FeatureSection";
import { findAlternativeProducts } from "@/services/productService";
import { Product } from "@/types/product";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (input: string, isUrl: boolean) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await findAlternativeProducts(input, isUrl);
      
      if (result.error) {
        setError(result.error);
        setOriginalProduct(null);
        setAlternatives([]);
      } else {
        setOriginalProduct(result.originalProduct);
        setAlternatives(result.alternatives);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setOriginalProduct(null);
      setAlternatives([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setOriginalProduct(null);
    setAlternatives([]);
    setError(null);
    setHasSearched(false);
  };

  const showSearchInterface = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    resetSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-shopping-primary/10 to-shopping-secondary/10 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-shopping-dark mb-4 sm:text-5xl">
            Find Cheaper Alternatives <span className="text-shopping-primary">For Any Product</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Save money by discovering similar, more affordable products. Just paste a URL or upload a photo.
          </p>
          
          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {/* Only show input section if no results or explicitly reset */}
            {(!hasSearched || (!isLoading && !originalProduct && !alternatives.length && !error)) && (
              <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
            )}

            {/* Loading State */}
            {isLoading && <LoadingSpinner />}

            {/* Error Message */}
            {error && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <ErrorMessage message={error} />
                <button
                  onClick={resetSearch}
                  className="mt-4 text-shopping-primary hover:text-shopping-primary/80 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {!isLoading && originalProduct && alternatives.length > 0 && (
        <div className="py-12">
          <ResultsSection
            originalProduct={originalProduct}
            alternatives={alternatives}
            resetSearch={resetSearch}
          />
        </div>
      )}

      {/* Feature Section - Only show when not displaying results */}
      {(!originalProduct || alternatives.length === 0) && !isLoading && (
        <FeatureSection />
      )}

      {/* Testimonials or Example Savings - Only show when not displaying results */}
      {(!originalProduct || alternatives.length === 0) && !isLoading && (
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
            <button
              onClick={showSearchInterface}
              className="mt-10 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-shopping-primary hover:bg-shopping-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shopping-primary"
            >
              Start Saving Now
            </button>
          </div>
        </div>
      )}

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
