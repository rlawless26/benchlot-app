/**
 * Benchlot Storage Debugging Script
 * 
 * This script helps diagnose issues with Supabase storage buckets.
 * Run it with Node.js after configuring your Supabase credentials below.
 * 
 * Usage:
 * 1. Add your service role key to the .env file
 * 2. Run: node debug-storage.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Make sure this is set in .env

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  console.log('Add your Supabase service role key to .env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize Supabase anonymous client (for testing public access)
const supabaseAnon = createClient(
  SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc0ODYsImV4cCI6MjA1OTYyMzQ4Nn0.HcWzb8D9Jtq2CR-NJR2w8opgTDDM5n8TNeS1SyXXIXQ'
);

// Helper to print object in a readable format
function printObject(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// List all storage buckets
async function listBuckets() {
  console.log('\n===== STORAGE BUCKETS =====');
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return [];
    }
    
    console.log(`Found ${data.length} buckets:`);
    data.forEach(bucket => {
      console.log(`- ${bucket.name} (id: ${bucket.id}, public: ${bucket.public})`);
    });
    
    return data;
  } catch (error) {
    console.error('Unexpected error listing buckets:', error);
    return [];
  }
}

// Get policies for a bucket
async function getBucketPolicies(bucketId) {
  console.log(`\n===== POLICIES FOR BUCKET: ${bucketId} =====`);
  try {
    // This is a direct SQL query since there's no easy way to list policies in the JS SDK
    const { data, error } = await supabaseAdmin.rpc('get_policies_for_bucket', { 
      bucket_name: bucketId 
    });
    
    if (error) {
      console.error(`Error getting policies for bucket ${bucketId}:`, error);
      
      // Try a different approach - direct SQL query
      console.log('Attempting direct SQL query...');
      const { data: sqlData, error: sqlError } = await supabaseAdmin.from('storage.policies')
        .select('*')
        .eq('bucket_id', bucketId);
        
      if (sqlError) {
        console.error('SQL query failed:', sqlError);
        return [];
      }
      
      console.log(`Found ${sqlData.length} policies via SQL query:`);
      sqlData.forEach(policy => {
        console.log(`- ${policy.name} (operation: ${policy.operation})`);
        console.log(`  Definition: ${policy.definition}`);
      });
      
      return sqlData;
    }
    
    console.log(`Found ${data.length} policies:`);
    data.forEach(policy => {
      console.log(`- ${policy.name} (operation: ${policy.operation})`);
      console.log(`  Definition: ${policy.definition}`);
    });
    
    return data;
  } catch (error) {
    console.error(`Unexpected error getting policies for bucket ${bucketId}:`, error);
    return [];
  }
}

// List files in a bucket
async function listFiles(bucketId, path = '') {
  console.log(`\n===== FILES IN BUCKET: ${bucketId}${path ? ` (PATH: ${path})` : ''} =====`);
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucketId).list(path);
    
    if (error) {
      console.error(`Error listing files in bucket ${bucketId}:`, error);
      return [];
    }
    
    console.log(`Found ${data.length} items:`);
    data.forEach(item => {
      if (item.metadata) {
        console.log(`- ${item.name} (size: ${item.metadata.size} bytes, type: ${item.metadata.mimetype})`);
      } else {
        console.log(`- ${item.name} (folder)`);
      }
    });
    
    return data;
  } catch (error) {
    console.error(`Unexpected error listing files in bucket ${bucketId}:`, error);
    return [];
  }
}

// Test public access to a file
async function testPublicAccess(bucketId, filePath) {
  console.log(`\n===== TESTING PUBLIC ACCESS: ${bucketId}/${filePath} =====`);
  try {
    // Get public URL
    const { data: { publicUrl } } = supabaseAnon.storage.from(bucketId).getPublicUrl(filePath);
    
    console.log(`Public URL: ${publicUrl}`);
    
    // Try to fetch the public URL
    const response = await fetch(publicUrl);
    
    if (response.ok) {
      console.log(`✅ SUCCESS: Public access works! Status: ${response.status}`);
    } else {
      console.error(`❌ FAILED: Public access failed! Status: ${response.status}`);
      console.error(`Response: ${await response.text()}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error(`Unexpected error testing public access for ${bucketId}/${filePath}:`, error);
    return false;
  }
}

// Create a bucket with public access
async function createPublicBucket(bucketId) {
  console.log(`\n===== CREATING PUBLIC BUCKET: ${bucketId} =====`);
  try {
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketId, {
      public: true
    });
    
    if (error) {
      if (error.message === 'Duplicate') {
        console.log(`Bucket ${bucketId} already exists`);
      } else {
        console.error(`Error creating bucket ${bucketId}:`, error);
        return false;
      }
    } else {
      console.log(`Bucket ${bucketId} created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error creating bucket ${bucketId}:`, error);
    return false;
  }
}

// Create public read policy for a bucket
async function createPublicReadPolicy(bucketId) {
  console.log(`\n===== CREATING PUBLIC READ POLICY FOR BUCKET: ${bucketId} =====`);
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucketId).createPolicy('Public Read Access', {
      name: 'Public Read Access',
      definition: {
        role: 'anon',
        action: 'SELECT'
      }
    });
    
    if (error) {
      console.error(`Error creating public read policy for bucket ${bucketId}:`, error);
      return false;
    }
    
    console.log(`Public read policy created for bucket ${bucketId} successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating public read policy for bucket ${bucketId}:`, error);
    return false;
  }
}

// Create authenticated insert policy for a bucket
async function createAuthInsertPolicy(bucketId) {
  console.log(`\n===== CREATING AUTHENTICATED INSERT POLICY FOR BUCKET: ${bucketId} =====`);
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucketId).createPolicy('Auth Users Insert', {
      name: 'Auth Users Insert',
      definition: {
        role: 'authenticated',
        action: 'INSERT'
      }
    });
    
    if (error) {
      console.error(`Error creating authenticated insert policy for bucket ${bucketId}:`, error);
      return false;
    }
    
    console.log(`Authenticated insert policy created for bucket ${bucketId} successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating authenticated insert policy for bucket ${bucketId}:`, error);
    return false;
  }
}

// Create a test file in a bucket
async function createTestFile(bucketId, filePath) {
  console.log(`\n===== CREATING TEST FILE: ${bucketId}/${filePath} =====`);
  try {
    // Create a simple text file
    const content = 'This is a test file created by the debug-storage.js script';
    const blob = new Blob([content], { type: 'text/plain' });
    
    const { data, error } = await supabaseAdmin.storage.from(bucketId).upload(filePath, blob, {
      cacheControl: '3600',
      upsert: true
    });
    
    if (error) {
      console.error(`Error creating test file ${bucketId}/${filePath}:`, error);
      return false;
    }
    
    console.log(`Test file ${bucketId}/${filePath} created successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating test file ${bucketId}/${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Benchlot Storage Diagnostics');
  console.log('--------------------------------------');
  
  // Step 1: List all buckets
  const buckets = await listBuckets();
  
  // Step 2: Check buckets we're specifically interested in
  const requiredBuckets = ['user-images', 'tool-images', 'profiles', 'avatars', 'images'];
  
  for (const bucketId of requiredBuckets) {
    // Does bucket exist?
    const bucketExists = buckets.some(b => b.id === bucketId);
    
    if (bucketExists) {
      console.log(`\nChecking existing bucket: ${bucketId}`);
      
      // Check policies
      await getBucketPolicies(bucketId);
      
      // List files
      await listFiles(bucketId);
      
      // Test file access if files exist
      // TODO: Add file test if needed
    } else {
      console.log(`\nBucket ${bucketId} does not exist. Would you like to create it? (Y/n)`);
      // In a real script, we'd ask for confirmation here
      // For this example, we'll just create it
      
      const created = await createPublicBucket(bucketId);
      
      if (created) {
        // Create policies
        await createPublicReadPolicy(bucketId);
        await createAuthInsertPolicy(bucketId);
        
        // Create test file
        const testFilePath = `test/test-file-${Date.now()}.txt`;
        await createTestFile(bucketId, testFilePath);
        
        // Test public access
        await testPublicAccess(bucketId, testFilePath);
      }
    }
  }
  
  console.log('\nStorage Diagnostics Complete');
}

// Run the script
main().catch(error => {
  console.error('Error in main function:', error);
});