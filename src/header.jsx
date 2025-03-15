import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  MessageSquare,
  Bell,
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

// Import Supabase client and helpers
import { getCurrentUser, signOut } from './supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to marketplace page with search query
      navigate(`/marketplace?query=${encodeURIComponent(searchQuery.trim())}`);
      // Clear the search input after search
      setSearchQuery('');
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
            <span><a href="https://blog.benchlot.com/blog">
              Updates
            </a></span>
            <span className="text-stone-600">Help</span>
          </div>
          <div className="flex items-center gap-4">
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

            {/* Updated logo link to "/2" */}
            <Link to="/2" className="text-2xl font-serif text-forest-800">Benchlot</Link>

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
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search for tools..."
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                // Authenticated user options
                <>
                  <button className="text-stone-700 hover:text-forest-700">
                    <Heart className="h-5 w-5" />
                  </button>

                  <button className="text-stone-700 hover:text-forest-700">
                    <MessageSquare className="h-5 w-5" />
                  </button>

                  <button className="text-stone-700 hover:text-forest-700">
                    <Bell className="h-5 w-5" />
                  </button>

                  <div className="relative">
                    <button
                      className="text-stone-700 hover:text-forest-700 relative"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    >
                      {user.profile?.avatar_url ? (
                        <img
                          src={user.profile.avatar_url}
                          alt={user.profile?.username || 'User avatar'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 min-w-[200px] z-10">
                        <div className="px-4 py-2 text-sm font-medium text-stone-700 border-b">
                          {user.profile?.username || user.email}
                        </div>

                        <Link to="/profile/me" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>

                        <Link to="/my-listings" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <List className="h-4 w-4" />
                          My Listings
                        </Link>

                        <Link to="/wishlist" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <Heart className="h-4 w-4" />
                          Saved Tools
                        </Link>

                        <Link to="/settings" className="flex items-center gap-3 w-full text-left px-4 py-2 text-stone-700 hover:bg-forest-50 hover:text-forest-700 text-sm">
                          <Settings className="h-4 w-4" />
                          Settings
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
                  <a href="/listtool" className="px-4 py-2 bg-white border border-forest-300 text-forest-700 rounded-md hover:bg-forest-50 inline-flex items-center justify-center">
                    <Hammer className="h-5 w-5 mr-2" />
                    List a Tool
                  </a>
                </>
              ) : (
                // Unauthenticated user options
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-stone-700 hover:text-forest-700">
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible on small screens */}
      <div className="md:hidden border-t p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search for tools..."
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
          <button type="submit" className="sr-only">Search</button>
        </form>
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
                    <Link to="/profile/me" className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700">
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                    <Link to="/my-listings" className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700">
                      <Hammer className="h-5 w-5" />
                      My Listings
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700">
                      <Heart className="h-5 w-5" />
                      Saved Tools
                    </Link>
                    <Link to="/listtool" className="flex items-center gap-3 py-2 text-stone-700 hover:text-forest-700">
                      <Plus className="h-5 w-5" />
                      List a Tool
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
                    <Link to="/login" className="block py-2 text-stone-700 hover:text-forest-700">
                      Log In
                    </Link>
                    <Link to="/signup" className="block py-2 text-stone-700 hover:text-forest-700">
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