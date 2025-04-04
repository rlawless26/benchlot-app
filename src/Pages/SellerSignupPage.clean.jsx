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
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerBio: '',
    location: 'Boston, MA',
    contactEmail: '',
    contactPhone: '',
    sellerType: 'individual'
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
      
      // Pre-fill form with user data if available
      if (data.profile) {
        setFormData(prev => ({
          ...prev,
          sellerName: data.profile.full_name || '',
          contactEmail: data.email || '',
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
      const apiUrl = `/api/v1/stripe/connect/onboard?userId=${encodeURIComponent(user.id)}`;
      
      // Use minimal fetch with no credentials
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit' // Don't send cookies
      });
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
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
              <p className="font-bold text-lg">Your seller account has been created!</p>
              <p className="mt-2">To complete your onboarding, please click the button below:</p>
              
              <div className="mt-6 text-center">
                <a 
                  href={stripeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-forest-700 text-white px-6 py-3 rounded-md hover:bg-forest-800 text-lg font-medium"
                >
                  Continue to Stripe Connect Setup →
                </a>
                
                <p className="mt-4 text-sm text-stone-600">
                  This will open a secure Stripe page where you can complete your seller verification.
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
                <label className="block text-stone-700 font-medium mb-1" htmlFor="sellerType">
                  Seller Type*
                </label>
                <select
                  id="sellerType"
                  name="sellerType"
                  value={formData.sellerType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </div>
              
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="sellerBio">
                  About You
                </label>
                <textarea
                  id="sellerBio"
                  name="sellerBio"
                  value={formData.sellerBio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  rows="4"
                ></textarea>
                <p className="text-sm text-stone-500 mt-1">Tell buyers about yourself and your tools</p>
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
              </div>
              
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="contactEmail">
                  Contact Email*
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="contactPhone">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                />
                <p className="text-sm text-stone-500 mt-1">Optional, but helps with local pickup</p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Start Selling'}
                </button>
              </div>
            </div>
          </form>}
        </div>
      </main>
    </div>
  );
};

export default SellerSignupPage;