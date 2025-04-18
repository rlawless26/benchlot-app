/**
 * Centralized configuration module for Benchlot
 * 
 * This module provides a single source of truth for all configuration 
 * values and handles environment variables in a robust way that works 
 * in both development and production environments.
 * 
 * NOTE: The bootstrapper.js script should have already set up
 * window.__BENCHLOT_CORE_CONFIG with guaranteed values.
 */

// Check for global core config (which should be set by bootstrapper.js)
const CORE_CONFIG = (typeof window !== 'undefined' && window.__BENCHLOT_CORE_CONFIG) ? 
  window.__BENCHLOT_CORE_CONFIG : null;

// Default values - only used if both bootstrapper and environment variables fail
const DEFAULT_CONFIG = {
  supabase: {
    url: CORE_CONFIG ? CORE_CONFIG.SUPABASE.URL : 'https://tavhowcenicgowmdmbcz.supabase.co',
    anonKey: CORE_CONFIG ? CORE_CONFIG.SUPABASE.ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc0ODYsImV4cCI6MjA1OTYyMzQ4Nn0.HcWzb8D9Jtq2CR-NJR2w8opgTDDM5n8TNeS1SyXXIXQ'
  },
  stripe: {
    publishableKey: CORE_CONFIG ? CORE_CONFIG.STRIPE.PUBLISHABLE_KEY : 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN'
  },
  urls: {
    api: CORE_CONFIG ? CORE_CONFIG.API.URL : 'https://www.benchlot.com',
    frontend: CORE_CONFIG ? CORE_CONFIG.FRONTEND.URL : 'https://www.benchlot.com'
  },
  environment: CORE_CONFIG ? CORE_CONFIG.ENV : (process.env.NODE_ENV || 'production')
};

/**
 * Load environment variables from all possible sources
 * - Create React App env vars (process.env.REACT_APP_*)
 * - Runtime window.REACT_APP_* vars
 * - Deployed env.js (window.BENCHLOT_ENV)
 */
function loadEnvironmentVariables() {
  const config = { ...DEFAULT_CONFIG };
  
  // Log loading status to help with debugging
  console.log(`[Benchlot Config] Loading environment variables in ${DEFAULT_CONFIG.environment} mode`);
  
  // Try React env vars from process.env (will work in development)
  if (process.env.REACT_APP_SUPABASE_URL) {
    config.supabase.url = process.env.REACT_APP_SUPABASE_URL;
    console.log('[Benchlot Config] Using Supabase URL from process.env.REACT_APP_SUPABASE_URL');
  }
  
  if (process.env.REACT_APP_SUPABASE_ANON_KEY) {
    config.supabase.anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    console.log('[Benchlot Config] Using Supabase key from process.env.REACT_APP_SUPABASE_ANON_KEY');
  }
  
  if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    config.stripe.publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    console.log('[Benchlot Config] Using Stripe key from process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY');
  }
  
  if (process.env.REACT_APP_API_URL) {
    config.urls.api = process.env.REACT_APP_API_URL;
    console.log('[Benchlot Config] Using API URL from process.env.REACT_APP_API_URL');
  }
  
  if (process.env.REACT_APP_FRONTEND_URL) {
    config.urls.frontend = process.env.REACT_APP_FRONTEND_URL;
    console.log('[Benchlot Config] Using frontend URL from process.env.REACT_APP_FRONTEND_URL');
  }
  
  // Try window.REACT_APP_* variables (useful in some production builds)
  if (typeof window !== 'undefined') {
    if (window.REACT_APP_SUPABASE_URL) {
      config.supabase.url = window.REACT_APP_SUPABASE_URL;
      console.log('[Benchlot Config] Using Supabase URL from window.REACT_APP_SUPABASE_URL');
    }
    
    if (window.REACT_APP_SUPABASE_ANON_KEY) {
      config.supabase.anonKey = window.REACT_APP_SUPABASE_ANON_KEY;
      console.log('[Benchlot Config] Using Supabase key from window.REACT_APP_SUPABASE_ANON_KEY');
    }
    
    if (window.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
      config.stripe.publishableKey = window.REACT_APP_STRIPE_PUBLISHABLE_KEY;
      console.log('[Benchlot Config] Using Stripe key from window.REACT_APP_STRIPE_PUBLISHABLE_KEY');
    }
    
    if (window.REACT_APP_API_URL) {
      config.urls.api = window.REACT_APP_API_URL;
      console.log('[Benchlot Config] Using API URL from window.REACT_APP_API_URL');
    }
    
    if (window.REACT_APP_FRONTEND_URL) {
      config.urls.frontend = window.REACT_APP_FRONTEND_URL;
      console.log('[Benchlot Config] Using frontend URL from window.REACT_APP_FRONTEND_URL');
    }
    
    // Try BENCHLOT_ENV if available (our special production fallback)
    if (window.BENCHLOT_ENV) {
      if (window.BENCHLOT_ENV.SUPABASE_URL) {
        config.supabase.url = window.BENCHLOT_ENV.SUPABASE_URL;
        console.log('[Benchlot Config] Using Supabase URL from window.BENCHLOT_ENV');
      }
      
      if (window.BENCHLOT_ENV.SUPABASE_ANON_KEY) {
        config.supabase.anonKey = window.BENCHLOT_ENV.SUPABASE_ANON_KEY;
        console.log('[Benchlot Config] Using Supabase key from window.BENCHLOT_ENV');
      }
      
      if (window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY) {
        config.stripe.publishableKey = window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY;
        console.log('[Benchlot Config] Using Stripe key from window.BENCHLOT_ENV');
      }
      
      if (window.BENCHLOT_ENV.API_URL) {
        config.urls.api = window.BENCHLOT_ENV.API_URL;
        console.log('[Benchlot Config] Using API URL from window.BENCHLOT_ENV');
      }
      
      if (window.BENCHLOT_ENV.FRONTEND_URL) {
        config.urls.frontend = window.BENCHLOT_ENV.FRONTEND_URL;
        console.log('[Benchlot Config] Using frontend URL from window.BENCHLOT_ENV');
      }
    }
  }
  
  // Final validation check
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('[Benchlot Config] WARNING: Supabase credentials not properly loaded, using defaults');
  }
  
  return config;
}

// Export the configuration
const config = loadEnvironmentVariables();

export default config;