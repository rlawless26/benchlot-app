// Utility functions for handling images and placeholders

/**
 * Get a placeholder image URL that works in both development and production
 * 
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @returns {string} - URL to placeholder image
 */
export const getPlaceholderImage = (width, height) => {
  // Use full URL in development to avoid CORS issues, relative in production
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? '' 
    : process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  return `${baseUrl}/api/placeholder/${width}/${height}`;
};

/**
 * Fix a Supabase storage URL to ensure it's properly formatted
 * Converts signed URLs to public URLs to avoid token expiration issues
 * 
 * @param {string} url - The original URL from Supabase
 * @returns {string} - Fixed URL that should work reliably
 */
export const fixStorageUrl = (url) => {
  if (!url) return url;
  
  try {
    // Parse the URL to handle it properly
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
    const cacheBuster = Date.now().toString();
    urlObj.searchParams.set('cb', cacheBuster);
    
    return urlObj.toString();
  } catch (e) {
    console.warn('URL parsing failed:', e);
    
    // Simple approach for malformed URLs
    if (url.includes('/object/sign/')) {
      // Replace /object/sign/ with /object/public/ and remove token parameter
      const baseUrl = url.replace('/object/sign/', '/object/public/').split('?')[0];
      return `${baseUrl}?cb=${Date.now()}`;
    }
    
    // Add cache buster to the URL
    const cacheBuster = Date.now();
    return url.includes('?') 
      ? `${url.split('?')[0]}?cb=${cacheBuster}` 
      : `${url}?cb=${cacheBuster}`;
  }
};

/**
 * Get image URL for a tool, with fallback to placeholder
 * 
 * @param {object} tool - Tool object with images array
 * @param {number} index - Index of image to retrieve (default 0)
 * @param {number} width - Width for placeholder (default 300)
 * @param {number} height - Height for placeholder (default 200)
 * @returns {string} - URL to tool image or placeholder
 */
export const getToolImage = (tool, index = 0, width = 300, height = 200) => {
  if (!tool || !tool.images || tool.images.length === 0 || !tool.images[index]) {
    return getPlaceholderImage(width, height);
  }
  
  // Fix the URL to ensure it works properly
  return fixStorageUrl(tool.images[index]);
};

/**
 * Get profile image URL with fallback
 * 
 * @param {object} user - User object with avatar_url
 * @param {number} size - Size for placeholder (default 50)
 * @returns {string} - URL to profile image or placeholder
 */
export const getProfileImage = (user, size = 50) => {
  if (!user || !user.avatar_url) {
    return getPlaceholderImage(size, size);
  }
  
  // Fix the URL to ensure it works properly
  return fixStorageUrl(user.avatar_url);
};

export default {
  getPlaceholderImage,
  getToolImage,
  getProfileImage,
  fixStorageUrl
};