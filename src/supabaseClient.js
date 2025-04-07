// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import config from './config';

// Initialize Supabase client with configuration from centralized config
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

// Debug environment variables
console.log('Supabase initialization:');
console.log('- URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing');
console.log('- Key:', supabaseKey ? `${supabaseKey.substring(0, 15)}...` : 'Missing');

/**
 * Create a robust Supabase client with error handling
 * @returns {Object} Supabase client instance
 */
function createSupabaseClient() {
  // Validate configuration
  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Supabase credentials are missing!');
    // In production, we'll use the default values from config
    // This helps prevent hard failures if env vars don't load properly
  }
  
  try {
    // Create client with proper headers
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error(`Failed to initialize Supabase client: ${error.message}`);
  }
}

// Create and export the Supabase client
export const supabase = createSupabaseClient();

// Add health check method to verify connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('tools').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return { 
        success: false, 
        error: error.message,
        details: error
      };
    }
    
    return { 
      success: true,
      message: 'Supabase connection successful'
    };
  } catch (error) {
    console.error('Supabase connection check exception:', error);
    return { 
      success: false, 
      error: error.message,
      type: 'exception'
    };
  }
};

// Auth helper functions
export const signUp = async (email, password, userData) => {
  // Step 1: Sign up with email and password
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) return { error: authError };
  
  // If auth successful, create a user profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,  // This must match the auth.uid
        username: userData.username,
        full_name: userData.fullName,
        location: userData.location || 'Boston, MA',
        email: email  // Include email in the users table too
      });
      
    if (profileError) return { error: profileError };
    
    // Send welcome email directly via API
    try {
      const response = await fetch(`${config.urls.api}/api/email/account-creation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: userData.fullName || userData.username
        }),
      });
      
      // Log the result
      if (response.ok) {
        console.log('Welcome email sent to:', email);
      } else {
        const result = await response.json();
        console.error('Error sending welcome email:', result.error);
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't return error, as the signup was successful
    }
  }
  
  return { data: authData };
};

// For brevity, not including all the other functions that are unchanged
// In a real implementation, you would update all API endpoints to use the
// config.urls.api prefix for consistency.

// Rest of the file remains the same...