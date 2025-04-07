/**
 * Supabase Storage Policies Setup Script
 * This script sets up the necessary storage policies for the Benchlot application
 * using the Supabase Admin API directly, which is more reliable than SQL.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with SERVICE ROLE KEY (needed for admin operations)
// WARNING: Never expose this key in frontend code or commit it to public repositories
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

// Define the buckets we want to configure
const buckets = [
  'user-images',  // Primary bucket for user profile images
  'tool-images'   // Primary bucket for tool images
];

async function setupStoragePolicies() {
  try {
    console.log('Setting up storage policies...');

    // Process each bucket
    for (const bucketId of buckets) {
      console.log(`\nConfiguring bucket: ${bucketId}`);
      
      // 1. First check if bucket exists, create if not
      try {
        console.log(`Checking if bucket ${bucketId} exists...`);
        const { data: bucketList } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = bucketList.some(b => b.id === bucketId);
        
        if (!bucketExists) {
          console.log(`Creating bucket ${bucketId}...`);
          const { error } = await supabaseAdmin.storage.createBucket(bucketId, {
            public: true  // Make bucket publicly accessible
          });
          
          if (error && error.message !== 'Duplicate') {
            console.error(`Error creating bucket ${bucketId}:`, error);
            continue;
          }
          console.log(`Bucket ${bucketId} created successfully`);
        } else {
          console.log(`Bucket ${bucketId} already exists`);
        }
      } catch (error) {
        console.error(`Error checking/creating bucket ${bucketId}:`, error);
        continue;
      }
      
      // 2. Update the bucket to be public
      try {
        console.log(`Setting up anonymous read policy for ${bucketId}...`);
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketId, {
          public: true // This is the key setting for public read access
        });
          
        if (updateError) {
          console.error(`Error updating bucket to public for ${bucketId}:`, updateError);
        } else {
          console.log(`Set bucket ${bucketId} to public successfully`);
        }
      } catch (error) {
        console.error(`Error setting up public access for ${bucketId}:`, error);
      }
      
      // Note: The newer Supabase JavaScript client doesn't support direct policy creation
      // through the API. Instead, we make the bucket public which handles anonymous read access.
      // For more granular policies, you'll need to use the Supabase dashboard or REST API.
      console.log(`Note: Please configure detailed policies for ${bucketId} in the Supabase dashboard`);
      console.log(`Follow instructions in STORAGE-SETUP.md for manual policy configuration`);
      
      // 5. Create avatars folder if it doesn't exist (for user-images)
      if (bucketId === 'user-images') {
        try {
          console.log('Creating avatars folder in user-images bucket...');
          
          // We don't have a direct "create folder" API, so we'll create a tiny placeholder file
          const placeholderContent = new Blob([''], { type: 'text/plain' });
          const { error: folderError } = await supabaseAdmin.storage
            .from(bucketId)
            .upload('avatars/.placeholder', placeholderContent, {
              upsert: true,
              contentType: 'text/plain'
            });
            
          if (folderError) {
            console.error('Error creating avatars folder:', folderError);
          } else {
            console.log('Avatars folder created or already exists');
          }
        } catch (error) {
          console.error('Error creating avatars folder:', error);
        }
      }
      
      // 6. Create tools folder if it doesn't exist (for tool-images)
      if (bucketId === 'tool-images') {
        try {
          console.log('Creating tools folder in tool-images bucket...');
          
          // We don't have a direct "create folder" API, so we'll create a tiny placeholder file
          const placeholderContent = new Blob([''], { type: 'text/plain' });
          const { error: folderError } = await supabaseAdmin.storage
            .from(bucketId)
            .upload('tools/.placeholder', placeholderContent, {
              upsert: true,
              contentType: 'text/plain'
            });
            
          if (folderError) {
            console.error('Error creating tools folder:', folderError);
          } else {
            console.log('Tools folder created or already exists');
          }
        } catch (error) {
          console.error('Error creating tools folder:', error);
        }
      }
    }
    
    console.log('\nStorage policy setup completed!');
    
  } catch (error) {
    console.error('Unexpected error setting up storage policies:', error);
  }
}

// Check if service role key is provided
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
  console.error('Please add your Supabase service role key to .env file:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  process.exit(1);
}

// Run the setup function
setupStoragePolicies().catch(error => {
  console.error('Fatal error:', error);
});