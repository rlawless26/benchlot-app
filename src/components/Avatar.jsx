import React, { useState, useEffect } from 'react';
import ImageService from '../services/imageService';

/**
 * A simplified Avatar component that displays user avatars with fallbacks
 * Handles all types of image URLs automatically
 */
const Avatar = ({ 
  url, 
  userId, 
  name = '', 
  size = 'md',
  className = ''
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(false);
  
  // Size classes mapped to Tailwind classes
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };
  
  const sizeClass = sizeMap[size] || sizeMap.md;
  
  // Determine the image source on mount and when props change
  useEffect(() => {
    // Reset error state when props change
    setError(false);
    
    if (url) {
      // Use direct URL if provided
      setImgSrc(ImageService.processImageUrl(url));
    } else if (userId) {
      // Otherwise generate from userId
      setImgSrc(ImageService.getAvatarUrl(userId));
    } else {
      // No source available
      setError(true);
    }
  }, [url, userId]);
  
  // Handle image loading errors
  const handleError = () => {
    console.log('Avatar image failed to load:', imgSrc);
    console.log('Avatar props:', { url, userId, name });
    setError(true);
  };
  
  // Render fallback if there's an error or no image
  if (error || !imgSrc) {
    const initials = ImageService.getInitials(name || 'User');
    
    return (
      <div 
        className={`${sizeClass} rounded-full bg-gray-300 flex items-center justify-center text-gray-700 ${className}`}
        title={name || 'User'}
      >
        {initials}
      </div>
    );
  }
  
  // Render the actual image
  return (
    <img
      src={imgSrc}
      alt={name || 'User avatar'}
      className={`${sizeClass} rounded-full object-cover ${className}`}
      onError={handleError}
    />
  );
};

export default Avatar;