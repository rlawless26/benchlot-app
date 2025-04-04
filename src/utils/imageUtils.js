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
  return tool.images[index];
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
  return user.avatar_url;
};

export default {
  getPlaceholderImage,
  getToolImage,
  getProfileImage
};