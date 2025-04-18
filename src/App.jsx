// src/App.js
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Import Layout component
import Layout from './components/Layout';

// Import custom cart components
import { CartProvider } from './components/CartContext';
import CartPage from './Pages/CartPage.jsx';
import CheckoutPage from './Pages/CheckoutPage.jsx';

// Import existing pages
import LandingPage from './Pages/benchlot-component.jsx';
import SurveyPage from './Pages/SurveyComponent.jsx';
import ProductPage from './Pages/ProductPage.jsx';
import LandingPage2 from './Pages/LandingPage.jsx';
import MarketplacePage from './Pages/MarketplacePage';
import ToolDetailPage from './Pages/ToolDetailPage';
import ToolListingForm from './components/ToolListingForm';
import UserProfile from './components/UserProfile';
import AuthPage from './Pages/AuthPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import AboutPage from './Pages/AboutPage';
import MyListings from './components/MyListings';
import AdminFeaturedTools from './components/AdminFeaturedTools';
import HelpPage from './Pages/HelpPage';
import Wishlist from './components/Wishlist';
import Messages from './components/Messages';
import SettingsPage from './Pages/SettingsPage';
import CategoriesPage from './Pages/CategoriesPage';
import SellerOnboarding from './components/SellerOnboarding';
import SellerSignupPage from './Pages/SellerSignupPage';
import SellerOnboardingPage from './Pages/SellerOnboardingPage';
import SellerDashboardPage from './Pages/SellerDashboardPage';
import SellerOrdersPage from './Pages/SellerOrdersPage';
import SellerEarningsPage from './Pages/SellerEarningsPage';
import SellerAnalyticsPage from './Pages/SellerAnalyticsPage';
import DiagnosticsPage from './Pages/DiagnosticsPage';

const ProtectedRoute = ({ element }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (!session) return <Navigate to="/login" replace />;
  
  return element;
};

const AdminRoute = ({ element }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get the current user session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setDebugInfo('No authenticated user found');
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        setDebugInfo(`Auth user ID: ${user.id}`);
        
        // Get the user's role from the users table
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          setDebugInfo(`Error fetching user role: ${error.message}`);
        } else {
          setDebugInfo(`User role: ${data?.role || 'no role found'}`);
        }
        
        // Set isAdmin based on the user's role
        setIsAdmin(data?.role === 'admin');
      } catch (err) {
        setDebugInfo(`Unexpected error: ${err.message}`);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4">You do not have permission to access this page.</p>
        <div className="mt-8 p-4 bg-gray-100 rounded text-left">
          <h2 className="font-bold">Debug information:</h2>
          <pre className="mt-2 text-sm">{debugInfo}</pre>
        </div>
      </div>
    );
  }
  
  return element;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on page load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  
  return (
    <CartProvider>
    <Routes>
      {/* Routes that use the Layout (Header + Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage2 />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/tool/:id" element={<ToolDetailPage />} />
        <Route path="/listtool" element={<ToolListingForm />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/wishlist"
          element={<ProtectedRoute element={<Wishlist />} />}
        />
        <Route
          path="/seller/listings"
          element={<ProtectedRoute element={<MyListings />} />}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<SettingsPage />} />}
        />
        <Route
          path="/messages"
          element={<ProtectedRoute element={<Messages />} />}
        />
        {/* Cart and Checkout Routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route 
          path="/checkout" 
          element={<ProtectedRoute element={<CheckoutPage />} />} 
        />
<Route path="/become-seller" element={<SellerOnboarding />} />
<Route path="/seller/signup" element={<SellerSignupPage />} />
<Route path="/seller/onboarding" element={<SellerOnboardingPage />} />
<Route path="/seller/dashboard" element={<SellerDashboardPage />} />
<Route path="/seller/orders" element={<ProtectedRoute element={<SellerOrdersPage />} />} />
<Route path="/seller/earnings" element={<ProtectedRoute element={<SellerEarningsPage />} />} />
<Route path="/seller/analytics" element={<ProtectedRoute element={<SellerAnalyticsPage />} />} />
      </Route>

      {/* Routes that don't use the global Layout */}
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/2" element={<LandingPage />} />
      <Route path="/diagnostics" element={<DiagnosticsPage />} />
     
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute
            element={
              <div className="min-h-screen bg-stone-50">
                <header className="bg-white border-b py-4 px-6">
                  <h1 className="text-2xl font-serif">Benchlot Admin</h1>
                </header>

                {/* Admin Dashboard */}
                <div className="p-6">
                  <h2 className="text-xl font-medium mb-4">Admin Dashboard</h2>
                  <nav className="mb-8">
                    <ul className="flex gap-4">
                      <li>
                        <a href="/admin/featured-tools" className="text-forest-700 hover:underline">
                          Featured Tools
                        </a>
                      </li>
                      {/* Add more admin nav links here */}
                    </ul>
                  </nav>

                  <p>Select an option from the menu above.</p>
                </div>
              </div>
            }
          />
        }
      />

      <Route
        path="/admin/featured-tools"
        element={
          <AdminRoute
            element={
              <div className="min-h-screen bg-stone-50">
                <header className="bg-white border-b py-4 px-6 flex justify-between items-center">
                  <h1 className="text-2xl font-serif">Benchlot Admin</h1>
                  <a href="/admin" className="text-forest-700 hover:underline">Back to Dashboard</a>
                </header>

                <AdminFeaturedTools />
              </div>
            }
          />
        }
      />
    </Routes>
    </CartProvider>
  );
}

export default App;
  
  
  
  
  
  
  