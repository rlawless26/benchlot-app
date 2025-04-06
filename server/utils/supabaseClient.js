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

// Log environment in development
if (process.env.NODE_ENV === 'development') {
  console.log('Server Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Server Supabase Key:', supabaseKey ? `Set (${supabaseKey.substring(0, 10)}...)` : 'Missing');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      "Content-Type": "application/json",
      "Accept": "*/*",
    },
  },
});

module.exports = { supabase };