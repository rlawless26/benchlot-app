/**
 * This script sets up Supabase storage buckets with proper permissions
 * It creates the required buckets if they don't exist and configures their access policies
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

// Bucket configurations
const buckets = [
  {
    id: 'user-images',
    public: true,
    policies: [
      {
        name: 'Public Read Access',
        definition: {
          role: 'anonymous', // Allow anonymous read access
          operations: ['select'],
          condition: ''
        }
      },
      {
        name: 'Avatar Upload Access',
        definition: {
          role: 'authenticated', // Allow authenticated users to upload
          operations: ['insert', 'update'],
          condition: "bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]"
        }
      }
    ]
  },
  {
    id: 'tool-images',
    public: true,
    policies: [
      {
        name: 'Public Read Access',
        definition: {
          role: 'anonymous', // Allow anonymous read access
          operations: ['select'],
          condition: ''
        }
      },
      {
        name: 'Tool Owner Upload Access',
        definition: {
          role: 'authenticated', // Allow authenticated tool owners to upload
          operations: ['insert', 'update'],
          condition: "bucket_id = 'tool-images' AND EXISTS (SELECT 1 FROM tools WHERE id::text = (storage.foldername(name))[1] AND seller_id = auth.uid())"
        }
      }
    ]
  }
];

// Create or update a bucket
async function setupBucket(bucketConfig) {
  console.log(`Setting up bucket: ${bucketConfig.id}`);
  
  // Check if bucket exists
  const { data: existingBuckets, error: listError } = await supabase
    .storage
    .listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const bucketExists = existingBuckets.some(b => b.name === bucketConfig.id);
  
  // Create bucket if it doesn't exist
  if (!bucketExists) {
    console.log(`Creating new bucket: ${bucketConfig.id}`);
    
    const { error: createError } = await supabase
      .storage
      .createBucket(bucketConfig.id, {
        public: bucketConfig.public
      });
    
    if (createError) {
      console.error(`Error creating bucket ${bucketConfig.id}:`, createError);
      return;
    }
  } else {
    console.log(`Bucket ${bucketConfig.id} already exists, updating settings`);
    
    // Update bucket settings
    const { error: updateError } = await supabase
      .storage
      .updateBucket(bucketConfig.id, {
        public: bucketConfig.public
      });
    
    if (updateError) {
      console.error(`Error updating bucket ${bucketConfig.id}:`, updateError);
      return;
    }
  }
  
  // Set up policies
  console.log(`Setting up policies for bucket: ${bucketConfig.id}`);
  
  // First, get existing policies
  const { data: existingPolicies, error: policyError } = await supabase
    .rpc('get_policies_for_bucket', { bucket_name: bucketConfig.id });
  
  if (policyError) {
    console.error(`Error getting policies for bucket ${bucketConfig.id}:`, policyError);
    return;
  }
  
  // Create or update each policy
  for (const policy of bucketConfig.policies) {
    const existingPolicy = existingPolicies?.find(p => p.name === policy.name);
    
    if (existingPolicy) {
      console.log(`Updating policy: ${policy.name}`);
      
      // Update existing policy
      const { error: updatePolicyError } = await supabase
        .rpc('update_policy_for_bucket', {
          bucket_name: bucketConfig.id,
          policy_name: policy.name,
          policy_definition: policy.definition
        });
      
      if (updatePolicyError) {
        console.error(`Error updating policy ${policy.name}:`, updatePolicyError);
      }
    } else {
      console.log(`Creating policy: ${policy.name}`);
      
      // Create new policy
      const { error: createPolicyError } = await supabase
        .rpc('create_policy_for_bucket', {
          bucket_name: bucketConfig.id,
          policy_name: policy.name,
          policy_definition: policy.definition
        });
      
      if (createPolicyError) {
        console.error(`Error creating policy ${policy.name}:`, createPolicyError);
      }
    }
  }
  
  console.log(`Finished setting up bucket: ${bucketConfig.id}`);
}

// Main function
async function main() {
  console.log('Starting bucket setup script...');
  
  try {
    // Set up each bucket
    for (const bucket of buckets) {
      await setupBucket(bucket);
    }
    
    console.log('Bucket setup completed successfully!');
  } catch (error) {
    console.error('Script failed with error:', error);
  }
}

// Run the script
main();