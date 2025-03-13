import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Star, MapPin, Check } from 'lucide-react';

const ToolListingCard = ({ tool, featured = false }) => {
  // Handle missing images by using a placeholder
  const mainImage = tool.images && tool.images.length > 0 
    ? tool.images[0] 
    : '/api/placeholder/300/200';
  
  // Format the price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col ${featured ? 'ring-2 ring-forest-500' : ''}`}>
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-2 right-2 bg-forest-500 text-white text-xs px-2 py-1 rounded-full">
          Featured
        </div>
      )}
      
      {/* Image */}
      <Link to={`/tool/${tool.id}`} className="block relative h-48">
        <img 
          src={mainImage} 
          alt={tool.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log("Image failed to load:", mainImage);
            e.target.onerror = null; // Prevent infinite error loop
            e.target.src = '/api/placeholder/300/200'; // Fallback image
          }}
        />
        
        {/* Verification badge */}
        {tool.is_verified && (
          <div className="absolute bottom-2 left-2 bg-forest-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Verified
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="font-medium text-stone-800 hover:text-forest-700">
            <Link to={`/tool/${tool.id}`}>
              {tool.name}
            </Link>
          </h3>
        </div>
        
        <div className="flex items-center text-stone-600 text-sm mb-1">
          <span className="mr-2">{tool.condition}</span>
          {tool.brand && (
            <>
              <span className="mx-1">•</span>
              <span>{tool.brand}</span>
            </>
          )}
        </div>
        
        <div className="mt-auto pt-3">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              {tool.original_price && (
                <span className="text-stone-500 text-sm line-through mr-2">
                  {formatPrice(tool.original_price)}
                </span>
              )}
              <span className="text-stone-800 font-medium">
                {formatPrice(tool.current_price)}
              </span>
            </div>
            
            {/* Seller rating */}
            {tool.seller && tool.seller.rating && (
              <div className="flex items-center text-sm">
                <Star className="h-3 w-3 text-yellow-500 mr-1" fill="#EAB308" />
                <span>{tool.seller.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Location */}
          <div className="flex items-center text-stone-500 text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{tool.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolListingCard;