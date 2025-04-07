import React, { useEffect, useState } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';

/**
 * Fixed Profile Image component with error handling and automated retries
 * Used to work around storage bucket issues
 */
const FixedProfileImage = ({ url, size = 24, userId, fallback }) => {
  const [displayUrl, setDisplayUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [useOriginal, setUseOriginal] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const maxRetries = 2;
  
  // If we have the URL, try to fix it on mount
  useEffect(() => {
    if (url) {
      // First attempt: Use cache-busting query param
      const cacheBuster = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const urlWithCacheBuster = url.includes('?') 
        ? `${url}&cb=${cacheBuster}` 
        : `${url}?cb=${cacheBuster}`;
      
      setDisplayUrl(urlWithCacheBuster);
    }
  }, [url]);
  
  // Handle image loading error
  const handleError = (e) => {
    console.log(`Profile image load error (attempt ${retryCount + 1}/${maxRetries + 1}):`, url);
    e.target.onerror = null; // Prevent infinite loop
    
    if (retryCount < maxRetries) {
      // Try again with a different approach
      setRetryCount(retryCount + 1);
      
      if (retryCount === 0) {
        // Try fixing the URL structure - look for user-images vs tool-images
        let fixedUrl = url;
        
        if (url.includes('tool-images')) {
          // Try user-images instead
          fixedUrl = url.replace('tool-images', 'user-images');
        } else if (url.includes('user-images')) {
          // Try tool-images instead
          fixedUrl = url.replace('user-images', 'tool-images');
        }
        
        // Add cache buster
        const cacheBuster = `${Date.now()}-retry1`;
        fixedUrl = fixedUrl.includes('?') 
          ? `${fixedUrl}&cb=${cacheBuster}` 
          : `${fixedUrl}?cb=${cacheBuster}`;
        
        console.log("Retrying with fixed URL:", fixedUrl);
        setDisplayUrl(fixedUrl);
      } else {
        // Last resort: try a completely different approach
        setUseOriginal(false);
      }
    } else {
      // All retries failed
      setErrorLoading(true);
      if (fallback) {
        e.target.src = fallback(96, 96);
      }
    }
  };
  
  // If we've decided not to use the original URL approach
  if (!useOriginal) {
    // Generate a direct avatar URL using userId
    return (
      <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-forest-50`}>
        {userId ? (
          <img
            src={`https://ui-avatars.com/api/?name=${userId.substring(0, 2)}&background=random&size=96&color=223322`}
            alt="Profile"
            className={`w-${size} h-${size} rounded-full object-cover`}
          />
        ) : (
          <div className={`w-${size} h-${size} rounded-full bg-forest-100 flex items-center justify-center`}>
            <ImageIcon className="h-8 w-8 text-forest-700" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <img
      src={displayUrl}
      alt="Profile"
      className={`w-${size} h-${size} rounded-full object-cover ${errorLoading ? 'border border-red-300' : ''}`}
      onError={handleError}
    />
  );
};

export default FixedProfileImage;