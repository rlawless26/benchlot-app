/**
 * This script fixes existing image URLs in the database to use our new standardized format
 * It should be run once after deploying the new image handling system
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_KEY; // Use the service key for admin access

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to fix a URL to use our standardized format
const fixUrl = (url) => {
  if (!url) return null;
  
  // Skip non-Supabase URLs
  if (!url.includes('/storage/v1/')) return url;
  
  // Remove any existing query parameters
  const baseUrl = url.split('?')[0];
  
  // Ensure it's using the public endpoint
  return baseUrl.replace('/storage/v1/object/authenticated', '/storage/v1/object/public');
};

// Process profile avatars
async function fixProfileAvatars() {
  console.log('Fixing profile avatar URLs...');
  
  // Get all profiles with avatar URLs
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .not('avatar_url', 'is', null);
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles with avatars to fix`);
  
  // Process each profile
  for (const profile of profiles) {
    const fixedUrl = fixUrl(profile.avatar_url);
    
    if (fixedUrl !== profile.avatar_url) {
      // Update the profile with the fixed URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fixedUrl })
        .eq('id', profile.id);
      
      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError);
      } else {
        console.log(`Updated profile ${profile.id}`);
      }
    }
  }
}

// Process tool images
async function fixToolImages() {
  console.log('Fixing tool image URLs...');
  
  // Get all tools with image URLs
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, image_url, image_url_1, image_url_2, image_url_3')
    .or('image_url.not.is.null,image_url_1.not.is.null,image_url_2.not.is.null,image_url_3.not.is.null');
  
  if (error) {
    console.error('Error fetching tools:', error);
    return;
  }
  
  console.log(`Found ${tools.length} tools with images to fix`);
  
  // Process each tool
  for (const tool of tools) {
    const updates = {};
    let hasUpdates = false;
    
    // Check each image URL field
    ['image_url', 'image_url_1', 'image_url_2', 'image_url_3'].forEach(field => {
      if (tool[field]) {
        const fixedUrl = fixUrl(tool[field]);
        if (fixedUrl !== tool[field]) {
          updates[field] = fixedUrl;
          hasUpdates = true;
        }
      }
    });
    
    if (hasUpdates) {
      // Update the tool with the fixed URLs
      const { error: updateError } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', tool.id);
      
      if (updateError) {
        console.error(`Error updating tool ${tool.id}:`, updateError);
      } else {
        console.log(`Updated tool ${tool.id}`);
      }
    }
  }
}

// Main function
async function main() {
  console.log('Starting URL fix script...');
  
  try {
    await fixProfileAvatars();
    await fixToolImages();
    
    console.log('URL fix script completed successfully!');
  } catch (error) {
    console.error('Script failed with error:', error);
  }
}

// Run the script
main();