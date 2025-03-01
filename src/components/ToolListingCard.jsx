import React from 'react';
import { Heart, Check, MapPin, Star } from 'lucide-react';

const ToolListingCard = ({ tool, featured = false }) => {
  // Default tool data structure if not provided
  const defaultTool = {
    id: 1,
    name: "Sample Tool",
    condition: "Good",
    originalPrice: 100,
    currentPrice: 75,
    location: "Boston, MA",
    image: "/api/placeholder/300/200",
    isVerified: true,
    rating: 4.5,
    reviewCount: 12,
    seller: {
      name: "John Smith",
      rating: 4.8,
      verified: true
    }
  };

  // Merge default with provided tool data
  const toolData = { ...defaultTool, ...tool };
  
  // Calculate discount percentage
  const discountPercentage = Math.round((1 - toolData.currentPrice / toolData.originalPrice) * 100);
  
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all ${featured ? 'border-2 border-orange-200' : ''}`}>
      {/* Image container with relative positioning for overlays */}
      <div className="relative">
        <img 
          src={toolData.image} 
          alt={toolData.name} 
          className="w-full h-48 object-cover"
        />
        
        {/* Save button overlay */}
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full text-orange-700 hover:text-orange-800 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
        
        {/* Featured tag if applicable */}
        {featured && (
          <div className="absolute top-0 left-0 bg-orange-700 text-white px-3 py-1 text-xs font-medium">
            Featured
          </div>
        )}
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {toolData.isVerified && (
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              <Check className="h-3 w-3 mr-1" /> Verified
            </span>
          )}
          <span className="inline-flex items-center bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {toolData.condition}
          </span>
          {toolData.seller.verified && (
            <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Trusted Seller
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-medium text-stone-800 mb-1">
          {toolData.name}
        </h3>
        
        {/* Price information */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-orange-700">${toolData.currentPrice}</span>
          {toolData.originalPrice > toolData.currentPrice && (
            <>
              <span className="text-sm text-stone-500 line-through">${toolData.originalPrice}</span>
              <span className="text-sm text-green-600">
                {discountPercentage}% off
              </span>
            </>
          )}
        </div>
        
        {/* Location */}
        <p className="text-stone-600 text-sm mb-3 flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1" /> {toolData.location}
        </p>
        
        {/* Seller information */}
        <div className="flex items-center justify-between mb-3 text-sm border-t pt-3">
          <div className="flex items-center">
            <span className="text-stone-700">{toolData.seller.name}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
            <span className="text-stone-700">{toolData.seller.rating}</span>
          </div>
        </div>
        
        {/* Action button */}
        <button className="w-full py-2 bg-orange-700 hover:bg-orange-800 text-white rounded transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ToolListingCard;