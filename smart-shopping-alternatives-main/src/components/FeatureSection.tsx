
import { Search, Image, Percent, ShoppingBag } from "lucide-react";

const features = [
  {
    name: "URL Search",
    description: "Enter any product URL and we'll find cheaper alternatives across the web.",
    icon: Search,
  },
  {
    name: "Image Upload",
    description: "Upload a product image and our AI will identify it and find similar items for less.",
    icon: Image,
  },
  {
    name: "Price Comparison",
    description: "See how much you can save compared to the original product price.",
    icon: Percent,
  },
  {
    name: "Direct Links",
    description: "Go directly to trusted retailers to purchase the alternatives we find.",
    icon: ShoppingBag,
  },
];

const FeatureSection = () => {
  return (
    <div className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-shopping-dark sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Smart Shopping Alternatives uses advanced AI to find the best deals for any product.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-shopping-primary rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-shopping-dark tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
