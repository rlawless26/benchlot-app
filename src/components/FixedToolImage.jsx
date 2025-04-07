import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/**
 * Fixed Tool Image component with error handling and automated retries
 * Used to ensure tool images always load correctly, handling both signed and public URLs
 */
const FixedToolImage = ({ url, size = 24, altText = "Tool image", width, height, className = "" }) => {
  const [displayUrl, setDisplayUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [errorLoading, setErrorLoading] = useState(false);
  const maxRetries = 2;
  
  // If we have the URL, try to fix it on mount
  useEffect(() => {
    if (url) {
      console.log(`Tool image loaded with URL: ${url}`);
      try {
        // Handle URL parameters to avoid duplicates
        const urlObj = new URL(url);
        
        // Check if it's a signed URL (contains /object/sign/)
        const isSignedUrl = urlObj.pathname.includes('/object/sign/');
        
        // If it's a signed URL, convert it to a public URL
        if (isSignedUrl) {
          // Replace '/object/sign/' with '/object/public/'
          const publicPath = urlObj.pathname.replace('/object/sign/', '/object/public/');
          urlObj.pathname = publicPath;
          
          // Remove JWT token query parameter if it exists
          urlObj.searchParams.delete('token');
          
          console.log(`Converted signed URL to public URL: ${urlObj.toString()}`);
        }
        
        // Remove any existing cache buster parameters
        urlObj.searchParams.delete('t');
        urlObj.searchParams.delete('cb');
        
        // Add a fresh cache buster with unique value
        const cacheBuster = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        urlObj.searchParams.set('cb', cacheBuster);
        
        setDisplayUrl(urlObj.toString());
      } catch (e) {
        // Fallback for URL parsing errors
        console.warn('URL parsing failed in FixedToolImage:', e);
        
        // Simple approach for malformed URLs
        const cacheBuster = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const simpleFixedUrl = url.includes('?') 
          ? `${url.split('?')[0]}?cb=${cacheBuster}` 
          : `${url}?cb=${cacheBuster}`;
        
        // If it's a signed URL, convert it to a public URL using simple string replacement
        if (url.includes('/object/sign/')) {
          setDisplayUrl(simpleFixedUrl.replace('/object/sign/', '/object/public/').replace(/[?&]token=[^&]+/, ''));
        } else {
          setDisplayUrl(simpleFixedUrl);
        }
      }
    }
  }, [url]);
  
  // Handle image loading error
  const handleError = (e) => {
    console.log(`Tool image load error (attempt ${retryCount + 1}/${maxRetries + 1}):`, url);
    e.target.onerror = null; // Prevent infinite loop
    
    if (retryCount < maxRetries) {
      // Try again with a different approach
      setRetryCount(retryCount + 1);
      
      try {
        let fixedUrl = url;
        
        // First attempt: Try converting signed URL to public URL
        if (retryCount === 0) {
          // If it contains '/object/sign/', convert it to '/object/public/'
          if (fixedUrl.includes('/object/sign/')) {
            fixedUrl = fixedUrl.replace('/object/sign/', '/object/public/');
            
            // Remove token parameter
            fixedUrl = fixedUrl.replace(/[?&]token=[^&]+/, '');
          }
          
          // Add a cache buster
          const urlObj = new URL(fixedUrl);
          // Clear all existing query parameters to simplify
          Array.from(urlObj.searchParams.keys()).forEach(key => {
            urlObj.searchParams.delete(key);
          });
          // Add a simple cache buster
          urlObj.searchParams.set('cb', Date.now().toString());
          
          console.log("Retrying with fixed URL:", urlObj.toString());
          setDisplayUrl(urlObj.toString());
        } 
        // Second attempt: Try completely stripping all query parameters
        else if (retryCount === 1) {
          let strippedUrl = fixedUrl.split('?')[0];
          
          // Always use /object/public/ instead of /object/sign/
          if (strippedUrl.includes('/object/sign/')) {
            strippedUrl = strippedUrl.replace('/object/sign/', '/object/public/');
          }
          
          console.log("Retrying with stripped URL (no params):", strippedUrl);
          setDisplayUrl(strippedUrl);
        }
      } catch (e) {
        console.error("Error fixing URL in error handler:", e);
        setErrorLoading(true);
      }
    } else {
      // All retries failed
      setErrorLoading(true);
    }
  };
  
  // Render the image
  return (
    <div className={`relative ${className}`}>
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={altText}
          width={width}
          height={height}
          className={`w-${size} h-${size} object-cover ${errorLoading ? 'border border-red-300' : ''}`}
          onError={handleError}
        />
      ) : (
        <div className={`w-${size} h-${size} bg-stone-100 flex items-center justify-center`}>
          <ImageIcon className="h-8 w-8 text-stone-400" />
        </div>
      )}
      
      {errorLoading && (
        <div className={`w-${size} h-${size} bg-stone-100 flex items-center justify-center absolute inset-0`}>
          <ImageIcon className="h-8 w-8 text-stone-400" />
        </div>
      )}
    </div>
  );
};

export default FixedToolImage;