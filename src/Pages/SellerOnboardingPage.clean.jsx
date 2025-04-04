import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../supabaseClient';

/**
 * Clean implementation of Seller Onboarding Page
 * Uses a minimal API call pattern that won't trigger header size issues
 */
const SellerOnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Check if this is a refresh from Stripe
  const isRefresh = new URLSearchParams(location.search).get('refresh') === 'true';

  // Get current user and check their Stripe account status
  useEffect(() => {
    const checkUserAndStatus = async () => {
      try {
        const { data } = await getCurrentUser();
        
        if (!data) {
          navigate('/login', { state: { from: '/seller/onboarding' } });
          return;
        }
        
        setUser(data);
        
        // Check account status using the clean endpoint with query parameters
        const statusUrl = `/api/v1/stripe/connect/status?userId=${encodeURIComponent(data.id)}`;
        
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'omit' // Don't send cookies
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to check account status: ${response.status}`);
        }
        
        const statusData = await response.json();
        setAccountStatus(statusData);
        
        // If account is active, redirect to dashboard
        if (statusData.status === 'active') {
          navigate('/seller/dashboard');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking account status:', err);
        setError(err.message || 'Failed to check account status. Please try again.');
        setLoading(false);
      }
    };
    
    checkUserAndStatus();
  }, [navigate]);
  
  // Handle refreshing the onboarding link
  const handleRefreshLink = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User information is missing');
      }
      
      // Get a new onboarding link using clean endpoint with query parameters
      const linkUrl = `/api/v1/stripe/connect/onboard?userId=${encodeURIComponent(user.id)}`;
      
      const response = await fetch(linkUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit' // Don't send cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to get onboarding link: ${response.status}`);
      }
      
      // Parse the JSON response to get the URL
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No Stripe URL returned');
      }
      
      // Open the Stripe URL in a new tab
      window.open(data.url, '_blank');
      setLoading(false);
      
    } catch (err) {
      console.error('Error refreshing onboarding link:', err);
      setError(err.message || 'Failed to refresh onboarding link. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-700"></div>
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-serif font-medium text-stone-800 mb-6">Complete Your Seller Onboarding</h1>
          
          {isRefresh && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6">
              Your Stripe session has expired. Please continue onboarding to complete your seller account setup.
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <p className="text-stone-600">
              To start selling on Benchlot, we need to set up your payment processing. This allows
              you to receive payments securely when your tools sell.
            </p>
            
            {accountStatus && !accountStatus.detailsSubmitted && (
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Complete Stripe Onboarding</h2>
                <p className="mb-4">You'll need to complete the following steps:</p>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  <li>Verify your identity</li>
                  <li>Connect a bank account</li>
                  <li>Provide business information (if applicable)</li>
                </ul>
                <p className="mb-6">This information is securely handled by Stripe, our payment processor.</p>
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                >
                  Continue Onboarding
                </button>
              </div>
            )}
            
            {accountStatus && accountStatus.detailsSubmitted && !accountStatus.payoutsEnabled && (
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Onboarding in Progress</h2>
                <p className="mb-4">
                  Thanks for submitting your information! Stripe is currently reviewing your account.
                  This usually takes 1-2 business days.
                </p>
                <p className="mb-6">
                  We'll notify you when your account is ready to start accepting payments.
                </p>
                
                {/* Adding a refresh button for convenience */}
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                >
                  Check Status Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerOnboardingPage;