/**
 * Supabase CORS Settings Checker
 * This script helps verify that CORS is properly configured for the Supabase project
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for required environment variables
if (!supabaseKey) {
  console.error('ERROR: Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Please set this in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Define domains to check in CORS settings
const domainsToCheck = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://www.benchlot.com',
  'https://benchlot.com'
];

async function checkCorsSettings() {
  console.log('Checking CORS settings...');
  
  try {
    // Fetch the CORS configuration using the REST API
    // Note: There isn't a direct JS client method for this, so we need to construct the request manually
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    
    // Check response headers for CORS settings
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-expose-headers': response.headers.get('access-control-expose-headers'),
      'access-control-max-age': response.headers.get('access-control-max-age'),
      'vary': response.headers.get('vary')
    };
    
    console.log('\nCurrent CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`${key}: ${value || 'Not set'}`);
    });
    
    // Check if the content-range header is exposed (needed for storage)
    const exposeHeaders = corsHeaders['access-control-expose-headers'] || '';
    const hasContentRange = exposeHeaders.toLowerCase().includes('content-range');
    
    console.log('\nCORS Configuration Assessment:');
    console.log(`Content-Range Header Exposed: ${hasContentRange ? '✅ Yes' : '❌ No'}`);
    console.log('Domain Allowlist Check:');
    
    // We can only determine if a wildcard is used or specific domains
    // from the access-control-allow-origin header
    const allowOrigin = corsHeaders['access-control-allow-origin'];
    
    if (allowOrigin === '*') {
      console.log('✅ Wildcard (*) origin is allowed - all domains can access the API');
      console.log('⚠️ While this works, it\'s more secure to specify specific domains');
    } else {
      console.log(`Current allowed origin: ${allowOrigin}`);
      
      domainsToCheck.forEach(domain => {
        if (allowOrigin === domain) {
          console.log(`✅ ${domain} is allowed`);
        } else {
          console.log(`❓ ${domain} - Cannot determine if allowed (API only returns current requesting origin)`);
        }
      });
      
      console.log('\nNote: The OPTIONS request only returns the CORS settings for the current request origin.');
      console.log('You should verify in the Supabase dashboard that all necessary domains are allowed.');
    }
    
    // Check if bucket public URLs are accessible
    console.log('\nTesting Storage Bucket Accessibility:');
    await testStorageBucketAccess();
    
    console.log('\nCORS Configuration Steps:');
    console.log('1. Go to Supabase Dashboard > Project Settings > API');
    console.log('2. Under "CORS", add the following domains:');
    domainsToCheck.forEach(domain => console.log(`   - ${domain}`));
    console.log('3. Check "Expose Content-Range header" option');
    console.log('4. Click "Save"');
    
  } catch (error) {
    console.error('Error checking CORS settings:', error);
  }
}

async function testStorageBucketAccess() {
  try {
    // Get list of storage buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error fetching buckets:', error);
      return;
    }
    
    // Test access to each bucket
    for (const bucket of buckets) {
      console.log(`\nTesting bucket: ${bucket.id} (public: ${bucket.public ? 'Yes' : 'No'})`);
      
      if (!bucket.public) {
        console.log(`❌ Bucket ${bucket.id} is not public - direct URL access will fail`);
        continue;
      }
      
      // Try to list files to check access
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.id)
        .list();
        
      if (listError) {
        console.error(`Error listing files in ${bucket.id}:`, listError);
        continue;
      }
      
      console.log(`✅ Successfully listed ${files.length} items in bucket ${bucket.id}`);
      
      // If there are files, test accessing one
      if (files.length > 0) {
        let filePath = '';
        
        // Find a file (not a folder)
        const file = files.find(f => !f.metadata);
        if (file) {
          filePath = file.name;
        } else if (files[0].name) {
          // Just use the first item if no files found
          filePath = files[0].name;
        }
        
        if (filePath) {
          const { data } = supabase.storage
            .from(bucket.id)
            .getPublicUrl(filePath);
          
          console.log(`Public URL for test: ${data.publicUrl}`);
          console.log(`Testing URL access with HEAD request...`);
          
          try {
            // Try a HEAD request to see if the file is accessible
            const response = await fetch(data.publicUrl, { method: 'HEAD' });
            
            if (response.ok) {
              console.log(`✅ File is publicly accessible (${response.status} ${response.statusText})`);
            } else {
              console.log(`❌ File not accessible: ${response.status} ${response.statusText}`);
            }
          } catch (fetchError) {
            console.error('Error testing file access:', fetchError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error testing bucket access:', error);
  }
}

// Run the checks
checkCorsSettings().catch(error => {
  console.error('Unexpected error:', error);
});