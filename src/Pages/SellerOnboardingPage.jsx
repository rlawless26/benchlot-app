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
  const [requirements, setRequirements] = useState(null);
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
        // Connect to our clean server on port 3002
        const statusUrl = `http://localhost:3002/api/v1/stripe/connect/status?userId=${encodeURIComponent(data.id)}`;
        
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
        
        // If account is fully active, redirect to dashboard
        if (statusData.status === 'active') {
          navigate('/seller/dashboard');
        }
        
        // Fetch more detailed requirements information
        const reqUrl = `http://localhost:3002/api/v1/stripe/connect/requirements?userId=${encodeURIComponent(data.id)}`;
        
        const reqResponse = await fetch(reqUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'omit'
        });
        
        if (reqResponse.ok) {
          const requirementsData = await reqResponse.json();
          setRequirements(requirementsData);
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
      // Connect to our clean server on port 3002
      const linkUrl = `http://localhost:3002/api/v1/stripe/connect/onboard?userId=${encodeURIComponent(user.id)}`;
      
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
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">
                You're already set up to start selling on Benchlot! 
                {accountStatus && !accountStatus.payoutsEnabled && 
                  ' Additional verification is needed to receive payments.'}
              </p>
            </div>
            
            <p className="text-stone-600">
              Benchlot uses Stripe to handle secure payments. You can start listing tools immediately, but
              you'll need to complete verification before you can receive payments from sales.
            </p>
            
            {/* For accounts that need currently due requirements */}
            {requirements && requirements.requirements?.currently_due?.length > 0 && (
              <div className="bg-white border border-stone-200 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Required to Receive Payments</h2>
                <p className="mb-4">Please complete these required steps:</p>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  {requirements.requirements.currently_due.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                >
                  Complete Required Information
                </button>
              </div>
            )}
            
            {/* For accounts with eventually due requirements */}
            {requirements && requirements.requirements?.eventually_due?.length > 0 && (
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Eventually Needed (Not Urgent)</h2>
                <p className="mb-4">You can provide these details later:</p>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  {requirements.requirements.eventually_due.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
                <p className="text-sm text-stone-500 mb-4">
                  This information isn't required to start selling, but will be needed eventually.
                </p>
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-stone-300 text-stone-700 rounded-md hover:bg-stone-400 font-medium"
                >
                  Complete Additional Information
                </button>
              </div>
            )}
            
            {/* For accounts with pending verification */}
            {requirements && requirements.requirements?.pending_verification?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-medium text-yellow-800 mb-4">Verification in Progress</h2>
                <p className="mb-4">Stripe is currently reviewing:</p>
                <ul className="list-disc pl-5 mb-6 space-y-2 text-yellow-800">
                  {requirements.requirements.pending_verification.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
                <p className="mb-4">
                  This usually takes 1-2 business days. We'll notify you when verification is complete.
                </p>
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-200 font-medium"
                >
                  Check Status Again
                </button>
              </div>
            )}
            
            {/* When all requirements are complete but payouts aren't enabled yet */}
            {accountStatus && accountStatus.detailsSubmitted && !accountStatus.payoutsEnabled && 
             requirements && requirements.requirements?.currently_due?.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-blue-800 mb-4">Almost Done!</h2>
                <p className="mb-4">
                  Thanks for submitting your information! Your account is being activated.
                  This usually takes 1-2 business days.
                </p>
                <p className="mb-6">
                  You can continue selling while we wait for activation to complete.
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleRefreshLink}
                    className="w-1/2 py-3 bg-blue-100 text-blue-800 border border-blue-300 rounded-md hover:bg-blue-200 font-medium"
                  >
                    Check Status Again
                  </button>
                  <a 
                    href="/listtool"
                    className="block w-1/2 text-center py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                  >
                    List a Tool
                  </a>
                </div>
              </div>
            )}
            
            {/* If no status data is available yet */}
            {!requirements && !accountStatus && (
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Complete Your Verification</h2>
                <p className="mb-4">You need to set up payment processing to receive payouts from your sales.</p>
                <button 
                  onClick={handleRefreshLink}
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                >
                  Set Up Payments
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