import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  Loader,
  User,
  ShieldCheck
} from 'lucide-react';
import Header from '../header';
import { supabase } from '../supabaseClient';

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Check if user is logged in
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login?redirect=/become-seller');
          return;
        }
        
        setUser(user);
        
        // Check if user already has a Stripe account
        const { data: profile } = await supabase
          .from('users')
          .select('stripe_account_id, stripe_account_status')
          .eq('id', user.id)
          .single();
          
        if (profile?.stripe_account_id) {
          await checkAccountStatus(user.id);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setError('An error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [navigate]);
  
  // Check on page load if returning from Stripe
  useEffect(() => {
    const checkOnboarding = async () => {
      const queryParams = new URLSearchParams(location.search);
      const isCompleted = queryParams.get('completed') === 'true';
      const needsRefresh = queryParams.get('refresh') === 'true';
      
      if (isCompleted && user) {
        // Check account status after return from Stripe
        await checkAccountStatus(user.id);
        
        // Remove query parameters from URL
        navigate('/become-seller', { replace: true });
      } else if (needsRefresh && user) {
        // User returned because of an expired link, show them a new one
        setError('Your previous session expired. Please try connecting again.');
        navigate('/become-seller', { replace: true });
      }
    };
    
    if (!loading) {
      checkOnboarding();
    }
  }, [loading, user, location, navigate]);
  
  // Check Stripe account status
  const checkAccountStatus = async (userId) => {
    try {
      const response = await fetch(`/api/stripe/connect-account-status/${userId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAccountStatus(data);
      
      // Update seller status in database if verified
      if (data.status === 'verified' && user) {
        await supabase
          .from('users')
          .update({ 
            stripe_account_status: 'verified',
            is_seller: true
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      setError('Failed to check your seller account status. Please try again.');
    }
  };
  
  // Create or connect Stripe account
  const connectStripeAccount = async () => {
    try {
      setStripeLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          refreshUrl: `${window.location.origin}/become-seller?refresh=true`,
          returnUrl: `${window.location.origin}/become-seller?completed=true`
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Redirect to Stripe's hosted onboarding flow
      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      setError('Failed to connect with Stripe. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-base min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-medium mb-6">Become a Seller</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Account status indicator */}
        {accountStatus && (
          <div className={`rounded-lg p-4 mb-6 flex items-start ${
            accountStatus.status === 'verified' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            {accountStatus.status === 'verified' ? (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            
            <div>
              <p className="font-medium">
                {accountStatus.status === 'verified' 
                  ? 'Your seller account is active!' 
                  : 'Your seller account needs attention'}
              </p>
              <p className="mt-1">
                {accountStatus.status === 'verified' 
                  ? 'You can now list tools and receive payments.' 
                  : 'Please complete your Stripe onboarding to start selling.'}
              </p>
              
              {accountStatus.status !== 'verified' && (
                <button
                  onClick={connectStripeAccount}
                  className="mt-3 px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 inline-flex items-center"
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Complete Onboarding
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-stone-200">
            <h2 className="text-xl font-medium mb-2">Seller Benefits</h2>
            <p className="text-stone-600">
              Join our community of tool sellers and start earning from your unused tools.
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="h-6 w-6 text-forest-700" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Earn Money</h3>
                  <p className="text-stone-600">
                    Turn your unused tools into cash. Our sellers earn an average of $750 in their first month.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mr-4">
                  <ShieldCheck className="h-6 w-6 text-forest-700" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Safe Transactions</h3>
                  <p className="text-stone-600">
                    Secure payments through Stripe, protection against fraud, and verification of buyers.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-forest-700" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Reach More Buyers</h3>
                  <p className="text-stone-600">
                    Access our growing community of tool enthusiasts, professionals, and DIYers.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-forest-700" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Fast Payouts</h3>
                  <p className="text-stone-600">
                    Get paid quickly with direct deposits to your bank account after a sale is completed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-2">How It Works</h3>
              <ol className="list-decimal pl-5 space-y-2 text-stone-600">
                <li>Connect your Stripe account to receive payments securely.</li>
                <li>List your tools with photos, descriptions, and pricing.</li>
                <li>Receive offers and orders from interested buyers.</li>
                <li>Ship or coordinate local pickup for your tools.</li>
                <li>Get paid directly to your bank account.</li>
              </ol>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-2">Fees</h3>
              <p className="text-stone-600 mb-2">
                Benchlot charges a simple fee structure:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>5% platform fee on each transaction</li>
                <li>3% payment processing fee (standard Stripe fee)</li>
                <li>You receive 92% of each sale</li>
              </ul>
            </div>
            
            {accountStatus?.status === 'verified' ? (
              <div className="mt-8 text-center">
                <p className="text-green-700 font-medium mb-4">You're all set to start selling!</p>
                <button
                  onClick={() => navigate('/listtool')}
                  className="px-6 py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 inline-flex items-center"
                >
                  List Your First Tool
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <button
                  onClick={connectStripeAccount}
                  className="px-6 py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 inline-flex items-center"
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect with Stripe
                    </>
                  )}
                </button>
                
                <p className="mt-4 text-sm text-stone-500">
                  You'll be redirected to Stripe to complete your seller account setup.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;