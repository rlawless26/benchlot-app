import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  DollarSign,
  Package,
  Scroll,
  ShoppingCart,
  Truck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Hammer,
  Loader
} from 'lucide-react';

// Import supabase client
import { getCurrentUser, supabase } from '../supabaseClient';

// Import components
import MyListings from '../components/MyListings';

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  
  // States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    viewsThisMonth: 0
  });
  const [sellerStatus, setSellerStatus] = useState({
    stripeStatus: 'minimal',
    payoutsEnabled: false,
    requiresAttention: false
  });
  const [isFixingStatus, setIsFixingStatus] = useState(false);
  const [statusFixed, setStatusFixed] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await getCurrentUser();
      
      if (!data) {
        navigate('/login', { state: { from: '/seller/dashboard' } });
        return;
      }
      
      // Debug user profile data
      console.log('User profile in dashboard:', data.profile);
      
      setUser(data);
      
      // Set seller status based on profile data
      if (data.profile) {
        setSellerStatus({
          stripeStatus: data.profile.stripe_account_status || 'minimal',
          payoutsEnabled: data.profile.stripe_account_status === 'active',
          requiresAttention: data.profile.verification_requirements?.currently_due?.length > 0,
          is_seller: data.profile.is_seller
        });
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);
  
  // Handler for fixing seller status
  const handleFixSellerStatus = async () => {
    setIsFixingStatus(true);
    
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ is_seller: true })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Updated user:', updatedUser);
      setSellerStatus(prev => ({
        ...prev,
        is_seller: true
      }));
      setStatusFixed(true);
      
      // Update the user object in session
      const { data } = await getCurrentUser();
      setUser(data);
      
      // Delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error fixing seller status:', error);
    } finally {
      setIsFixingStatus(false);
    }
  };
  
  // Update stats
  const updateStats = (newStats) => {
    setStats(prev => ({
      ...prev,
      ...newStats
    }));
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-700"></div>
            <span className="ml-2 text-stone-600">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium text-stone-800">Seller Dashboard</h1>
            <p className="text-stone-600">Manage your tool listings and sales</p>
          </div>
          
          <div className="flex gap-4">
            <Link
              to="/listtool"
              className="inline-flex items-center px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-md"
            >
              <Hammer className="h-5 w-5 mr-2" />
              List a New Tool
            </Link>
          </div>
        </div>
        
        {/* Status alert if seller account needs attention */}
        {sellerStatus.requiresAttention && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-8 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Account Verification Required</h3>
              <p className="text-amber-700 mt-1">
                Your seller account needs additional information to enable payouts.
              </p>
              <a
                href="/seller/onboarding"
                className="mt-3 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Complete verification <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        )}
        
        {/* Missing is_seller flag alert */}
        {user.profile && !user.profile.is_seller && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-8 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Seller Status Issue Detected</h3>
              <p className="text-amber-700 mt-1">
                Your account is missing the seller flag. This might cause issues with navigation and selling tools.
              </p>
              {!statusFixed ? (
                <button
                  onClick={handleFixSellerStatus}
                  disabled={isFixingStatus}
                  className="mt-3 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
                >
                  {isFixingStatus ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Fixing status...
                    </>
                  ) : (
                    <>
                      Fix seller status <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-3 inline-flex items-center text-sm font-medium text-green-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Status fixed! Reloading...
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-forest-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Active Listings</h3>
            </div>
            <p className="text-3xl font-medium">{stats.activeListings}</p>
            <Link
              to="/seller/listings"
              className="mt-4 text-sm text-forest-700 hover:text-forest-800 inline-flex items-center"
            >
              View all listings <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-forest-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Pending Orders</h3>
            </div>
            <p className="text-3xl font-medium">{stats.pendingOrders}</p>
            <Link
              to="/seller/orders"
              className="mt-4 text-sm text-forest-700 hover:text-forest-800 inline-flex items-center"
            >
              View orders <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-forest-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Total Earnings</h3>
            </div>
            <p className="text-3xl font-medium">${stats.totalEarnings.toFixed(2)}</p>
            <Link
              to="/seller/earnings"
              className="mt-4 text-sm text-forest-700 hover:text-forest-800 inline-flex items-center"
            >
              View earnings <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-forest-100 p-3 rounded-full mr-4">
                <BarChart3 className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Views This Month</h3>
            </div>
            <p className="text-3xl font-medium">{stats.viewsThisMonth}</p>
            <Link
              to="/seller/analytics"
              className="mt-4 text-sm text-forest-700 hover:text-forest-800 inline-flex items-center"
            >
              View analytics <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* My Listings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <MyListings />
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;