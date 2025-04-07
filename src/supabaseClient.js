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

/**
 * Get the current user with profile data from Supabase
 * @returns {Object} Current user data with profile
 */
export const getCurrentUser = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return { data: null, error: sessionError };
    }
    
    if (!session) {
      return { data: null };
    }
    
    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return { data: null, error: userError };
    }
    
    if (!user) {
      return { data: null };
    }
    
    // Get user profile from the users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error getting user profile:', profileError);
      // Don't return error here, as we still have the user data
    }
    
    return {
      data: {
        ...user,
        profile: profile || null
      }
    };
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return { data: null, error };
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} Auth data or error
 */
export const signIn = async (email, password) => {
  try {
    console.log(`Attempting to sign in user with email: ${email}`);
    
    // Input validation
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return { error };
    }
    
    // If we got here, sign in was successful
    console.log('User signed in successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in signIn:', error);
    return { error };
  }
};

/**
 * Send a password reset email to the user
 * @param {string} email - User's email
 * @returns {Object} Result of the operation
 */
export const resetPassword = async (email) => {
  try {
    console.log(`Sending password reset email to: ${email}`);
    
    // Validate input
    if (!email) {
      return { error: { message: 'Email is required' } };
    }
    
    // Use frontend URL from config for redirect
    const redirectTo = `${config.urls.frontend}/reset-password`;
    console.log(`Reset password redirect URL: ${redirectTo}`);
    
    // Send the password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return { error };
    }
    
    console.log('Password reset email sent successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in resetPassword:', error);
    return { error };
  }
};

/**
 * Complete password reset process
 * @param {string} newPassword - New password to set
 * @returns {Object} Result of the operation
 */
export const completePasswordReset = async (newPassword) => {
  try {
    console.log('Attempting to complete password reset');
    
    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return { error: { message: 'New password must be at least 6 characters' } };
    }
    
    // Update the user's password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      return { error };
    }
    
    console.log('Password updated successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in completePasswordReset:', error);
    return { error };
  }
};

/**
 * Sign up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} userData - Additional user data
 * @returns {Object} Auth data or error
 */
export const signUp = async (email, password, userData) => {
  try {
    console.log(`Attempting to sign up user with email: ${email}`);
    
    // Input validation
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }
    
    if (!userData || !userData.username) {
      return { error: { message: 'Username is required' } };
    }
    
    // Step 1: Sign up with email and password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Sign up auth error:', authError);
      return { error: authError };
    }
    
    // If auth successful, create a user profile
    if (authData.user) {
      console.log(`User authenticated successfully, creating profile for user ID: ${authData.user.id}`);
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,  // This must match the auth.uid
          username: userData.username,
          full_name: userData.fullName,
          location: userData.location || 'Boston, MA',
          email: email,  // Include email in the users table too
          created_at: new Date().toISOString(),
          is_seller: false // Default to not a seller
        });
        
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { error: profileError };
      }
      
      // Send welcome email directly via API
      try {
        const apiUrl = config.urls.api || window.location.origin;
        const response = await fetch(`${apiUrl}/api/email/account-creation`, {
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
    
    console.log('User sign up completed successfully');
    return { data: authData };
  } catch (error) {
    console.error('Unexpected error in signUp:', error);
    return { error };
  }
};

/**
 * Sign out the current user
 * @returns {Object} Result of the operation
 */
export const signOut = async () => {
  try {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    
    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in signOut:', error);
    return { error };
  }
};