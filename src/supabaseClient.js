// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import config from './config';

// Initialize Supabase client with configuration 
// The bootstrapper.js script should have already guaranteed these values are available
// and the config module should have properly captured them
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

// Log initialization details
console.log('Supabase initialization:');
console.log('- URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing');
console.log('- Key:', supabaseKey ? `${supabaseKey.substring(0, 15)}...` : 'Missing');
console.log('- Global Config Available:', typeof window !== 'undefined' && window.__BENCHLOT_CORE_CONFIG ? 'Yes' : 'No');

// Extra verification - if we still don't have credentials, something is very wrong
if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ CRITICAL ERROR: Supabase credentials not available despite bootstrapper');
  if (typeof window !== 'undefined') {
    // Add a visible error to the DOM for easier troubleshooting
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.right = '0';
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.zIndex = '9999';
    errorDiv.textContent = 'Configuration Error: Missing Supabase credentials. Please check the console.';
    document.body.appendChild(errorDiv);
  }
}

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
 * Check environment variable setup
 * @returns {Object} Environment status information
 */
export const checkEnvironment = () => {
  // General environment check
  const envCheck = {
    reactApp: {
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || window.REACT_APP_SUPABASE_URL || 'Not found',
      supabaseKey: (process.env.REACT_APP_SUPABASE_ANON_KEY || window.REACT_APP_SUPABASE_ANON_KEY) ? 'Present (not shown)' : 'Not found',
      apiUrl: process.env.REACT_APP_API_URL || window.REACT_APP_API_URL || 'Not found',
      frontendUrl: process.env.REACT_APP_FRONTEND_URL || window.REACT_APP_FRONTEND_URL || 'Not found',
    },
    benchlot: window.BENCHLOT_ENV ? 'Available' : 'Not available',
    supabaseClient: {
      url: supabaseUrl ? supabaseUrl : 'Not available',
      key: supabaseKey ? 'Present (not shown)' : 'Not available',
      methods: Object.keys(supabase || {}).length,
      initialized: supabase?.auth ? 'Yes' : 'No'
    },
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  console.log('Environment check:', envCheck);
  return envCheck;
};

//==============================================================================
// USER AUTHENTICATION & PROFILE FUNCTIONS
//==============================================================================

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

/**
 * Update user profile data
 * @param {Object} profileData - User profile data to update
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Object} Updated profile data or error
 */
export const updateUserProfile = async (profileData, userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'User not found' } };
      }
      userId = user.id;
    }
    
    console.log(`Updating profile for user ${userId}`);
    
    if (!profileData) {
      return { error: { message: 'Profile data is required' } };
    }
    
    // Format data for update - don't include updated_at as it doesn't exist in schema
    const updateData = {
      ...profileData
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return { error };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @param {string} oldPassword - Optional old password for verification
 * @returns {Object} Result of the operation
 */
export const updateUserPassword = async (newPassword, oldPassword = null) => {
  try {
    console.log('Updating user password');
    
    if (!newPassword) {
      return { error: { message: 'New password is required' } };
    }
    
    if (newPassword.length < 6) {
      return { error: { message: 'Password must be at least 6 characters' } };
    }
    
    // If old password provided, verify it first (for extra security)
    if (oldPassword) {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'User not found' } };
      }
      
      // Try to sign in with the old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });
      
      if (signInError) {
        console.error('Current password verification failed:', signInError);
        return { error: { message: 'Current password is incorrect' } };
      }
    }
    
    // Update the password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Error updating password:', error);
      return { error };
    }
    
    console.log('Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateUserPassword:', error);
    return { error };
  }
};

/**
 * Update user notification preferences
 * @param {Object} preferences - Notification preferences
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Object} Result of the operation
 */
export const updateUserPreferences = async (preferences, userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'User not found' } };
      }
      userId = user.id;
    }
    
    console.log(`Updating preferences for user ${userId}`);
    
    if (!preferences) {
      return { error: { message: 'Preferences data is required' } };
    }
    
    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', profileError);
      return { error: profileError };
    }
    
    // Merge existing preferences with new ones
    const updatedPreferences = {
      ...(profile?.notification_preferences || {}),
      ...preferences,
    };
    
    // Update the preferences - don't include updated_at as it doesn't exist in schema
    const { error } = await supabase
      .from('users')
      .update({ 
        notification_preferences: updatedPreferences
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating user preferences:', error);
      return { error };
    }
    
    console.log('User preferences updated successfully');
    return { success: true, data: updatedPreferences };
  } catch (error) {
    console.error('Unexpected error in updateUserPreferences:', error);
    return { error };
  }
};

//==============================================================================
// TOOL LISTING FUNCTIONS
//==============================================================================

/**
 * Fetch tools with optional filtering
 * @param {Object} options - Filter options
 * @returns {Object} Array of tools or error
 */
export const fetchTools = async (options = {}) => {
  try {
    console.log('Fetching tools with options:', options);
    
    // Start building query
    let query = supabase.from('tools').select(`
      *,
      seller:seller_id(id, username, full_name, avatar_url, location, stripe_account_status)
    `);
    
    // Apply filters
    if (options.featured === true) {
      query = query.eq('is_featured', true);
    }
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.subcategory) {
      query = query.eq('subcategory', options.subcategory);
    }
    
    if (options.is_sold !== undefined) {
      query = query.eq('is_sold', options.is_sold);
    }
    
    if (options.verified === true) {
      query = query.eq('is_verified', true);
    }
    
    if (options.sellerId) {
      query = query.eq('seller_id', options.sellerId);
    }
    
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    
    if (options.minPrice) {
      query = query.gte('current_price', options.minPrice);
    }
    
    if (options.maxPrice) {
      query = query.lte('current_price', options.maxPrice);
    }
    
    if (options.condition && Array.isArray(options.condition) && options.condition.length > 0) {
      query = query.in('condition', options.condition);
    }
    
    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    // Sorting
    if (options.sort) {
      switch (options.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price-asc':
          query = query.order('current_price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('current_price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      // Default to newest first
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tools:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchTools:', error);
    return { error };
  }
};

/**
 * Fetch featured tools
 * @param {number} limit - Number of tools to fetch
 * @returns {Object} Array of featured tools or error
 */
export const fetchFeaturedTools = async (limit = 6) => {
  try {
    console.log(`Fetching featured tools, limit: ${limit}`);
    
    return await fetchTools({
      featured: true,
      is_sold: false,
      limit,
      sort: 'newest'
    });
  } catch (error) {
    console.error('Unexpected error in fetchFeaturedTools:', error);
    return { error };
  }
};

/**
 * Fetch a tool by ID
 * @param {string} id - Tool ID
 * @returns {Object} Tool data or error
 */
export const fetchToolById = async (id) => {
  try {
    console.log(`Fetching tool with ID: ${id}`);
    
    if (!id) {
      return { error: { message: 'Tool ID is required' } };
    }
    
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        seller:seller_id(id, username, full_name, avatar_url, location, stripe_account_status)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching tool with ID ${id}:`, error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchToolById:', error);
    return { error };
  }
};

/**
 * Create a new tool listing
 * @param {Object} toolData - Tool data
 * @returns {Object} Created tool data or error
 */
export const createTool = async (toolData) => {
  try {
    console.log('Creating new tool with data:', toolData);
    
    // Input validation
    if (!toolData.name || !toolData.current_price || !toolData.seller_id) {
      return { error: { message: 'Name, price, and seller ID are required' } };
    }
    
    // Set defaults for common fields if not provided
    const tool = {
      created_at: new Date().toISOString(),
      is_sold: false,
      is_featured: false,
      is_verified: false,
      views: 0,
      ...toolData
    };
    
    const { data, error } = await supabase
      .from('tools')
      .insert(tool)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating tool:', error);
      return { error };
    }
    
    console.log('Tool created successfully:', data.id);
    return { data };
  } catch (error) {
    console.error('Unexpected error in createTool:', error);
    return { error };
  }
};

/**
 * Update a tool listing
 * @param {string} id - Tool ID
 * @param {Object} updates - Tool data to update
 * @returns {Object} Updated tool data or error
 */
export const updateTool = async (id, updates) => {
  try {
    console.log(`Updating tool ${id} with:`, updates);
    
    if (!id) {
      return { error: { message: 'Tool ID is required' } };
    }
    
    const { data, error } = await supabase
      .from('tools')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating tool ${id}:`, error);
      return { error };
    }
    
    console.log('Tool updated successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in updateTool:', error);
    return { error };
  }
};

/**
 * Delete a tool listing
 * @param {string} id - Tool ID
 * @returns {Object} Result of the operation
 */
export const deleteTool = async (id) => {
  try {
    console.log(`Deleting tool ${id}`);
    
    if (!id) {
      return { error: { message: 'Tool ID is required' } };
    }
    
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting tool ${id}:`, error);
      return { error };
    }
    
    console.log('Tool deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteTool:', error);
    return { error };
  }
};

/**
 * Upload a tool image
 * @param {string} toolId - Tool ID
 * @param {File} file - Image file to upload
 * @param {number} position - Image position
 * @returns {Object} Uploaded image data or error
 */
export const uploadToolImage = async (toolId, file, position = 0) => {
  try {
    console.log(`Uploading image for tool ${toolId} at position ${position}`);
    
    if (!toolId || !file) {
      return { error: { message: 'Tool ID and file are required' } };
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${toolId}/${position}_${Date.now()}.${fileExt}`;
    const filePath = `tools/${fileName}`;
    
    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`Error uploading image:`, uploadError);
      return { error: uploadError };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    // Update the tool with the new image
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('images')
      .eq('id', toolId)
      .single();
      
    if (toolError) {
      console.error(`Error fetching tool ${toolId}:`, toolError);
      return { error: toolError };
    }
    
    // Prepare the updated images array
    let images = Array.isArray(tool.images) ? [...tool.images] : [];
    if (position >= images.length) {
      // Add to the end
      images.push(publicUrl);
    } else {
      // Replace at position
      images[position] = publicUrl;
    }
    
    // Update the tool
    const { error: updateError } = await supabase
      .from('tools')
      .update({ images })
      .eq('id', toolId);
      
    if (updateError) {
      console.error(`Error updating tool images:`, updateError);
      return { error: updateError };
    }
    
    console.log('Image uploaded successfully:', publicUrl);
    return { data: { url: publicUrl, position } };
  } catch (error) {
    console.error('Unexpected error in uploadToolImage:', error);
    return { error };
  }
};

/**
 * Remove a tool image
 * @param {string} toolId - Tool ID
 * @param {number} position - Image position to remove
 * @returns {Object} Result of the operation
 */
export const removeToolImage = async (toolId, position) => {
  try {
    console.log(`Removing image at position ${position} for tool ${toolId}`);
    
    if (!toolId || position === undefined) {
      return { error: { message: 'Tool ID and position are required' } };
    }
    
    // Get the current images
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('images')
      .eq('id', toolId)
      .single();
      
    if (toolError) {
      console.error(`Error fetching tool ${toolId}:`, toolError);
      return { error: toolError };
    }
    
    if (!Array.isArray(tool.images) || position >= tool.images.length) {
      return { error: { message: 'Image not found at the specified position' } };
    }
    
    // Remove the image from array
    const images = [...tool.images];
    const removedUrl = images.splice(position, 1)[0];
    
    // Update the tool
    const { error: updateError } = await supabase
      .from('tools')
      .update({ images })
      .eq('id', toolId);
      
    if (updateError) {
      console.error(`Error updating tool images:`, updateError);
      return { error: updateError };
    }
    
    // Try to delete the file from storage if it's a URL we can parse
    try {
      if (removedUrl && typeof removedUrl === 'string') {
        const path = removedUrl.split('/').slice(-2).join('/');
        if (path) {
          await supabase.storage.from('images').remove([`tools/${path}`]);
        }
      }
    } catch (removeError) {
      console.warn('Could not remove file from storage:', removeError);
      // Don't fail the operation if storage removal fails
    }
    
    console.log('Image removed successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in removeToolImage:', error);
    return { error };
  }
};

//==============================================================================
// WISHLIST FUNCTIONS
//==============================================================================

/**
 * Add tool to wishlist
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object} Result of the operation
 */
export const addToWishlist = async (userId, toolId) => {
  try {
    console.log(`Adding tool ${toolId} to wishlist for user ${userId}`);
    
    if (!userId || !toolId) {
      return { error: { message: 'User ID and Tool ID are required' } };
    }
    
    const { data, error } = await supabase
      .from('wishlist') // Corrected to match the actual table name
      .insert({
        user_id: userId,
        tool_id: toolId,
        created_at: new Date().toISOString() // Corrected to match the schema
      })
      .select();
      
    if (error) {
      console.error('Error adding to wishlist:', error);
      return { error };
    }
    
    console.log('Added to wishlist successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in addToWishlist:', error);
    return { error };
  }
};

/**
 * Remove tool from wishlist
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object} Result of the operation
 */
export const removeFromWishlist = async (userId, toolId) => {
  try {
    console.log(`Removing tool ${toolId} from wishlist for user ${userId}`);
    
    if (!userId || !toolId) {
      return { error: { message: 'User ID and Tool ID are required' } };
    }
    
    const { error } = await supabase
      .from('wishlist') // Corrected to match the actual table name
      .delete()
      .match({ user_id: userId, tool_id: toolId });
      
    if (error) {
      console.error('Error removing from wishlist:', error);
      return { error };
    }
    
    console.log('Removed from wishlist successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in removeFromWishlist:', error);
    return { error };
  }
};

/**
 * Fetch user's wishlist items
 * @param {string} userId - User ID
 * @returns {Object} Array of wishlist items or error
 */
export const fetchWishlistItems = async (userId) => {
  try {
    console.log(`Fetching wishlist for user ${userId}`);
    
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }
    
    const { data, error } = await supabase
      .from('wishlist') // Corrected to match the actual table name
      .select(`
        id,
        created_at, // Corrected to match the schema
        tool:tool_id(
          id,
          name,
          description,
          current_price,
          original_price,
          condition,
          is_sold,
          is_verified,
          images,
          seller:seller_id(id, username, full_name, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Corrected to match the schema
      
    if (error) {
      console.error('Error fetching wishlist:', error);
      return { error };
    }
    
    console.log(`Found ${data.length} wishlist items`);
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchWishlistItems:', error);
    return { error };
  }
};

/**
 * Fetch the current user's wishlist items
 * @returns {Object} Array of wishlist items or error
 */
export const fetchWishlist = async () => {
  try {
    console.log('Fetching wishlist for current user');
    
    // Get current user
    const { data: userData } = await getCurrentUser();
    if (!userData) {
      return { error: { message: 'User is not logged in' } };
    }
    
    // Use the existing fetchWishlistItems function
    const { data, error } = await fetchWishlistItems(userData.id);
    
    if (error) {
      return { error };
    }
    
    // Transform the data to match the expected format in Wishlist.jsx
    const transformedData = data.map(item => ({
      id: item.tool.id,
      ...item.tool,
      added_at: item.created_at // Maintain added_at for compatibility but use created_at value
    }));
    
    return { data: transformedData };
  } catch (error) {
    console.error('Unexpected error in fetchWishlist:', error);
    return { error };
  }
};

/**
 * Check if tool is in user's wishlist
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object} Boolean result or error
 */
export const isInWishlist = async (userId, toolId) => {
  try {
    console.log(`Checking if tool ${toolId} is in wishlist for user ${userId}`);
    
    if (!userId || !toolId) {
      return { data: false };
    }
    
    const { data, error } = await supabase
      .from('wishlist') // Corrected to match the actual table name
      .select('id')
      .match({ user_id: userId, tool_id: toolId })
      .maybeSingle();
      
    if (error) {
      console.error('Error checking wishlist:', error);
      return { error };
    }
    
    return { data: !!data };
  } catch (error) {
    console.error('Unexpected error in isInWishlist:', error);
    return { error };
  }
};

/**
 * Check if a tool is in the current user's wishlist
 * @param {string} toolId - Tool ID to check
 * @returns {Object} Boolean result or error
 */
export const isToolInWishlist = async (toolId) => {
  try {
    console.log(`Checking if tool ${toolId} is in the current user's wishlist`);
    
    if (!toolId) {
      return { data: false };
    }
    
    // Get current user
    const { data: userData } = await getCurrentUser();
    if (!userData) {
      return { data: false };
    }
    
    // Use the existing isInWishlist function with the current user ID
    return await isInWishlist(userData.id, toolId);
  } catch (error) {
    console.error('Unexpected error in isToolInWishlist:', error);
    return { error };
  }
};

//==============================================================================
// MESSAGE FUNCTIONS
//==============================================================================

/**
 * Send a message
 * @param {string} recipientId - Recipient user ID
 * @param {string} content - Message content
 * @param {string} toolId - Optional tool ID related to the message
 * @param {string} messageType - Optional message type (default: 'text')
 * @returns {Object} Created message or error
 */
export const sendMessage = async (recipientId, content, toolId = null, messageType = 'text') => {
  try {
    console.log(`Sending message to ${recipientId}${toolId ? ' about tool ' + toolId : ''}`);
    
    if (!recipientId || !content) {
      return { error: { message: 'Recipient ID and content are required' } };
    }
    
    // Get current user
    const { data: userData } = await getCurrentUser();
    if (!userData) {
      return { error: { message: 'User is not logged in' } };
    }
    
    const message = {
      sender_id: userData.id,
      recipient_id: recipientId,
      content,
      tool_id: toolId,
      message_type: messageType,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
      return { error };
    }
    
    console.log('Message sent successfully:', data.id);
    return { data };
  } catch (error) {
    console.error('Unexpected error in sendMessage:', error);
    return { error };
  }
};

/**
 * Fetch conversations for a user
 * @param {string} userId - User ID
 * @returns {Object} Array of conversations or error
 */
export const fetchConversations = async (userId) => {
  try {
    console.log(`Fetching conversations for user ${userId}`);
    
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }
    
    // Use RPC function to get conversations (you'd need to create this in Supabase)
    const { data, error } = await supabase
      .rpc('get_conversations', { user_id: userId });
      
    if (error) {
      console.error('Error fetching conversations:', error);
      return { error };
    }
    
    console.log(`Found ${data.length} conversations`);
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchConversations:', error);
    return { error };
  }
};

/**
 * Fetch messages between two users
 * @param {string} userId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @returns {Object} Array of messages or error
 */
export const fetchMessages = async (userId, otherUserId) => {
  try {
    console.log(`Fetching messages between ${userId} and ${otherUserId}`);
    
    if (!userId || !otherUserId) {
      return { error: { message: 'Both user IDs are required' } };
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        is_read,
        sender_id,
        recipient_id,
        sender:sender_id(id, username, full_name, avatar_url),
        recipient:recipient_id(id, username, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      return { error };
    }
    
    // Filter to only include messages between these two users
    const filteredMessages = data.filter(msg => 
      (msg.sender_id === userId && msg.recipient_id === otherUserId) || 
      (msg.sender_id === otherUserId && msg.recipient_id === userId)
    );
    
    console.log(`Found ${filteredMessages.length} messages`);
    return { data: filteredMessages };
  } catch (error) {
    console.error('Unexpected error in fetchMessages:', error);
    return { error };
  }
};

/**
 * Mark messages as read
 * @param {string} userId - User ID (recipient)
 * @param {string} senderId - Sender ID
 * @returns {Object} Result of the operation
 */
export const markMessagesAsRead = async (userId, senderId) => {
  try {
    console.log(`Marking messages from ${senderId} to ${userId} as read`);
    
    if (!userId || !senderId) {
      return { error: { message: 'Both user IDs are required' } };
    }
    
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .match({ recipient_id: userId, sender_id: senderId, is_read: false });
      
    if (error) {
      console.error('Error marking messages as read:', error);
      return { error };
    }
    
    console.log('Messages marked as read successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in markMessagesAsRead:', error);
    return { error };
  }
};

//==============================================================================
// CART FUNCTIONS
//==============================================================================

/**
 * Add tool to cart
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object} Result of the operation
 */
export const addToCart = async (userId, toolId) => {
  try {
    console.log(`Adding tool ${toolId} to cart for user ${userId}`);
    
    if (!userId || !toolId) {
      return { error: { message: 'User ID and Tool ID are required' } };
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        tool_id: toolId,
        added_at: new Date().toISOString(),
        quantity: 1
      })
      .select();
      
    if (error) {
      console.error('Error adding to cart:', error);
      return { error };
    }
    
    console.log('Added to cart successfully');
    return { data };
  } catch (error) {
    console.error('Unexpected error in addToCart:', error);
    return { error };
  }
};

/**
 * Remove tool from cart
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object} Result of the operation
 */
export const removeFromCart = async (userId, toolId) => {
  try {
    console.log(`Removing tool ${toolId} from cart for user ${userId}`);
    
    if (!userId || !toolId) {
      return { error: { message: 'User ID and Tool ID are required' } };
    }
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .match({ user_id: userId, tool_id: toolId });
      
    if (error) {
      console.error('Error removing from cart:', error);
      return { error };
    }
    
    console.log('Removed from cart successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in removeFromCart:', error);
    return { error };
  }
};

/**
 * Fetch user's cart items
 * @param {string} userId - User ID
 * @returns {Object} Array of cart items or error
 */
export const fetchCartItems = async (userId) => {
  try {
    console.log(`Fetching cart for user ${userId}`);
    
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        added_at,
        tool:tool_id(
          id,
          name,
          description,
          current_price,
          condition,
          is_sold,
          is_verified,
          images,
          seller:seller_id(id, username, full_name, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching cart:', error);
      return { error };
    }
    
    console.log(`Found ${data.length} cart items`);
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchCartItems:', error);
    return { error };
  }
};

//==============================================================================
// USER PROFILE IMAGE FUNCTIONS
//==============================================================================

/**
 * Helper function to test if a URL is accessible
 * @param {string} url - URL to test
 * @returns {Promise<boolean>} True if accessible, false otherwise
 */
export const isUrlAccessible = async (url) => {
  if (!url) return false;
  
  try {
    console.log(`Testing URL accessibility: ${url}`);
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true; // If we get here, the request didn't throw
  } catch (error) {
    console.error(`URL access test failed for ${url}:`, error);
    return false;
  }
};

/**
 * Upload a profile image for a user with multiple bucket fallbacks and error handling
 * @param {File} file - Image file to upload
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Object} Result of the operation with avatar URL
 */
export const uploadProfileImage = async (file, userId = null) => {
  try {
    console.log('Uploading profile image');
    
    if (!file) {
      return { error: { message: 'File is required' } };
    }
    
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'User not found' } };
      }
      userId = user.id;
    }
    
    console.log(`Uploading profile image for user ${userId}`);
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      return { error: { message: 'File must be an image' } };
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB
      return { error: { message: 'File size must be less than 2MB' } };
    }
    
    // Generate a unique filename - simplify to avoid directory structure issues
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `user_${userId}_${timestamp}.${fileExt}`;
    
    // Define buckets to try in order of preference based on existing bucket structure
    // Changing the order to try tool-images first which might have working CORS
    const buckets = [
      { name: 'tool-images', path: `avatars/${fileName}` },
      { name: 'user-images', path: `avatars/${fileName}` }
    ];
    
    // Try each bucket in sequence until one works
    let uploadError = null;
    let publicUrl = null;
    
    for (const bucket of buckets) {
      console.log(`Attempting to upload to ${bucket.name} bucket with path: ${bucket.path}`);
      
      try {
        // Upload the file to current bucket
        const { data, error } = await supabase.storage
          .from(bucket.name)
          .upload(bucket.path, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          console.error(`Error uploading to ${bucket.name} bucket:`, error);
          uploadError = error;
          continue; // Try next bucket
        }
        
        // Get the public URL
        const { data: { publicUrl: url } } = supabase.storage
          .from(bucket.name)
          .getPublicUrl(bucket.path);
        
        publicUrl = url;
        console.log(`Successfully uploaded to ${bucket.name} bucket. URL:`, publicUrl);
        
        // Test URL accessibility
        const isAccessible = await isUrlAccessible(publicUrl);
        console.log(`URL accessibility test: ${isAccessible ? 'PASSED' : 'FAILED'}`);
        
        // Add a cache-busting parameter to the URL to prevent caching issues
        if (publicUrl && publicUrl.includes('?')) {
          publicUrl = `${publicUrl}&t=${Date.now()}`;
        } else if (publicUrl) {
          publicUrl = `${publicUrl}?t=${Date.now()}`;
        }
        break; // Stop trying buckets
      } catch (error) {
        console.error(`Unexpected error uploading to ${bucket.name} bucket:`, error);
        uploadError = error;
      }
    }
    
    // If we couldn't upload to any bucket
    if (!publicUrl) {
      console.error('Failed to upload to any storage bucket');
      return { 
        error: { 
          message: 'Failed to upload image to any storage bucket. Please try again or contact support.', 
          details: uploadError 
        } 
      };
    }
    
    // Update user profile with new avatar URL
    try {
      await updateUserWithNewAvatar(userId, publicUrl);
      return { data: { avatarUrl: publicUrl } };
    } catch (updateError) {
      console.error('Error updating user profile with avatar URL:', updateError);
      // Still return success since the upload worked, but include a warning
      return { 
        data: { avatarUrl: publicUrl },
        warning: 'Image uploaded successfully, but there was an issue updating your profile. Please refresh or try again.'
      };
    }
  } catch (error) {
    console.error('Unexpected error in uploadProfileImage:', error);
    return { error: { message: 'An unexpected error occurred', details: error } };
  }
};

// Helper function to update user profile with new avatar URL
async function updateUserWithNewAvatar(userId, publicUrl) {
  try {
    console.log(`Updating user ${userId} with new avatar URL: ${publicUrl}`);
    
    // Ensure the URL has a cache-busting parameter
    let urlWithCacheBusting = publicUrl;
    if (publicUrl && publicUrl.includes('?')) {
      urlWithCacheBusting = `${publicUrl}&t=${Date.now()}`;
    } else if (publicUrl) {
      urlWithCacheBusting = `${publicUrl}?t=${Date.now()}`;
    }
    
    // Update the user profile
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: urlWithCacheBusting
      })
      .eq('id', userId)
      .select('avatar_url');
      
    if (updateError) {
      console.error('Error updating user profile with new avatar:', updateError);
      throw updateError;
    }
    
    console.log('Profile image updated in database. Result:', data);
    return data;
  } catch (error) {
    console.error('Error in updateUserWithNewAvatar:', error);
    throw error;
  }
}

/**
 * Remove profile image for a user
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Object} Result of the operation
 */
export const removeProfileImage = async (userId = null) => {
  try {
    console.log('Removing profile image');
    
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'User not found' } };
      }
      userId = user.id;
    }
    
    console.log(`Removing profile image for user ${userId}`);
    
    // Get the current avatar URL
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: profileError };
    }
    
    // Update the user profile to remove avatar_url
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: null
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return { error: updateError };
    }
    
    // Try to delete the file from storage if it exists
    if (profile && profile.avatar_url) {
      try {
        // Extract file information from URL
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // Determine which bucket the file is in from the URL based on existing bucket structure
        let bucket = 'user-images'; // default assumption for profile images
        
        if (url.pathname.includes('/tool-images/')) {
          bucket = 'tool-images';
        } else if (url.pathname.includes('/user-images/')) {
          bucket = 'user-images';
        }
        
        // Try to construct the correct path based on the URL structure
        let filePath;
        
        // For existing bucket structure, we always use the avatars/ prefix
        if (url.pathname.includes('/avatars/')) {
          // Extract the full path after the bucket name
          const pathAfterBucket = url.pathname.split(`/${bucket}/`)[1];
          filePath = pathAfterBucket;
        } else {
          // Fallback - just use avatars/filename
          filePath = `avatars/${fileName}`;
        }
        
        console.log(`Attempting to remove file from ${bucket} bucket: ${filePath}`);
        
        // Attempt to remove the file
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([filePath]);
          
        if (removeError) {
          console.warn(`Could not remove file from ${bucket} bucket:`, removeError);
          // Don't fail the operation if removal fails
        } else {
          console.log(`Successfully removed file from ${bucket} bucket`);
        }
        
      } catch (removeError) {
        console.warn('Could not parse or remove avatar file:', removeError);
        // Don't fail the operation if storage removal fails
      }
    }
    
    console.log('Profile image removed successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in removeProfileImage:', error);
    return { error };
  }
};

//==============================================================================
// OFFER MANAGEMENT FUNCTIONS
//==============================================================================

/**
 * Fetch offers for a user
 * @param {string} userId - Optional user ID (defaults to current user)
 * @param {string} role - Role to filter by ('seller', 'buyer', or 'all')
 * @param {string} status - Status to filter by ('pending', 'accepted', 'rejected', 'all')
 * @returns {Object} Array of offers or error
 */
export const fetchUserOffers = async (userId = null, role = 'all', status = 'all') => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: userData } = await getCurrentUser();
      if (!userData) {
        return { error: { message: 'User not found' } };
      }
      userId = userData.id;
    }
    
    console.log(`Fetching offers for user ${userId} as ${role}, status: ${status}`);
    
    // Build the query based on role
    let query = supabase.from('offers').select(`
      id,
      created_at,
      updated_at,
      status,
      amount,
      counter_offer,
      listing:tool_id (
        id,
        name,
        images,
        current_price,
        seller_id
      ),
      buyer:buyer_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      seller:seller_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `);
    
    // Apply role filter
    if (role === 'seller') {
      query = query.eq('seller_id', userId);
    } else if (role === 'buyer') {
      query = query.eq('buyer_id', userId);
    } else {
      // 'all' - either seller or buyer
      query = query.or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);
    }
    
    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Sort by most recent
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user offers:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchUserOffers:', error);
    return { error };
  }
};

/**
 * Create a new offer
 * @param {Object} offerData - Offer data
 * @returns {Object} Created offer or error
 */
export const createOffer = async (offerData) => {
  try {
    if (!offerData.toolId || !offerData.amount) {
      return { error: { message: 'Tool ID and amount are required' } };
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: { message: 'You must be logged in to make an offer' } };
    }
    
    // Get tool info to verify it exists and get seller ID
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id, seller_id, name, current_price')
      .eq('id', offerData.toolId)
      .single();
      
    if (toolError) {
      console.error('Error fetching tool:', toolError);
      return { error: { message: 'Tool not found' } };
    }
    
    // Cannot make offer on own listing
    if (tool.seller_id === user.id) {
      return { error: { message: 'Cannot make offer on your own listing' } };
    }
    
    // Create the offer
    const { data, error } = await supabase
      .from('offers')
      .insert({
        tool_id: offerData.toolId,
        buyer_id: user.id,
        seller_id: tool.seller_id,
        amount: offerData.amount,
        status: 'pending',
        message: offerData.message || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating offer:', error);
      return { error };
    }
    
    // Send notification to seller (via SendGrid email API)
    try {
      // Get seller email
      const { data: seller } = await supabase
        .from('users')
        .select('email, username')
        .eq('id', tool.seller_id)
        .single();
        
      if (seller) {
        // Send email notification (implementation would go here)
        console.log(`Notification would be sent to ${seller.email} about new offer`);
      }
    } catch (notifError) {
      console.error('Error sending offer notification:', notifError);
      // Don't fail the offer creation if notification fails
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in createOffer:', error);
    return { error };
  }
};

/**
 * Respond to an offer (accept, reject, or counter)
 * @param {string} offerId - Offer ID
 * @param {string} action - Action to take ('accept', 'reject', 'counter')
 * @param {number} counterAmount - Counter offer amount (required if action is 'counter')
 * @returns {Object} Result of the operation
 */
export const respondToOffer = async (offerId, action, counterAmount = null) => {
  try {
    if (!offerId || !action) {
      return { error: { message: 'Offer ID and action are required' } };
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: { message: 'You must be logged in to respond to an offer' } };
    }
    
    // Get the offer
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        id, 
        status, 
        seller_id, 
        buyer_id, 
        tool_id,
        listing:tool_id (name)
      `)
      .eq('id', offerId)
      .single();
      
    if (offerError) {
      console.error('Error fetching offer:', offerError);
      return { error: { message: 'Offer not found' } };
    }
    
    // Verify user is the seller
    if (offer.seller_id !== user.id) {
      return { error: { message: 'Only the seller can respond to offers' } };
    }
    
    // Verify offer is still pending
    if (offer.status !== 'pending') {
      return { error: { message: 'Cannot respond to an offer that is not pending' } };
    }
    
    // Prepare update data based on action
    let updateData = {};
    
    switch (action) {
      case 'accept':
        updateData = {
          status: 'accepted',
          updated_at: new Date().toISOString()
        };
        break;
      case 'reject':
        updateData = {
          status: 'rejected',
          updated_at: new Date().toISOString()
        };
        break;
      case 'counter':
        if (!counterAmount) {
          return { error: { message: 'Counter offer amount is required' } };
        }
        updateData = {
          status: 'countered',
          counter_offer: counterAmount,
          updated_at: new Date().toISOString()
        };
        break;
      default:
        return { error: { message: 'Invalid action' } };
    }
    
    // Update the offer
    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', offerId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating offer:', error);
      return { error };
    }
    
    // Send notification to buyer
    try {
      // Get buyer email
      const { data: buyer } = await supabase
        .from('users')
        .select('email, username')
        .eq('id', offer.buyer_id)
        .single();
        
      if (buyer) {
        // Send email notification (implementation would go here)
        console.log(`Notification would be sent to ${buyer.email} about offer response`);
      }
    } catch (notifError) {
      console.error('Error sending offer notification:', notifError);
      // Don't fail the offer response if notification fails
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in respondToOffer:', error);
    return { error };
  }
};

/**
 * Fetch similar tools to the specified tool
 * @param {string} toolId - Current tool ID to exclude
 * @param {string} category - Category to match
 * @param {number} limit - Number of tools to fetch
 * @returns {Object} Array of similar tools or error
 */
export const fetchSimilarTools = async (toolId, category, limit = 3) => {
  try {
    console.log(`Fetching similar tools to ${toolId} in category: ${category}, limit: ${limit}`);
    
    // Use fetchTools but filter by category and exclude current tool
    const { data, error } = await supabase
      .from('tools')
      .select(`
        id,
        name,
        description,
        images,
        current_price,
        original_price,
        condition,
        category,
        subcategory,
        brand,
        is_verified,
        seller:seller_id(id, username, full_name, avatar_url, location, stripe_account_status)
      `)
      .eq('category', category)
      .neq('id', toolId)
      .eq('is_sold', false)
      .limit(limit);
    
    if (error) {
      console.error('Error fetching similar tools:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchSimilarTools:', error);
    return { error };
  }
};

/**
 * Fetch all listings for a specific user
 * @param {string} userId - User ID to fetch listings for
 * @param {Object} options - Optional filter/sort options
 * @returns {Object} Array of user's tool listings or error
 */
export const fetchUserListings = async (userId, options = {}) => {
  try {
    console.log(`Fetching listings for user ${userId}`);
    
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }
    
    // Use fetchTools with seller filter
    return await fetchTools({
      sellerId: userId,
      ...options
    });
  } catch (error) {
    console.error('Unexpected error in fetchUserListings:', error);
    return { error };
  }
};

/**
 * Fetch reviews for a specific user
 * @param {string} userId - User ID to fetch reviews for
 * @param {number} limit - Number of reviews to fetch
 * @returns {Object} Array of user reviews or error
 */
export const fetchUserReviews = async (userId, limit = 10) => {
  try {
    console.log(`Fetching reviews for user ${userId}`);
    
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        content,
        created_at,
        reviewer:reviewer_id(id, username, full_name, avatar_url)
      `)
      .eq('reviewed_user_id', userId) // Corrected to match the schema
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching user reviews:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error in fetchUserReviews:', error);
    return { error };
  }
};

//==============================================================================
// EXPORT ALL FUNCTIONS
//==============================================================================