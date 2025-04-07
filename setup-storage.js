// A Node.js script to set up Supabase storage policies for existing buckets
// This is an alternative to using the Supabase Dashboard UI

// Usage:
// 1. Save this file as setup-storage.js
// 2. Install required dependencies: npm install @supabase/supabase-js dotenv
// 3. Create a .env file with your Supabase URL and service role key:
//    SUPABASE_URL=your_project_url
//    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
// 4. Run: node setup-storage.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with SERVICE ROLE KEY (needed for admin operations)
// WARNING: Never expose this key in frontend code or commit it to public repositories
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Define the existing buckets that need policies
const buckets = [
  { id: 'user-images', public: true },
  { id: 'tool-images', public: true }
];

async function setupStorage() {
  try {
    console.log('Setting up storage policies for existing buckets...');

    // Update policies for each bucket
    for (const bucket of buckets) {
      console.log(`Setting up policies for bucket: ${bucket.id}`);
      
      // 1. Allow anonymous users to download (view) files - public read access
      const { error: selectError } = await supabaseAdmin.storage.from(bucket.id)
        .createPolicy('Public Read Access', {
          name: 'Public Read Access',
          definition: {
            role: 'anon', // Anonymous users
            action: 'SELECT' // can download/view
          }
        });
      
      if (selectError) {
        console.error(`Error creating SELECT policy for ${bucket.id}:`, selectError);
      } else {
        console.log(`✓ Created anonymous read policy for ${bucket.id}`);
      }
      
      // 2. Allow authenticated users to upload files
      const { error: insertError } = await supabaseAdmin.storage.from(bucket.id)
        .createPolicy('Auth Users Insert', {
          name: 'Auth Users Insert',
          definition: {
            role: 'authenticated', // Authenticated users
            action: 'INSERT' // can upload
          }
        });
      
      if (insertError) {
        console.error(`Error creating INSERT policy for ${bucket.id}:`, insertError);
      } else {
        console.log(`✓ Created authenticated upload policy for ${bucket.id}`);
      }
    }
    
    console.log('Storage policy setup completed successfully!');
  } catch (error) {
    console.error('Unexpected error during storage setup:', error);
  }
}

// Run the setup function
setupStorage();