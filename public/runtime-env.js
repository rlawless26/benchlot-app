/**
 * Benchlot Runtime Environment Variables
 * 
 * This script sets environment variables directly in the window object,
 * making them available to the application even in production environments
 * where normal environment variable injection doesn't work.
 * 
 * NOTE: The bootstrapper.js script should have already run and set up
 * the basic environment variables. This script ensures compatibility
 * and provides additional configuration.
 */

(function() {
  console.log('Loading Benchlot runtime environment variables...');
  
  // Only set variables if not already defined by bootstrapper.js
  if (!window.__BENCHLOT_CORE_CONFIG) {
    console.warn('Core config not found - bootstrapper.js may not have loaded correctly');
  }
  
  // Get values from core config if available, otherwise use defaults
  const core = window.__BENCHLOT_CORE_CONFIG || {};
  const supabaseUrl = (core.SUPABASE && core.SUPABASE.URL) || 'https://tavhowcenicgowmdmbcz.supabase.co';
  const supabaseKey = (core.SUPABASE && core.SUPABASE.ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc0ODYsImV4cCI6MjA1OTYyMzQ4Nn0.HcWzb8D9Jtq2CR-NJR2w8opgTDDM5n8TNeS1SyXXIXQ';
  const stripeKey = (core.STRIPE && core.STRIPE.PUBLISHABLE_KEY) || 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN';
  const apiUrl = (core.API && core.API.URL) || 'https://www.benchlot.com';
  const frontendUrl = (core.FRONTEND && core.FRONTEND.URL) || 'https://www.benchlot.com';
  
  // Create or update environment container
  window.BENCHLOT_ENV = window.BENCHLOT_ENV || {
    // Supabase Configuration
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseKey,
    
    // Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: stripeKey,
    
    // URL Configuration
    API_URL: apiUrl,
    FRONTEND_URL: frontendUrl,
    
    // Version and Environment
    VERSION: '1.0.0',
    ENVIRONMENT: core.ENV || 'production',
    TIMESTAMP: new Date().toISOString()
  };
  
  // Also set in React App format for backward compatibility
  window.REACT_APP_SUPABASE_URL = window.REACT_APP_SUPABASE_URL || window.BENCHLOT_ENV.SUPABASE_URL;
  window.REACT_APP_SUPABASE_ANON_KEY = window.REACT_APP_SUPABASE_ANON_KEY || window.BENCHLOT_ENV.SUPABASE_ANON_KEY;
  window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.REACT_APP_STRIPE_PUBLISHABLE_KEY || window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY;
  window.REACT_APP_API_URL = window.REACT_APP_API_URL || window.BENCHLOT_ENV.API_URL;
  window.REACT_APP_FRONTEND_URL = window.REACT_APP_FRONTEND_URL || window.BENCHLOT_ENV.FRONTEND_URL;
  
  console.log('Benchlot runtime environment variables loaded successfully!');
  console.log('Environment:', window.BENCHLOT_ENV.ENVIRONMENT);
})();