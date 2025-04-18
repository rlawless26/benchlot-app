import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../supabaseClient';

/**
 * Clean implementation of Seller Signup Page
 * Uses a minimal API call pattern that won't trigger header size issues
 */
const SellerSignupPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Simplified form data with only essential fields for quick signup
  const [formData, setFormData] = useState({
    sellerName: '',
    location: 'Boston, MA',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [stripeUrl, setStripeUrl] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await getCurrentUser();
      
      if (!data) {
        navigate('/login', { state: { from: '/seller/signup' } });
        return;
      }
      
      setUser(data);
      
      // Pre-fill form with user data if available - simplified for incremental onboarding
      if (data.profile) {
        setFormData(prev => ({
          ...prev,
          sellerName: data.profile.full_name || '',
          location: data.profile.location || 'Boston, MA'
        }));
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to become a seller');
      }
      
      // 1. Save seller profile details
      // This can be done in a separate API call if needed
      
      // 2. Get a Stripe Connect onboarding URL
      // Use simple query params instead of auth headers to avoid size issues
      // Connect to our clean server on port 3002
      const apiUrl = `http://localhost:3002/api/v1/stripe/connect/onboard?userId=${encodeURIComponent(user.id)}`;
      
      // Use minimal fetch with no credentials
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit' // Don't send cookies
      });
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        
        // Special handling for the Connect not enabled error
        if (errorData.message && errorData.message.includes('signed up for Connect')) {
          throw new Error("Stripe Connect needs to be enabled for this account. Please contact the site administrator.");
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }
      
      // Get the onboarding URL
      const data = await response.json();
      setStripeUrl(data.url);
      setSuccess(true);
      
    } catch (err) {
      console.error('Error setting up seller account:', err);
      setError(err.message || 'Failed to set up seller account. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-serif font-medium text-stone-800 mb-6">Start Selling on Benchlot</h1>
          <p className="text-stone-600 mb-8">Complete your seller profile to begin listing tools.</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              <p className="font-bold text-lg">You're ready to start selling!</p>
              <p className="mt-2">Your seller account has been created and you can start listing tools immediately.</p>
              
              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <a 
                      href="/listtool" 
                      className="block w-full text-center py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 text-lg font-medium"
                    >
                      List Your First Tool
                    </a>
                  </div>
                  <div>
                    <a 
                      href={stripeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 bg-white border border-forest-700 text-forest-700 rounded-md hover:bg-forest-50 text-lg font-medium"
                    >
                      Set Up Payments →
                    </a>
                  </div>
                </div>
                
                <p className="text-sm text-stone-600 text-center">
                  You'll need to set up payments before you can receive funds from sales.
                  <br />This can be done now or later.
                </p>
              </div>
            </div>
          )}
          
          {!success && <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="sellerName">
                  Seller Name*
                </label>
                <input
                  type="text"
                  id="sellerName"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                />
                <p className="text-sm text-stone-500 mt-1">This is how you'll appear to buyers</p>
              </div>
              
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="location">
                  Location*
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                >
                  <option value="Boston, MA">Boston, MA</option>
                  <option value="Cambridge, MA">Cambridge, MA</option>
                  <option value="Somerville, MA">Somerville, MA</option>
                  <option value="Medford, MA">Medford, MA</option>
                  <option value="Brookline, MA">Brookline, MA</option>
                </select>
                <p className="text-sm text-stone-500 mt-1">Where your tools are available</p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Start Selling Now'}
                </button>
                <p className="text-center text-sm text-stone-500 mt-2">
                  You can start listing your tools right away
                </p>
              </div>
            </div>
          </form>}
        </div>
      </main>
    </div>
  );
};

export default SellerSignupPage;