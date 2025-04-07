// Runtime environment variables for Benchlot application
// This helps overcome issues with environment variables in Vercel
window.BENCHLOT_ENV = {
  SUPABASE_URL: 'https://tavhowcenicgowmdmbcz.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2Nlbmljb3N3bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA1NDA0MzgsImV4cCI6MTk4NjExNjQzOH0.uUF9zwzV1t9qUKl3aEUfRvRTgyPGSWLsJcXZt5EnRCM',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51P29RaPR4wII8V1WXoTNVpd1yb75ZfGRYawssFvs3CMVW1J7g3CL8gqiIDnOZJFJgGYb9T1CXGPQGppnqeU28wBz00qoZ31GRN',
  API_URL: 'https://www.benchlot.com',
  FRONTEND_URL: 'https://www.benchlot.com'
};

// Also set React variables format for backward compatibility
window.REACT_APP_SUPABASE_URL = window.BENCHLOT_ENV.SUPABASE_URL;
window.REACT_APP_SUPABASE_ANON_KEY = window.BENCHLOT_ENV.SUPABASE_ANON_KEY;
window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.BENCHLOT_ENV.STRIPE_PUBLISHABLE_KEY;
window.REACT_APP_API_URL = window.BENCHLOT_ENV.API_URL;
window.REACT_APP_FRONTEND_URL = window.BENCHLOT_ENV.FRONTEND_URL;