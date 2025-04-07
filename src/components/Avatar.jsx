import React from 'react';
import ReliableImage from './ReliableImage';
import { User } from 'lucide-react';

/**
 * Avatar - A component for displaying user profile images with proper fallbacks
 */
const Avatar = ({ 
  user, 
  size = 40, 
  className = "" 
}) => {
  // Default avatar URL
  const defaultAvatarUrl = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/user-images/avatars/default-avatar.svg';
  
  // Get user's avatar URL or name for generated avatar
  const avatarUrl = user?.avatar_url;
  const userName = user?.username || user?.full_name || 'User';
  
  // Generate a URL for a fallback avatar using ui-avatars.com
  const generateAvatarUrl = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=${size * 2}&background=random&color=ffffff`;
  };

  // If no avatar URL, show a generated avatar
  if (!avatarUrl) {
    return (
      <ReliableImage 
        src={generateAvatarUrl()}
        alt={userName}
        className={`rounded-full ${className}`}
        width={size}
        height={size}
        fallbackSrc={defaultAvatarUrl}
      />
    );
  }

  // Otherwise, use the user's avatar with fallbacks
  return (
    <ReliableImage 
      src={avatarUrl}
      alt={userName}
      className={`rounded-full ${className}`}
      width={size}
      height={size}
      fallbackSrc={generateAvatarUrl()}
    />
  );
};

export default Avatar;