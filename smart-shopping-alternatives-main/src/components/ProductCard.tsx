import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatters";

interface ProductCardProps {
  product: Product;
  isOriginal?: boolean;
}

const ProductCard = ({ product, isOriginal = false }: ProductCardProps) => {
  // Log the received product prop at the start of the function body
  console.log(`[ProductCard Func Body] Rendering for: ${product.name}`, { productProp: JSON.parse(JSON.stringify(product)) });

  // Explicitly assign props to local variables before return
  const imageUrlToRender = product.imageUrl || '/placeholder.svg';
  const productUrlToLink = product.url; // Use the URL from the prop
  const productName = product.name;
  const productDescription = product.description;
  const productPrice = product.price;
  const productSavings = product.savings;
  const productSource = product.source;
  const productRating = product.rating;

  // Double-check log right before return
  console.log(`[ProductCard Pre-Return] Using href: ${productUrlToLink}, src: ${imageUrlToRender} for ${productName}`);

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border ${
      isOriginal ? "border-shopping-accent" : "border-gray-200"
    } h-full flex flex-col transition-transform duration-200 hover:shadow-lg`}>
      {isOriginal && (
        <div className="bg-shopping-accent text-white text-center py-1 text-sm font-medium">
          Original Product
        </div>
      )}
      <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={imageUrlToRender} // Use local variable
          alt={productName} // Use local variable
          className="w-full h-full object-contain"
          onError={(e) => {
            const imgElement = e.target as HTMLImageElement;
            console.error(`Failed to load image: ${imgElement.src}. Falling back to placeholder.`);
            imgElement.src = '/placeholder.svg';
          }}
        />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-lg text-shopping-dark mb-1 line-clamp-2">{productName}</h3>
        {productDescription && (
           <p className="text-gray-600 text-sm mb-3 line-clamp-2">{productDescription}</p>
        )}

        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className={`text-lg font-bold ${isOriginal ? 'text-shopping-dark' : 'text-shopping-primary'}`}>
              {formatCurrency(productPrice)}
            </span>
          </div>
          {!isOriginal && typeof productSavings === 'number' && productSavings > 0 && (
            <span className="text-shopping-savings text-sm font-medium">
              Save {formatCurrency(productSavings)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-auto pt-2">
          {productSource && (
             <span className="text-sm text-gray-500">From {productSource}</span>
          )}
          {typeof productRating === 'number' && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-600 ml-1">{productRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      <a
        href={productUrlToLink} // Use local variable
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-center py-3 font-medium text-white ${
          isOriginal ? 'bg-shopping-accent' : 'bg-shopping-primary'
        } hover:opacity-90 transition-opacity`}
      >
        View Product
      </a>
    </div>
  );
};

export default ProductCard;
