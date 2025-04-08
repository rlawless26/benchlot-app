/**
 * Central service for handling all image operations in the application
 * Provides consistent URL generation, error handling, and fallbacks
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

const ImageService = {
  /**
   * Formats and returns a public URL for an image in Supabase storage
   * @param {string} bucket - The storage bucket name
   * @param {string} path - The path to the image in the bucket
   * @returns {string} Properly formatted public URL
   */
  getPublicUrl(bucket, path) {
    if (!bucket || !path) return null;
    return `${STORAGE_URL}/${bucket}/${path}`;
  },

  /**
   * Returns the URL for a user's avatar image
   * @param {string} userId - The user's ID
   * @returns {string} URL to the user's avatar
   */
  getAvatarUrl(userId) {
    if (!userId) return null;
    return this.getPublicUrl('user-images', `avatars/user_${userId}.jpg`);
  },

  /**
   * Returns the URL for a tool's image
   * @param {string} toolId - The tool's ID
   * @param {number} index - Image index (0 for primary image)
   * @returns {string} URL to the tool image
   */
  getToolImageUrl(toolId, index = 0) {
    if (!toolId) return null;
    return this.getPublicUrl('tool-images', `${toolId}/image_${index}.jpg`);
  },

  /**
   * Safely processes any image URL to ensure it works correctly
   * Handles blob URLs, public URLs, and relative URLs
   * @param {string} url - The URL to process
   * @returns {string} Properly processed URL
   */
  processImageUrl(url) {
    if (!url) return null;
    
    // Special handling for blob URLs - don't modify them at all
    if (url.startsWith('blob:')) {
      console.log('Using blob URL directly without modification:', url);
      return url;
    }
    
    // Handle storage URLs to ensure they're public and clean
    if (url.includes('/storage/v1/')) {
      // Remove any existing query parameters
      const baseUrl = url.split('?')[0];
      
      // Ensure it's using the public endpoint
      return baseUrl.replace('/storage/v1/object/authenticated', '/storage/v1/object/public');
    }
    
    // Add cache busting for non-blob URLs
    if (!url.startsWith('blob:') && !url.includes('?')) {
      return `${url}?t=${Date.now()}`;
    }
    
    return url;
  },

  /**
   * Generates a fallback for when images fail to load
   * @param {string} name - User's name or tool name for text-based fallbacks
   * @returns {string} Text to use as fallback
   */
  getInitials(name) {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name.slice(0, 2).toUpperCase();
  }
};

export default ImageService;
