import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search, 
  Heart, 
  MessageSquare, 
  User,
  Menu,
  ChevronDown,
  Plus,
  LogOut,
  List,
  Settings,
  Package,
  Hammer,
  X
} from 'lucide-react';

// Import the Avatar component for improved image handling
import Avatar from './components/Avatar';

// Import Supabase client and helpers
import { supabase, getCurrentUser, signOut } from './supabaseClient';

// Import cart components
import CartIcon from './components/CartIcon';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Create a ref for the profile menu
  const profileMenuRef = useRef(null);

  // Handle clicks outside of the profile menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    // Only add the event listener if the menu is open
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Function to fetch user data including profile
  const fetchUserData = async () => {
    try {
      const { data } = await getCurrentUser();
      
      // Debug user profile information
      if (data) {
        console.log('User data in header:', data);
        
        if (data.profile) {
          console.log('User profile in header:', 
            `id: ${data.id}`,
            `email: ${data.email}`,
            `is_seller: ${data.profile.is_seller}`, 
            `avatar_url: ${data.profile.avatar_url}`,
            `username: ${data.profile.username}`
          );
        }
      }
      
      setUser(data);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of user data
    fetchUserData();
    
    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`);
        
        if (event === 'SIGNED_IN') {
          // User just signed in, fetch their data
          await fetchUserData();
        } else if (event === 'SIGNED_OUT') {
          // User just signed out
          setUser(null);
        } else if (event === 'USER_UPDATED') {
          // User was updated
          await fetchUserData();
        }
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      setProfileMenuOpen(false); // Close the profile menu
      await signOut();
      // setUser(null) will be handled by the auth listener
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const categories = [
    {
      name: "Power Tools",
      subcategories: ["Table Saws", "Drills", "Sanders", "Routers", "Air Compressors"]
    },
    {
      name: "Hand Tools",
      subcategories: ["Planes", "Chisels", "Hammers", "Screwdrivers", "Wrenches"]
    },
    {
      name: "Workshop Equipment",
      subcategories: ["Dust Collection", "Work Benches", "Tool Storage", "Safety Equipment"]
    },
    {
      name: "Machinery",
      subcategories: ["Lathes", "Mills", "Band Saws", "Drill Presses", "CNC"]
    }
  ];

  return (
    <header className="border-b">
      {/* Top Bar */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-forest-700">About</Link>
            <Link to="/help" className="hover:text-forest-700">Help</Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Empty for spacing */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            <button
              className="lg:hidden text-stone-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo link */}
            <Link to="/" className="text-2xl font-serif text-forest-800">Benchlot</Link>

            {/* Desktop Categories with links to marketplace with filters */}
            <nav className="hidden lg:flex items-center gap-6">
              {categories.map((category) => (
                <div key={category.name} className="relative group">
                  <Link 
                    to={`/marketplace?category=${encodeURIComponent(category.name)}`}
                    className="flex items-center gap-1 text-stone-700 hover:text-forest-700"
                  >
                    {category.name} <ChevronDown className="h-4 w-4" />
                  </Link>
                  <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 min-w-[200px] hidden group-hover:block z-10">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        to={`/marketplace?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}`}
                        className="block px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 rounded-md"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for tools..."
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                // Authenticated user options
                <>
                  {/* Sell your gear button - conditionally routes based on seller status */}
                  <Link 
                    to={user.profile?.is_seller ? "/listtool" : "/become-seller"} 
                    className="text-forest-700 hover:bg-forest-50 inline-flex items-center px-3 py-1.5 border border-forest-700 rounded-md"
                  >
                    <Hammer className="h-5 w-5 mr-1" />
                    <span className="hidden md:inline">Sell your gear</span>
                  </Link>
                  
                  {/* Wishlist icon */}
                  <Link to="/wishlist" className="text-stone-700 hover:text-forest-700">
                    <Heart className="h-5 w-5" />
                  </Link>
                  
                  {/* Cart Icon */}
                  <CartIcon />
                  
                  {/* Messages Icon */}
                  <Link to="/messages" className="text-stone-700 hover:text-forest-700">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                  
                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      className="text-stone-700 hover:text-forest-700 hover:bg-forest-50 relative cursor-pointer p-1 rounded-full flex items-center justify-center"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      aria-label="Open user menu"
                      aria-expanded={profileMenuOpen}
                      aria-haspopup="true"
                    >
                      <Avatar
                        url={user.profile?.avatar_url}
                        userId={user.id}
                        name={user.profile?.username || user.email || ''}
                        size="sm"
                      />
                    </button>

                    {profileMenuOpen && (
                      <div 
                        ref={profileMenuRef} 
                        id="profile-dropdown"
                        className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 min-w-[200px] z-[100]"
                      >
                        <div className="px-4 py-2 text-sm font-medium text-stone-700 border-b">
                          {user.profile?.username || user.email}
                        </div>

                        <Link to="/profile/me" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>

                        <Link to="/seller/listings" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <List className="h-4 w-4" />
                          My Listings
                        </Link>
                        
                        <Link to="/seller/dashboard" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <Package className="h-4 w-4" />
                          Shop Dashboard
                        </Link>

                        <Link to="/wishlist" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <Heart className="h-4 w-4" />
                          Saved Tools
                        </Link>

                        <Link to="/settings" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <Settings className="h-4 w-4" />
                          Account Settings
                        </Link>

                        <div className="border-t my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Unauthenticated user options
                <>
                  <Link to="/become-seller" className="text-forest-700 hover:bg-forest-50 inline-flex items-center px-3 py-1.5 border border-forest-700 rounded-md">
                    <Hammer className="h-5 w-5 mr-1" />
                    <span className="hidden md:inline">Sell your tools</span>
                  </Link>
                  
                  {/* Cart Icon */}
                  <CartIcon />
                  
                  <Link to="/login" className="text-stone-700 hover:text-forest-700">
                    Log In
                  </Link>
                  
                  <Link
                    to="/signup"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-md"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible on small screens */}
      <div className="md:hidden border-t p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for tools..."
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
        </div>
      </div>

      {/* Mobile Menu - Slides in from the left */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-stone-900 bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-serif font-medium">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-stone-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Categories with updated links */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <Link 
                    to={`/marketplace?category=${encodeURIComponent(category.name)}`}
                    className="font-medium text-stone-800 block hover:text-forest-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  <div className="pl-4 space-y-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        to={`/marketplace?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}`}
                        className="block text-stone-700 hover:text-forest-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile User Links */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              {!loading && (
                user ? (
                  <div className="space-y-3">
                    <Link 
                      to="/cart" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                    </Link>
                    <Link 
                      to="/profile/me" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      View Profile
                    </Link>
                    <Link 
                      to="/seller/listings" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <List className="h-5 w-5" />
                      My Listings
                    </Link>
                    <Link 
                      to="/seller/dashboard" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="h-5 w-5" />
                      Shop Dashboard
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      Saved Tools
                    </Link>
                    <Link 
                      to={user.profile?.is_seller ? "/listtool" : "/become-seller"}
                      className="flex items-center gap-3 py-2 px-3 text-forest-700 border border-forest-700 rounded-md hover:bg-forest-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Hammer className="h-5 w-5" />
                      Sell your gear
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/become-seller" 
                      className="flex items-center gap-3 py-2 px-3 text-forest-700 border border-forest-700 rounded-md hover:bg-forest-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Hammer className="h-5 w-5" />
                      Sell your tools
                    </Link>
                    <Link 
                      to="/cart" 
                      className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                    </Link>
                    <Link 
                      to="/login" 
                      className="block py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block py-2 text-stone-700 hover:text-forest-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;