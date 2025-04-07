/**
 * Utilities for handling images and storage URLs in a standardized way
 */

// Base URL for Supabase storage
const STORAGE_BASE_URL = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public';

/**
 * Generate a standardized public URL for Supabase storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The path within the bucket
 * @returns {string} - The complete public URL
 */
export function getStorageUrl(bucket, path) {
  if (!bucket || !path) {
    console.error('Missing bucket or path for storage URL');
    return null;
  }
  return `${STORAGE_BASE_URL}/${bucket}/${path}`;
}

/**
 * Get a URL for a user's avatar
 * @param {string} userId - The user's ID
 * @param {string} fileExtension - The file extension (default: jpg)
 * @returns {string} - The public URL for the user's avatar
 */
export function getUserAvatarUrl(userId, fileExtension = 'jpg') {
  if (!userId) return null;
  return getStorageUrl('user-images', `avatars/user_${userId}.${fileExtension}`);
}

/**
 * Get a URL for a tool image
 * @param {string} toolId - The tool's ID
 * @param {number} position - The image position (default: 0)
 * @param {string} fileExtension - The file extension (default: jpg)
 * @returns {string} - The public URL for the tool image
 */
export function getToolImageUrl(toolId, position = 0, fileExtension = 'jpg') {
  if (!toolId) return null;
  return getStorageUrl('tool-images', `tools/${toolId}/${toolId}_${position}.${fileExtension}`);
}

/**
 * Fix any Supabase URL to ensure it uses the public endpoint
 * @param {string} url - The URL to fix
 * @returns {string} - The fixed URL
 */
export function fixStorageUrl(url) {
  if (!url) return url;
  
  try {
    // Special case for the problematic 'svg' URL
    if (url.includes('/avatars/svg')) {
      return getStorageUrl('user-images', 'avatars/default-avatar.svg');
    }
    
    // Convert signed URLs to public URLs
    if (url.includes('/object/sign/')) {
      return url.replace('/object/sign/', '/object/public/').split('?')[0];
    }
    
    // For URLs that already have the correct format, just ensure no query parameters
    if (url.includes('supabase') && url.includes('?')) {
      return url.split('?')[0];
    }
    
    return url;
  } catch (error) {
    console.warn('Error fixing storage URL:', error);
    return url;
  }
}

/**
 * Generate a placeholder image URL
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {string} text - Text to display on the placeholder
 * @returns {string} - Placeholder image URL
 */
export function getPlaceholderUrl(width = 300, height = 200, text = 'Placeholder') {
  return `https://via.placeholder.com/${width}x${height}/CCCCCC/333333?text=${encodeURIComponent(text)}`;
}

export default {
  getStorageUrl,
  getUserAvatarUrl,
  getToolImageUrl,
  fixStorageUrl,
  getPlaceholderUrl
};