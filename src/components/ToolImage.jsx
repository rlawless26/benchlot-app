import React, { useState, useEffect } from 'react';
import ImageService from '../services/imageService';

/**
 * Simplified component for displaying tool images with fallbacks
 */
const ToolImage = ({ 
  url, 
  toolId,
  index = 0,
  alt = 'Tool image',
  className = '',
  placeholderClassName = ''
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(false);
  
  // Determine the image source on mount and when props change
  useEffect(() => {
    // Reset error state when props change
    setError(false);
    
    if (url) {
      // Use direct URL if provided
      setImgSrc(ImageService.processImageUrl(url));
    } else if (toolId) {
      // Otherwise generate from toolId and index
      setImgSrc(ImageService.getToolImageUrl(toolId, index));
    } else {
      // No source available
      setError(true);
    }
  }, [url, toolId, index]);
  
  // Handle image loading errors
  const handleError = () => {
    console.log('Tool image failed to load:', imgSrc);
    setError(true);
  };
  
  // Render fallback if there's an error or no image
  if (error || !imgSrc) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 ${className || 'w-full h-full aspect-square'} ${placeholderClassName}`}
      >
        <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        <div className="absolute bottom-2 left-2 right-2 text-center text-xs">
          {alt || 'Tool image'}
        </div>
      </div>
    );
  }
  
  // Render the actual image
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className || 'w-full h-full aspect-square'}`}
      onError={handleError}
    />
  );
};

export default ToolImage;