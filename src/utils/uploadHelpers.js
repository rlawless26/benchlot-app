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
    // Generate path with timestamp and preserve file extension
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/user_${userId}_${timestamp}.${fileExt}`;
    const bucket = 'user-images';
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    
    // Get the standardized public URL
    const url = ImageService.getPublicUrl(bucket, filePath);
    
    // Update user profile with standardized URL
    console.log('Updating user avatar in database:', { userId, url });
    
    const { data: updateData, error: profileError } = await supabase
      .from('users')
      .update({ avatar_url: url })
      .eq('id', userId)
      .select();

    if (profileError) {
      console.error('Error updating profile with new avatar URL:', profileError);
    } else {
      console.log('Successfully updated avatar URL in database:', updateData);
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
    // Generate path with timestamp and preserve file extension
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${toolId}/image_${index}_${timestamp}.${fileExt}`;
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
    
    // Also add the URL to the images array if it exists
    const { data: toolData, error: getError } = await supabase
      .from('tools')
      .select('images')
      .eq('id', toolId)
      .single();
      
    if (!getError && toolData) {
      let images = Array.isArray(toolData.images) ? [...toolData.images] : [];
      
      // Add or update the image at the specified index
      if (index >= images.length) {
        images.push(url);
      } else {
        images[index] = url;
      }
      
      // Update the tool with both the specific URL field and the images array
      const { error: updateError } = await supabase
        .from('tools')
        .update({ 
          [columnName]: url,
          images: images
        })
        .eq('id', toolId);
        
      if (updateError) {
        console.error(`Error updating tool with new image URL at index ${index}:`, updateError);
      }
    } else {
      // Fallback to just updating the specific column if we couldn't get the current images
      const { error: updateError } = await supabase
        .from('tools')
        .update({ [columnName]: url })
        .eq('id', toolId);
        
      if (updateError) {
        console.error(`Error updating tool with new image URL at index ${index}:`, updateError);
      }
    }

    return { success: true, url, error: null };
  } catch (error) {
    console.error('Error uploading tool image:', error);
    return { success: false, url: null, error: error.message || 'Upload failed' };
  }
};
