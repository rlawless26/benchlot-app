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
 * @param {boolean} addCacheBuster - Whether to add a cache buster parameter
 * @returns {string} - The fixed URL
 */
export function fixStorageUrl(url, addCacheBuster = false) {
  if (!url) return url;
  
  // CRITICAL: Special handling for blob URLs
  if (url.startsWith('blob:')) {
    console.log('Using blob URL directly without modification in imageUtils:', url);
    return url; // Never modify blob URLs
  }
  
  try {
    // Special case for the problematic 'svg' URL
    if (url.includes('/avatars/svg')) {
      return getStorageUrl('user-images', 'avatars/default-avatar.svg');
    }
    
    let fixedUrl = url;
    
    // Convert signed URLs to public URLs
    if (url.includes('/object/sign/')) {
      fixedUrl = url.replace('/object/sign/', '/object/public/').split('?')[0];
    }
    
    // For URLs that already have the correct format, just ensure no query parameters
    else if (url.includes('supabase') && url.includes('?')) {
      fixedUrl = url.split('?')[0];
    }
    
    // Add a cache buster if requested - helps with browsers caching stale images
    if (addCacheBuster && fixedUrl.includes('supabase')) {
      const cacheBuster = Date.now();
      return `${fixedUrl}?cb=${cacheBuster}`;
    }
    
    return fixedUrl;
  } catch (error) {
    console.warn('Error fixing storage URL:', error);
    return url;
  }
}

/**
 * A global utility to reliably get an image from any path
 * @param {string} url - The image URL to process
 * @param {string} fallbackUrl - Optional fallback URL
 * @returns {string} - A reliable image URL
 */
export function getReliableImageUrl(url, fallbackUrl = null) {
  if (!url) return fallbackUrl;
  
  // Never modify blob URLs - they must be used as-is
  if (url.startsWith('blob:')) {
    console.log('Using blob URL directly in getReliableImageUrl:', url);
    return url;
  }
  
  try {
    // Process Supabase URLs
    if (url.includes('supabase.co/storage')) {
      return fixStorageUrl(url, true);  // Add cache buster by default
    }
    
    // For other URLs, just pass through
    return url;
  } catch (error) {
    console.warn('Error processing image URL:', error);
    return fallbackUrl || url;
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

/**
 * LEGACY FUNCTION - Use ToolImage component or getToolImageUrl instead
 * Get a tool image URL for backward compatibility with existing code
 * @param {object} tool - The tool object
 * @param {number} index - The image index (default: 0)
 * @param {number} width - Width for placeholder (default: 300)
 * @param {number} height - Height for placeholder (default: 200)
 * @returns {string} - The URL for the tool image
 */
export function getToolImage(tool, index = 0, width = 300, height = 200) {
  if (!tool) return getPlaceholderUrl(width, height, 'Tool');
  
  // If the tool has images array, use that first
  if (tool.images && Array.isArray(tool.images) && tool.images[index]) {
    const url = tool.images[index];
    return fixStorageUrl(url);
  }
  
  // Otherwise use the tool ID to generate a URL
  if (tool.id) {
    return getToolImageUrl(tool.id, index);
  }
  
  // Return a placeholder as last resort
  return getPlaceholderUrl(width, height, tool.name || 'Tool');
}

export default {
  getStorageUrl,
  getUserAvatarUrl,
  getToolImageUrl,
  fixStorageUrl,
  getPlaceholderUrl,
  getToolImage,
  getReliableImageUrl
};