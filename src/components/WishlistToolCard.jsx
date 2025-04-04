import React from 'react';
import { Link } from 'react-router-dom';
import { Check, XCircle, MapPin } from 'lucide-react';
import { getToolImage } from '../utils/imageUtils';

const WishlistToolCard = ({ tool, onRemove }) => {
  // Format price with $ and commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (tool.original_price && tool.current_price && tool.original_price > tool.current_price) {
      return Math.round((1 - tool.current_price / tool.original_price) * 100);
    }
    return null;
  };

  const discountPercentage = getDiscountPercentage();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg">
      <Link to={`/tool/${tool.id}`} className="block relative">
        <div className="h-48 bg-stone-100">
          <img 
            src={getToolImage(tool, 0, 300, 200)}
            alt={tool.name || "Tool image"}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {tool.is_verified && (
              <span className="bg-forest-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </span>
            )}
            
            {discountPercentage && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {discountPercentage}% off
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between">
          <Link to={`/tool/${tool.id}`} className="block">
            <h3 className="font-medium text-stone-800 hover:text-forest-700">{tool.name}</h3>
          </Link>
          <button 
            onClick={() => onRemove(tool.id)}
            className="text-stone-400 hover:text-red-500"
            title="Remove from saved tools"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-stone-600 mt-1">
          {tool.condition} {tool.brand && `• ${tool.brand}`}
        </p>
        
        <div className="mt-3">
          <div className="flex items-baseline">
            <span className="text-lg font-medium text-forest-700">
              {formatPrice(tool.current_price)}
            </span>
            {tool.original_price && tool.original_price > tool.current_price && (
              <span className="ml-2 text-sm text-stone-500 line-through">
                {formatPrice(tool.original_price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-stone-500 mt-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{tool.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistToolCard;