
import { Search } from "lucide-react";

interface EmptyStateProps {
  onStartSearch: () => void;
}

const EmptyState = ({ onStartSearch }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-shopping-light rounded-full mb-4">
        <Search className="h-8 w-8 text-shopping-primary" />
      </div>
      <h3 className="text-xl font-semibold text-shopping-dark mb-2">No results yet</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        Start by entering a product URL or uploading a product image to find cheaper alternatives.
      </p>
      <button
        onClick={onStartSearch}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-shopping-primary hover:bg-shopping-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shopping-primary"
      >
        Start Searching
      </button>
    </div>
  );
};

export default EmptyState;
