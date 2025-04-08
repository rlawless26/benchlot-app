/**
 * Helper utilities for standardized image uploads
 * Ensures consistent file naming and database updates
 */

import { supabase } from '../supabaseClient';
import ImageService from '../services/imageService';

/**
 * Uploads a user avatar image to Supabase storage
 * @param {string} userId - The user's ID
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
export const uploadAvatar = async (userId, file) => {
  if (!userId || !file) {
    return { success: false, url: null, error: 'Missing userId or file' };
  }

  try {
    // Upload with standardized path
    const filePath = `avatars/user_${userId}.jpg`;
    const bucket = 'user-images';
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    
    // Get the standardized public URL
    const url = ImageService.getPublicUrl(bucket, filePath);
    
    // Update user profile with standardized URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile with new avatar URL:', profileError);
    }

    return { success: true, url, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, url: null, error: error.message || 'Upload failed' };
  }
};

/**
 * Uploads a tool image to Supabase storage
 * @param {string} toolId - The tool's ID
 * @param {File} file - The image file to upload
 * @param {number} index - Image index (0 for primary image)
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
export const uploadToolImage = async (toolId, file, index = 0) => {
  if (!toolId || !file) {
    return { success: false, url: null, error: 'Missing toolId or file' };
  }

  try {
    // Upload with standardized path
    const filePath = `${toolId}/image_${index}.jpg`;
    const bucket = 'tool-images';
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    
    // Get the standardized public URL
    const url = ImageService.getPublicUrl(bucket, filePath);
    
    // Update tool listing with the standardized URL
    // The column name depends on the index
    const columnName = index === 0 ? 'image_url' : `image_url_${index}`;
    
    const { error: updateError } = await supabase
      .from('tools')
      .update({ [columnName]: url })
      .eq('id', toolId);

    if (updateError) {
      console.error(`Error updating tool with new image URL at index ${index}:`, updateError);
    }

    return { success: true, url, error: null };
  } catch (error) {
    console.error('Error uploading tool image:', error);
    return { success: false, url: null, error: error.message || 'Upload failed' };
  }
};
