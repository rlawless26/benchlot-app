/**
 * Benchlot Core Configuration Bootstrapper
 * 
 * This script ensures critical configuration is ALWAYS available to the application,
 * regardless of environment variables or other scripts loading.
 * 
 * IMPORTANT: This must be the FIRST script loaded in any HTML file to guarantee
 * configuration is available before any application code runs.
 */

(function() {
  console.log('Initializing Benchlot Core Configuration Bootstrapper...');
  
  // HARDCODED FAILSAFE VALUES - these will always be available
  // These are the production values for Benchlot.com
  var CORE_CONFIG = {
    SUPABASE: {
      URL: 'https://tavhowcenicgowmdmbcz.supabase.co',
      ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc0ODYsImV4cCI6MjA1OTYyMzQ4Nn0.HcWzb8D9Jtq2CR-NJR2w8opgTDDM5n8TNeS1SyXXIXQ'
    },
    STRIPE: {
      PUBLISHABLE_KEY: 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN'
    },
    API: {
      URL: 'https://www.benchlot.com'
    },
    FRONTEND: {
      URL: 'https://www.benchlot.com'
    },
    ENV: 'production',
    VERSION: '1.0.0',
    TIMESTAMP: new Date().toISOString()
  };
  
  // For local development, use the current origin as API/Frontend URL
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CORE_CONFIG.API.URL = window.location.origin;
    CORE_CONFIG.FRONTEND.URL = window.location.origin;
    CORE_CONFIG.ENV = 'development';
    console.log('Development environment detected, using local URLs');
  }
  
  // Create global configuration object - guaranteed to be available
  window.__BENCHLOT_CORE_CONFIG = CORE_CONFIG;
  
  // Populate all expected variable patterns to ensure compatibility with existing code
  
  // BENCHLOT_ENV format (used by newer code)
  window.BENCHLOT_ENV = window.BENCHLOT_ENV || {
    SUPABASE_URL: CORE_CONFIG.SUPABASE.URL,
    SUPABASE_ANON_KEY: CORE_CONFIG.SUPABASE.ANON_KEY,
    STRIPE_PUBLISHABLE_KEY: CORE_CONFIG.STRIPE.PUBLISHABLE_KEY,
    API_URL: CORE_CONFIG.API.URL,
    FRONTEND_URL: CORE_CONFIG.FRONTEND.URL,
    VERSION: CORE_CONFIG.VERSION,
    ENVIRONMENT: CORE_CONFIG.ENV,
    TIMESTAMP: CORE_CONFIG.TIMESTAMP
  };
  
  // React App format (for backward compatibility)
  window.REACT_APP_SUPABASE_URL = window.REACT_APP_SUPABASE_URL || CORE_CONFIG.SUPABASE.URL;
  window.REACT_APP_SUPABASE_ANON_KEY = window.REACT_APP_SUPABASE_ANON_KEY || CORE_CONFIG.SUPABASE.ANON_KEY;
  window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.REACT_APP_STRIPE_PUBLISHABLE_KEY || CORE_CONFIG.STRIPE.PUBLISHABLE_KEY;
  window.REACT_APP_API_URL = window.REACT_APP_API_URL || CORE_CONFIG.API.URL;
  window.REACT_APP_FRONTEND_URL = window.REACT_APP_FRONTEND_URL || CORE_CONFIG.FRONTEND.URL;
  
  console.log('✅ BENCHLOT CORE CONFIG BOOTSTRAPPED');
  console.log('Environment:', CORE_CONFIG.ENV);
  console.log('Supabase URL configured:', CORE_CONFIG.SUPABASE.URL ? 'Yes' : 'No');
  console.log('API URL:', CORE_CONFIG.API.URL);
})();