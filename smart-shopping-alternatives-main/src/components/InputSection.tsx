
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link, Search } from "lucide-react";

interface InputSectionProps {
  onSubmit: (input: string, isUrl: boolean) => void;
  isLoading: boolean;
  className?: string;
}

const InputSection = ({ onSubmit, isLoading, className = "" }: InputSectionProps) => {
  const [inputUrl, setInputUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"url" | "image">("url");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onSubmit(inputUrl, true);
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      // In a real app, we would upload the image to a server
      // For this demo, we'll just pass the filename to simulate
      onSubmit(imageFile.name, false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-shopping-dark mb-6 text-center">
          Find Cheaper Alternatives
        </h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === "url"
                ? "border-shopping-primary text-shopping-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("url")}
          >
            <Link className="mr-2 h-4 w-4" />
            Product URL
          </button>
          <button
            className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === "image"
                ? "border-shopping-primary text-shopping-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("image")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </button>
        </div>

        {activeTab === "url" ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-url">Product URL</Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  id="product-url"
                  placeholder="Paste a product link (Amazon, eBay, etc.)"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!inputUrl.trim() || isLoading}
                  className="bg-shopping-primary hover:bg-shopping-primary/90 whitespace-nowrap"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Alternatives
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Example: https://www.amazon.com/Sony-WH-1000XM4-Canceling-Headphones-phone-call/dp/B0863TXGM3/
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-image">Product Image</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                {imageFile ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected file: {imageFile.name}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImageFile(null)}
                      className="text-gray-500"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Drag & drop an image or click to browse
                    </p>
                    <Input
                      id="product-image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("product-image")?.click()}
                      disabled={isLoading}
                    >
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!imageFile || isLoading}
                className="bg-shopping-primary hover:bg-shopping-primary/90"
              >
                <Search className="mr-2 h-4 w-4" />
                Find Alternatives
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InputSection;
