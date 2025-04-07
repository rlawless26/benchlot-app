/**
 * Benchlot Runtime Environment Variables
 * 
 * This script sets environment variables directly in the window object,
 * making them available to the application even in production environments
 * where normal environment variable injection doesn't work.
 * 
 * These variables are loaded before the React application starts.
 */

(function() {
  console.log('Loading Benchlot environment variables...');
  
  // Create environment container
  window.BENCHLOT_ENV = {
    // Supabase Configuration
    SUPABASE_URL: 'https://tavhowcenicgowmdmbcz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDUyNzIsImV4cCI6MjA1NDgyMTI3Mn0.Mwp5XR3vuWB4hurNLvF-DoWzWxb4wSrp99qIhOqMEIA',
    
    // Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN',
    
    // URL Configuration
    API_URL: 'https://www.benchlot.com',
    FRONTEND_URL: 'https://www.benchlot.com',
    
    // Version and Environment
    VERSION: '1.0.0',
    ENVIRONMENT: 'production',
    TIMESTAMP: new Date().toISOString()
  };
  
  // Also set in React App format for backward compatibility
  window.REACT_APP_SUPABASE_URL = window.BENCHLOT_ENV.SUPABASE_URL;
  window.REACT_APP_SUPABASE_ANON_KEY = window.BENCHLOT_ENV.SUPABASE_ANON_KEY;
  window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY;
  window.REACT_APP_API_URL = window.BENCHLOT_ENV.API_URL;
  window.REACT_APP_FRONTEND_URL = window.BENCHLOT_ENV.FRONTEND_URL;
  
  console.log('Benchlot environment variables loaded successfully!');
  console.log('Environment:', window.BENCHLOT_ENV.ENVIRONMENT);
})();