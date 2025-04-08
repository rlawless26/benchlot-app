import React, { useState } from 'react';

/**
 * ReliableImage - A completely revamped robust image component with simplified approach
 * More direct and effective for consistent cross-browser functionality
 */
const ReliableImage = ({ 
  src, 
  alt = "Image", 
  className = "", 
  fallbackSrc = "/placeholder.jpg",
  width,
  height,
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [finalSrc, setFinalSrc] = useState('');
  
  // Fix Supabase storage URLs - ensures we get a public URL without query parameters
  // and adds a cache buster to prevent caching issues
  const processUrl = (url) => {
    if (!url) return null;
    
    try {
      // Fix common Supabase URL issues
      if (url.includes('supabase.co/storage/v1/object/sign/')) {
        // Change signed URLs to public URLs
        url = url.replace('/object/sign/', '/object/public/');
        // Remove query parameters
        url = url.split('?')[0];
      } else if (url.includes('supabase.co/storage/v1/object/public/')) {
        // Remove query parameters from public URLs
        url = url.split('?')[0];
      }
      
      // Add a cache buster to prevent stale caches
      const cacheBuster = Date.now();
      return `${url}?cb=${cacheBuster}`;
    } catch (e) {
      console.error('Error processing image URL:', e);
      return null;
    }
  };

  // Use the processed URL or fallback
  const imageSrc = !imageError && src ? (finalSrc || processUrl(src)) : fallbackSrc;
  
  // Handle error on image load
  const handleImageError = () => {
    console.log(`Image failed to load: ${imageSrc}`);
    if (!imageError) {
      setImageError(true);
    }
  };

  // Set the final source if not already set
  if (!finalSrc && src) {
    const processed = processUrl(src);
    if (processed) {
      setFinalSrc(processed);
    }
  }

  return (
    <img 
      src={imageError ? fallbackSrc : imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        width: width ? `${width}px` : style.width || 'auto',
        height: height ? `${height}px` : style.height || 'auto',
      }}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
};

export default ReliableImage;