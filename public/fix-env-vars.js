/**
 * Environment Variables Fix Script
 * 
 * This script provides a more reliable method to inject environment variables 
 * directly into the window object. Run this in the browser console to fix
 * environment variable issues.
 */

// Immediately execute to set environment variables
(function() {
  console.log('🔧 Fixing Benchlot environment variables...');
  
  // Create or update BENCHLOT_ENV
  window.BENCHLOT_ENV = {
    // Supabase Configuration
    SUPABASE_URL: 'https://tavhowcenicgowmdmbcz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc0ODYsImV4cCI6MjA1OTYyMzQ4Nn0.HcWzb8D9Jtq2CR-NJR2w8opgTDDM5n8TNeS1SyXXIXQ',
    
    // Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN',
    
    // URL Configuration 
    API_URL: window.location.origin,
    FRONTEND_URL: window.location.origin,
    
    // Version and Environment
    VERSION: '1.0.0',
    ENVIRONMENT: 'production',
    TIMESTAMP: new Date().toISOString()
  };
  
  // Also set in React App format
  window.REACT_APP_SUPABASE_URL = window.BENCHLOT_ENV.SUPABASE_URL;
  window.REACT_APP_SUPABASE_ANON_KEY = window.BENCHLOT_ENV.SUPABASE_ANON_KEY;
  window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY;
  window.REACT_APP_API_URL = window.BENCHLOT_ENV.API_URL;
  window.REACT_APP_FRONTEND_URL = window.BENCHLOT_ENV.FRONTEND_URL;
  
  console.log('✅ Environment variables fixed!');
  console.log('Environment:', window.BENCHLOT_ENV.ENVIRONMENT);
  console.log('Try refreshing the page to see if images now load correctly');
  
  // Return success message
  return {
    status: 'success',
    message: 'Environment variables fixed.',
    env: {
      supabaseUrl: window.BENCHLOT_ENV.SUPABASE_URL,
      apiUrl: window.BENCHLOT_ENV.API_URL
    }
  };
})();