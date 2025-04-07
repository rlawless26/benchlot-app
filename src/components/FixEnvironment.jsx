import React, { useEffect, useState } from 'react';
import { checkEnvironment, checkSupabaseConnection } from '../supabaseClient';

/**
 * A utility component that helps diagnose and fix environment issues
 */
const FixEnvironment = () => {
  const [envStatus, setEnvStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isFixed, setIsFixed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      
      // Run environment check
      const envCheck = checkEnvironment();
      setEnvStatus(envCheck);
      
      // Check Supabase connection
      const connStatus = await checkSupabaseConnection();
      setConnectionStatus(connStatus);
      
      setIsChecking(false);
    };
    
    checkStatus();
  }, [isFixed]);
  
  const fixEnvironment = () => {
    // Implement environment fix using the bootstrapper approach
    try {
      // Create the core bootstrapper config object
      window.__BENCHLOT_CORE_CONFIG = {
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
      
      // For local development, use the current origin
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.__BENCHLOT_CORE_CONFIG.API.URL = window.location.origin;
        window.__BENCHLOT_CORE_CONFIG.FRONTEND.URL = window.location.origin;
        window.__BENCHLOT_CORE_CONFIG.ENV = 'development';
      }
      
      // Populate BENCHLOT_ENV format (used by newer code)
      window.BENCHLOT_ENV = {
        SUPABASE_URL: window.__BENCHLOT_CORE_CONFIG.SUPABASE.URL,
        SUPABASE_ANON_KEY: window.__BENCHLOT_CORE_CONFIG.SUPABASE.ANON_KEY,
        STRIPE_PUBLISHABLE_KEY: window.__BENCHLOT_CORE_CONFIG.STRIPE.PUBLISHABLE_KEY,
        API_URL: window.__BENCHLOT_CORE_CONFIG.API.URL,
        FRONTEND_URL: window.__BENCHLOT_CORE_CONFIG.FRONTEND.URL,
        VERSION: window.__BENCHLOT_CORE_CONFIG.VERSION,
        ENVIRONMENT: window.__BENCHLOT_CORE_CONFIG.ENV,
        TIMESTAMP: window.__BENCHLOT_CORE_CONFIG.TIMESTAMP
      };
      
      // React App format (for backward compatibility)
      window.REACT_APP_SUPABASE_URL = window.__BENCHLOT_CORE_CONFIG.SUPABASE.URL;
      window.REACT_APP_SUPABASE_ANON_KEY = window.__BENCHLOT_CORE_CONFIG.SUPABASE.ANON_KEY;
      window.REACT_APP_STRIPE_PUBLISHABLE_KEY = window.__BENCHLOT_CORE_CONFIG.STRIPE.PUBLISHABLE_KEY;
      window.REACT_APP_API_URL = window.__BENCHLOT_CORE_CONFIG.API.URL;
      window.REACT_APP_FRONTEND_URL = window.__BENCHLOT_CORE_CONFIG.FRONTEND.URL;
      
      setIsFixed(true);
      
      // Show success message
      alert('Environment variables have been fixed. The page will now refresh to apply changes.');
      
      // Force reload to apply the new configuration
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error fixing environment:', error);
      alert('Failed to fix environment variables. See console for details.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-medium text-stone-800 mb-4">Environment Diagnostics</h2>
      
      {isChecking ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-forest-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Checking environment...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-lg mb-2 text-stone-700">Environment Status</h3>
              <div className={`p-4 rounded-md ${envStatus?.benchlot === 'Available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="font-medium">Runtime Environment: {envStatus?.benchlot === 'Available' ? 'Available ✓' : 'Missing ✗'}</p>
                <p>Supabase URL: {envStatus?.supabaseClient?.url !== 'Not available' ? 'Available ✓' : 'Missing ✗'}</p>
                <p>Supabase Key: {envStatus?.supabaseClient?.key !== 'Not available' ? 'Available ✓' : 'Missing ✗'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2 text-stone-700">Connection Status</h3>
              <div className={`p-4 rounded-md ${connectionStatus?.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="font-medium">
                  {connectionStatus?.success ? 'Connected to Supabase ✓' : 'Connection Failed ✗'}
                </p>
                {connectionStatus?.error && (
                  <p className="mt-2 text-sm">{connectionStatus.error}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-stone-200 pt-6">
            <h3 className="font-medium text-lg mb-4 text-stone-700">Potential Fixes</h3>
            
            {!connectionStatus?.success || envStatus?.benchlot !== 'Available' ? (
              <div className="mb-6">
                <p className="mb-3">The application environment appears to be misconfigured. Click the button below to attempt an automatic fix:</p>
                <button
                  onClick={fixEnvironment}
                  className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                >
                  Fix Environment Variables
                </button>
              </div>
            ) : (
              <p className="text-green-700">✓ Environment appears to be properly configured!</p>
            )}
            
            <div className="mt-6 text-sm text-stone-500">
              <p>If the automatic fix doesn't work, try these steps:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Clear your browser cache</li>
                <li>Ensure third-party cookies are enabled</li>
                <li>Try using a different browser</li>
                <li>Check your network connection</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FixEnvironment;