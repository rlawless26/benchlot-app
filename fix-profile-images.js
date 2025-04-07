/**
 * Benchlot Profile Image Fix Script
 * This script finds and fixes problematic profile image URLs in the database
 * 
 * Common issues it fixes:
 * 1. Incorrect bucket names
 * 2. Missing or incorrect folders
 * 3. Inconsistent URL structures
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with SERVICE ROLE KEY
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configuration
const SOURCE_BUCKET = 'user-images'; // The bucket where profile images should be stored
const SOURCE_FOLDER = 'avatars';     // The folder within the bucket
const DRY_RUN = false;               // Set to false to actually update the database

async function fixProfileImages() {
  console.log(`Starting profile image fixes (DRY_RUN=${DRY_RUN})`);
  
  try {
    // Get all users with avatar_url
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar_url')
      .not('avatar_url', 'is', null);
      
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users with avatar URLs`);
    
    let fixCount = 0;
    let alreadyCorrectCount = 0;
    let problemCount = 0;
    
    // Process each user's avatar URL
    for (const user of users) {
      console.log(`\nProcessing user: ${user.username} (${user.id})`);
      console.log(`Current avatar URL: ${user.avatar_url}`);
      
      if (!user.avatar_url) {
        console.log('No avatar URL, skipping');
        continue;
      }
      
      // Check if URL needs fixing
      const needsFix = checkIfUrlNeedsFix(user.avatar_url);
      
      if (needsFix) {
        console.log('URL needs fixing');
        
        // Extract the filename from the URL
        const filename = extractFilenameFromUrl(user.avatar_url);
        
        if (!filename) {
          console.error('Could not extract filename from URL, skipping');
          problemCount++;
          continue;
        }
        
        // Create the new URL
        const newUrl = buildCorrectAvatarUrl(SOURCE_BUCKET, SOURCE_FOLDER, filename);
        
        console.log(`New URL: ${newUrl}`);
        
        if (!DRY_RUN) {
          // Update the user's avatar_url
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ avatar_url: newUrl })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating user:', updateError);
            problemCount++;
          } else {
            console.log('User updated successfully');
            fixCount++;
          }
        } else {
          console.log('[DRY RUN] Would update user');
          fixCount++;
        }
      } else {
        console.log('URL looks correct, no fix needed');
        alreadyCorrectCount++;
      }
    }
    
    console.log('\nSummary:');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Fixed: ${fixCount}`);
    console.log(`Problems: ${problemCount}`);
    
    if (DRY_RUN) {
      console.log('\nThis was a DRY RUN. No changes were made to the database.');
      console.log('To make actual changes, set DRY_RUN=false and run again.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Check if a URL needs fixing
 * @param {string} url The URL to check
 * @returns {boolean} True if the URL needs fixing
 */
function checkIfUrlNeedsFix(url) {
  try {
    const urlObj = new URL(url);
    
    // Check if the bucket and folder are correct
    const pathParts = urlObj.pathname.split('/');
    const bucketPart = pathParts.find(p => p === SOURCE_BUCKET);
    const folderPart = pathParts.find(p => p === SOURCE_FOLDER);
    
    // Check if the URL is using the WRONG bucket (tool-images)
    const wrongBucket = pathParts.find(p => p === 'tool-images');
    if (wrongBucket) {
      console.log(`Found incorrect bucket: tool-images in URL: ${url}`);
      return true;
    }
    
    // Check for duplicate query parameters
    const params = urlObj.searchParams;
    const duplicateParams = new Set();
    let hasDuplicates = false;
    
    // Check each parameter for duplicates
    params.forEach((value, key) => {
      if (duplicateParams.has(key)) {
        hasDuplicates = true;
      }
      duplicateParams.add(key);
    });
    
    // Check for duplicate 't' parameters specifically
    const tValues = params.getAll('t');
    if (tValues.length > 1) {
      hasDuplicates = true;
      console.log(`Found duplicate 't' parameters: ${tValues.join(', ')}`);
    }
    
    // URL needs fixing if:
    // 1. It has duplicate parameters
    // 2. It's using the wrong bucket
    // 3. It's missing the correct bucket/folder
    return hasDuplicates || wrongBucket || !(bucketPart && folderPart);
  } catch (error) {
    // Invalid URL - needs fixing
    console.error('Error parsing URL:', error);
    return true;
  }
}

/**
 * Extract the filename from a URL
 * @param {string} url The URL
 * @returns {string} The filename
 */
function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch (error) {
    // Try a simpler approach
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  }
}

/**
 * Build a correct avatar URL
 * @param {string} bucket The bucket name
 * @param {string} folder The folder name
 * @param {string} filename The filename
 * @returns {string} The correct URL
 */
function buildCorrectAvatarUrl(bucket, folder, filename) {
  return `https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/${bucket}/${folder}/${filename}`;
}

// Check if service role key is provided
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
  console.error('Please add your Supabase service role key to .env file:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  process.exit(1);
}

// Run the fix function
fixProfileImages().catch(error => {
  console.error('Fatal error:', error);
});