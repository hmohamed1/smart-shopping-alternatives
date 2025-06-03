
import { Search, Tag, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0 text-shopping-primary">
              <Tag className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl tracking-tight">Smart Shopping Alternatives</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-shopping-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-shopping-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </a>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-shopping-primary hover:bg-shopping-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shopping-primary">
                <Search className="h-4 w-4 mr-2" />
                Find Deals
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-shopping-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200">
            <div className="flex flex-col space-y-1 px-2 pt-2 pb-3">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-shopping-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-shopping-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#"
                className="inline-flex items-center px-4 py-2 mt-2 rounded-md text-base font-medium text-white bg-shopping-primary hover:bg-shopping-primary/90"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Find Deals
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
