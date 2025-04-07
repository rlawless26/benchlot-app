/**
 * Benchlot Image URL Fixer
 * 
 * This script fixes all image URLs in the database to use the standardized
 * public URL format instead of signed URLs.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with admin credentials
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fix a Supabase URL to ensure it uses the public endpoint
 */
function fixStorageUrl(url) {
  if (!url) return url;
  
  try {
    // Special case for the problematic 'svg' URL
    if (url.includes('/avatars/svg')) {
      return 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/user-images/avatars/default-avatar.svg';
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
 * Fix all profile images in the users table
 */
async function fixProfileImages() {
  try {
    console.log('Fixing profile images...');
    
    // Get all users with avatar_url
    const { data: users, error } = await supabase
      .from('users')
      .select('id, avatar_url')
      .not('avatar_url', 'is', null);
      
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users with avatar URLs`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const user of users) {
      if (!user.avatar_url) continue;
      
      console.log(`Processing user ${user.id}...`);
      console.log(`Original URL: ${user.avatar_url}`);
      
      // Fix the URL
      const fixedUrl = fixStorageUrl(user.avatar_url);
      
      // Check if the URL actually changed
      if (fixedUrl === user.avatar_url) {
        console.log('URL already in correct format');
        alreadyCorrectCount++;
        continue;
      }
      
      console.log(`Fixed URL: ${fixedUrl}`);
      
      // Update the user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: fixedUrl })
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`Updated user ${user.id} successfully`);
        fixedCount++;
      }
    }
    
    console.log('\nProfile Image Fix Summary:');
    console.log(`Total processed: ${users.length}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error('Unexpected error in fixProfileImages:', error);
  }
}

/**
 * Fix all tool images in the tools table
 */
async function fixToolImages() {
  try {
    console.log('\nFixing tool images...');
    
    // Get all tools with images
    const { data: tools, error } = await supabase
      .from('tools')
      .select('id, images')
      .not('images', 'is', null);
      
    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }
    
    console.log(`Found ${tools.length} tools with images`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;
    
    // Process each tool
    for (const tool of tools) {
      if (!tool.images || !Array.isArray(tool.images) || tool.images.length === 0) continue;
      
      console.log(`\nProcessing tool ${tool.id}...`);
      console.log(`Original images: ${JSON.stringify(tool.images)}`);
      
      // Fix each image URL
      let needsUpdate = false;
      const fixedImages = tool.images.map(url => {
        if (!url) return url;
        
        const fixedUrl = fixStorageUrl(url);
        if (fixedUrl !== url) {
          needsUpdate = true;
        }
        return fixedUrl;
      });
      
      // Check if any URLs actually changed
      if (!needsUpdate) {
        console.log('All URLs already in correct format');
        alreadyCorrectCount++;
        continue;
      }
      
      console.log(`Fixed images: ${JSON.stringify(fixedImages)}`);
      
      // Update the tool record
      const { error: updateError } = await supabase
        .from('tools')
        .update({ images: fixedImages })
        .eq('id', tool.id);
        
      if (updateError) {
        console.error(`Error updating tool ${tool.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`Updated tool ${tool.id} successfully`);
        fixedCount++;
      }
    }
    
    console.log('\nTool Image Fix Summary:');
    console.log(`Total processed: ${tools.length}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error('Unexpected error in fixToolImages:', error);
  }
}

/**
 * Run all fix operations
 */
async function fixAllImageUrls() {
  console.log('Starting image URL fix process...');
  
  // Fix profile images
  await fixProfileImages();
  
  // Fix tool images
  await fixToolImages();
  
  console.log('\nImage URL fix process complete!');
}

// Run the fixes
fixAllImageUrls().catch(console.error);