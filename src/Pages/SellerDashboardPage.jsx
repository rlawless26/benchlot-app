import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../supabaseClient';


const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    soldItems: 0,
    pendingPayouts: 0,
    totalEarnings: 0
  });
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);

  // Get current user and seller data
  useEffect(() => {
    const loadSellerData = async () => {
      try {
        const { data } = await getCurrentUser();
        
        if (!data) {
          navigate('/login', { state: { from: '/seller/dashboard' } });
          return;
        }
        
        setUser(data);
        
        // Check Stripe account status
        const response = await fetch(`/api/stripe/connect/account-status/${data.id}`);
        const statusData = await response.json();
        
        if (!response.ok) {
          throw new Error(statusData.error || 'Failed to check seller account status');
        }
        
        setAccountStatus(statusData);
        
        // If account is not active yet, redirect to onboarding
        if (statusData.status !== 'active') {
          navigate('/seller/onboarding');
          return;
        }
        
        // Fetch seller stats (listings, sales, etc.)
        // This would be a call to your API to get this data
        // For now, just using placeholder data
        setStats({
          activeListings: 0,
          soldItems: 0,
          pendingPayouts: 0,
          totalEarnings: 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading seller data:', err);
        setError(err.message || 'Failed to load seller data. Please try again.');
        setLoading(false);
      }
    };
    
    loadSellerData();
  }, [navigate]);

  // Go to Stripe dashboard
  const goToStripeDashboard = async () => {
    try {
      const response = await fetch(`/api/stripe/connect/dashboard-link/${user.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get dashboard link');
      }
      
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error accessing Stripe dashboard:', err);
      setError(err.message || 'Failed to access Stripe dashboard. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
    
        <main className="max-w-6xl mx-auto px-4 py-8">
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

      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-medium text-stone-800">Seller Dashboard</h1>
          
          <div className="flex gap-4">
            <button
              onClick={goToStripeDashboard}
              className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50"
            >
              Stripe Dashboard
            </button>
            
            <Link
              to="/listtool"
              className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
            >
              List a Tool
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-stone-500 mb-1">Active Listings</p>
            <p className="text-3xl font-medium">{stats.activeListings}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-stone-500 mb-1">Sold Items</p>
            <p className="text-3xl font-medium">{stats.soldItems}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-stone-500 mb-1">Pending Payouts</p>
            <p className="text-3xl font-medium">${stats.pendingPayouts.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-stone-500 mb-1">Total Earnings</p>
            <p className="text-3xl font-medium">${stats.totalEarnings.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Get Started Section (if no listings) */}
        {stats.activeListings === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-medium mb-4">Get Started Selling</h2>
            <p className="mb-6">You don't have any active listings yet. Start by listing your first tool!</p>
            
            <Link
              to="/listtool"
              className="px-6 py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 inline-block"
            >
              Create Your First Listing
            </Link>
          </div>
        )}
        
        {/* Listings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-medium mb-6">Your Listings</h2>
          
          {stats.activeListings === 0 ? (
            <p className="text-stone-500 text-center py-8">You don't have any listings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tool</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Listed Date</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* You would map through seller listings here */}
                  <tr className="text-stone-500 text-center">
                    <td colSpan="5" className="py-4">No data to display</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;