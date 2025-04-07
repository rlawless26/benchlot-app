import React, { useState, useEffect } from 'react';

/**
 * ReliableImage - A robust image component that handles various URL formats
 * and provides fallback mechanisms for Supabase storage URLs.
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
  const [currentSrc, setCurrentSrc] = useState("");
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 1;
  
  // Initialize the image source on mount or when src changes
  useEffect(() => {
    if (src) {
      setCurrentSrc(convertToPublicUrl(src));
      setHasError(false);
      setRetryCount(0);
    } else {
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);
  
  /**
   * Converts any Supabase URL to a public URL without tokens
   */
  function convertToPublicUrl(url) {
    if (!url) return fallbackSrc;
    
    try {
      // Special case for the broken 'svg' path
      if (url.includes('/avatars/svg')) {
        return fallbackSrc;
      }
      
      // Handle signed URLs by converting to public URLs
      if (url.includes('/object/sign/')) {
        // Remove token parameter and convert to public URL
        return url.replace('/object/sign/', '/object/public/').split('?')[0];
      }
      
      // If it has query parameters, strip them (common source of issues)
      if (url.includes('?') && url.includes('supabase')) {
        return url.split('?')[0];
      }
      
      // Return the original URL if no special handling needed
      return url;
    } catch (error) {
      console.warn('Error converting image URL:', error);
      return fallbackSrc;
    }
  }
  
  /**
   * Handles image loading errors with retry logic
   */
  function handleError() {
    console.log(`Image error (${retryCount}/${MAX_RETRIES}):`, src);
    
    if (retryCount < MAX_RETRIES) {
      // Increment retry count
      setRetryCount(retryCount + 1);
      
      // Try different fallback strategies
      if (retryCount === 0) {
        // First retry: strip all query parameters
        const strippedUrl = currentSrc.split('?')[0];
        console.log('Retrying with stripped URL:', strippedUrl);
        setCurrentSrc(strippedUrl);
      }
    } else {
      // Max retries reached, show fallback
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  }
  
  return (
    <img 
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleError}
    />
  );
};

export default ReliableImage;