import React, { useState } from 'react';
import { User } from 'lucide-react';

/**
 * Avatar - A completely revamped component for displaying user profile images
 * with robust fallback mechanisms
 */
const Avatar = ({ 
  user, 
  size = 40, 
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Default avatar URL hosted on a reliable CDN with cache buster to prevent stale caches
  const defaultAvatarUrl = 'https://uploads-ssl.webflow.com/65e6eb94f975cf76fcfb9fa3/default-avatar.svg';
  
  // Get user name for alternative display
  const userName = user?.username || user?.full_name || 'User';
  const initials = userName.charAt(0).toUpperCase();
  
  // If the avatar URL fails to load, generate a URL for a fallback avatar using ui-avatars.com
  const generateAvatarUrl = () => {
    const cacheBuster = Date.now();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=${size * 2}&background=2563eb&color=ffffff&cachebuster=${cacheBuster}`;
  };

  // Fix Supabase storage URLs - ensures we get a public URL without query parameters
  const fixStorageUrl = (url) => {
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
      console.error('Error fixing avatar URL:', e);
      return null;
    }
  };

  // Check if we should use the user's avatar or a fallback
  let avatarUrl = null;
  
  if (user?.avatar_url && !imageError) {
    avatarUrl = fixStorageUrl(user.avatar_url);
    console.log('Fixed avatar URL:', avatarUrl);
  }

  // If we can't use the avatar URL for any reason, show the initials avatar
  if (!avatarUrl) {
    return (
      <div 
        className={`bg-blue-600 flex items-center justify-center text-white font-medium rounded-full ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(size / 2.5, 12) }}
        title={userName}
      >
        {initials}
      </div>
    );
  }

  // Handle error on image load - This is simpler than the ReliableImage approach
  const handleImageError = () => {
    console.log(`Avatar image failed to load: ${avatarUrl}`);
    setImageError(true);
  };

  // Otherwise, use the user's avatar with direct error handling
  return (
    <img 
      src={avatarUrl}
      alt={userName}
      className={`rounded-full ${className}`}
      width={size}
      height={size}
      onError={handleImageError}
      style={{ width: size, height: size, objectFit: 'cover' }}
    />
  );
};

export default Avatar;