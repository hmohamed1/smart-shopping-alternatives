
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ResultsSectionProps {
  originalProduct: Product | null;
  alternatives: Product[];
  resetSearch: () => void;
}

const ResultsSection = ({ originalProduct, alternatives, resetSearch }: ResultsSectionProps) => {
  if (!originalProduct || alternatives.length === 0) {
    return null;
  }

  // Calculate total potential savings
  const cheapestPrice = Math.min(...alternatives.map(p => p.price));
  const totalSavings = originalProduct.price - cheapestPrice;
  const savingsPercentage = (totalSavings / originalProduct.price) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
      {/* Results Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-shopping-dark">
              We found {alternatives.length} alternatives
            </h2>
            <p className="text-gray-600">
              Save up to{" "}
              <span className="font-bold text-shopping-savings">
                ${totalSavings.toFixed(2)} ({savingsPercentage.toFixed(0)}%)
              </span>{" "}
              compared to the original product
            </p>
          </div>
          <button
            onClick={resetSearch}
            className="text-shopping-primary hover:text-shopping-primary/80 font-medium transition-colors"
          >
            New Search
          </button>
        </div>
      </div>

      {/* Products Grid - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Original Product */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-xl font-semibold text-shopping-dark mb-4 lg:hidden">
              Original Product
            </h3>
            <ProductCard product={originalProduct} isOriginal={true} />
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-shopping-dark mb-2">Why These Alternatives?</h4>
              <p className="text-sm text-gray-600">
                We've found products with similar features and quality, but at better prices. 
                Compare specifications to ensure they meet your needs.
              </p>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-semibold text-shopping-dark mb-4">
            Cheaper Alternatives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alternatives.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
