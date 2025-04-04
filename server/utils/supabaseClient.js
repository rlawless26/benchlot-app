const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from server/.env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for backend

// Verify we have the required config
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration is missing. Please check your .env file');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? 'Set' : 'Missing');
  throw new Error('Supabase configuration is missing');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };