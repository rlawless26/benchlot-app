import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { fixStorageUrl } from '../utils/imageUtils';

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
  
  // Default avatar URL (centralized for consistency)
  const defaultAvatarUrl = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/user-images/avatars/default-avatar.svg';
  
  // If we have the URL, try to fix it on mount
  useEffect(() => {
    if (url) {
      // Special case handling for the problematic 'svg' URL
      if (url.includes('/avatars/svg')) {
        console.log('Invalid SVG URL detected, using default avatar');
        setDisplayUrl(defaultAvatarUrl);
        return;
      }
      
      try {
        // Convert signed URLs to public and handle cache busting
        const fixedUrl = fixStorageUrl(url);
        setDisplayUrl(fixedUrl);
        console.log(`Fixed profile image URL: ${fixedUrl}`);
      } catch (e) {
        console.warn('URL parsing failed in FixedProfileImage:', e);
        
        // Fallback for parsing errors
        if (url.includes('/object/sign/')) {
          // Convert signed URL to public
          const baseUrl = url.replace('/object/sign/', '/object/public/').split('?')[0];
          setDisplayUrl(`${baseUrl}?cb=${Date.now()}`);
        } else {
          // Simple cache busting
          const simpleFixedUrl = url.includes('?') 
            ? `${url.split('?')[0]}?cb=${Date.now()}` 
            : `${url}?cb=${Date.now()}`;
          setDisplayUrl(simpleFixedUrl);
        }
      }
    } else {
      // No URL provided, use default avatar
      setDisplayUrl(defaultAvatarUrl);
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
        // First retry: ensure we're using the user-images bucket
        let fixedUrl = url;
        
        // ONLY use user-images bucket for profile images
        if (url.includes('tool-images')) {
          fixedUrl = url.replace('tool-images', 'user-images');
          console.log('Corrected bucket from tool-images to user-images:', fixedUrl);
        }
        
        // Handle signed URLs
        if (fixedUrl.includes('/object/sign/')) {
          fixedUrl = fixedUrl.replace('/object/sign/', '/object/public/');
        }
        
        // Strip all query parameters and add a fresh cache buster
        fixedUrl = fixedUrl.split('?')[0] + '?cb=' + Date.now();
        
        console.log("Retrying with fixed URL:", fixedUrl);
        setDisplayUrl(fixedUrl);
      } else if (retryCount === 1) {
        // Second retry: try default avatar
        console.log("Retrying with default avatar");
        setDisplayUrl(defaultAvatarUrl);
      } else {
        // Final fallback: use generated avatar
        setUseOriginal(false);
      }
    } else {
      // All retries failed, use fallback or generated avatar
      setErrorLoading(true);
      setUseOriginal(false);
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
            <User className="h-8 w-8 text-forest-700" />
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