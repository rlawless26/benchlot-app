/**
 * Central service for handling all image operations in the application
 * Provides consistent URL generation, error handling, and fallbacks
 */

// Get the Supabase URL from environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co';
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
   * @returns {string} URL to the user's avatar or default placeholder
   */
  getAvatarUrl(userId) {
    if (!userId) return null;
    
    // Provide a default avatar path - we're no longer generating specific paths dynamically
    // since that would require database access to get the actual file path
    const defaultAvatarPath = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/user-images/default-avatar.png';
    
    // Log that we're using the default avatar
    console.log('No direct avatar URL provided. Using default avatar for user:', userId);
    
    return defaultAvatarPath;
  },

  /**
   * Returns the URL for a tool's image
   * @param {string} toolId - The tool's ID
   * @param {number} index - Image index (0 for primary image)
   * @returns {string} URL to the tool image or default placeholder
   */
  getToolImageUrl(toolId, index = 0) {
    if (!toolId) return null;
    
    // Provide a default tool image placeholder
    const defaultToolImagePath = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/tool-images/default-tool.png';
    
    // Log that we're using the default image
    console.log('No direct tool image URL provided. Using default image for tool:', toolId, 'index:', index);
    
    return defaultToolImagePath;
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
    
    // Handle storage URLs
    if (url.includes('/storage/v1/')) {
      try {
        // Parse the URL to handle it properly
        const urlObj = new URL(url);
        
        // Remove any existing query parameters
        const baseUrl = url.split('?')[0];
        
        // Ensure it's using the public endpoint
        let processedUrl = baseUrl.replace('/storage/v1/object/authenticated', '/storage/v1/object/public');
        
        // Add cache busting for Supabase Storage URLs
        processedUrl = `${processedUrl}?t=${Date.now()}`;
        
        console.log('Processed storage URL:', url, '->', processedUrl);
        return processedUrl;
      } catch (e) {
        console.error('Error processing URL:', e);
        return url;
      }
    }
    
    // Add cache busting for all other URLs that don't have query parameters
    if (!url.includes('?')) {
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
