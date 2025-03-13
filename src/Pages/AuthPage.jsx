import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Loader, 
  Mail, 
  Lock, 
  User,
  MapPin,
  Check
} from 'lucide-react';

// Import Supabase client and helpers
import { 
  signIn, 
  signUp, 
  getCurrentUser,
  supabase
} from '../supabaseClient';

// Import Header component
import Header from '../header';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [userLocation, setUserLocation] = useState('Boston, MA');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      console.log("Checking user authentication...");
      const { data, error } = await getCurrentUser();
      console.log("Auth check result:", data, error);
      
      if (data) {
        console.log("User is logged in, redirecting to:", redirectPath);
        navigate(redirectPath);
      } else {
        console.log("No user logged in, staying on auth page");
      }
    };
    
    checkUser();
  }, [navigate, redirectPath]);
  
  // Location options (for demo)
  const locations = ['Boston, MA', 'Cambridge, MA', 'Somerville, MA', 'Medford, MA', 'Newton, MA', 'Brookline, MA'];
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        // Validate signup form
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        
        // Create user
        const { data, error } = await signUp(email, password, {
          username,
          fullName,
          location: userLocation
        });
        
        if (error) throw error;
        
        // Show success message
        setSuccess(true);
        
        // Redirect after a delay if signUp was successful and we already have a session
        // (Supabase might create a session immediately if email confirmation is disabled)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setTimeout(() => navigate(redirectPath), 1500);
        }
        
      } else {
        // Login
        const { data, error } = await signIn(email, password);
        
        if (error) throw error;
        
        // Redirect to previous page or home
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-base min-h-screen">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-serif font-medium text-stone-800 mb-6 text-center">
            {mode === 'signup' ? 'Create an Account' : 'Sign In to Benchlot'}
          </h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && mode === 'signup' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account created successfully!</p>
                <p className="text-sm mt-1">
                  {supabase.auth.autoConfirmSignUp 
                    ? 'You can now sign in with your credentials.'
                    : 'Please check your email to confirm your account.'}
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="mb-4">
                  <label className="block text-stone-700 font-medium mb-1" htmlFor="username">
                    Username*
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                      placeholder="Choose a username"
                      required
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-stone-700 font-medium mb-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-stone-700 font-medium mb-1" htmlFor="userLocation">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      id="userLocation"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700 appearance-none"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label className="block text-stone-700 font-medium mb-1" htmlFor="email">
                Email*
              </label>
              <div className="relative">
                <input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="Enter your email"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-stone-700 font-medium mb-1" htmlFor="password">
                Password*
              </label>
              <div className="relative">
                <input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-stone-500 mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="block text-stone-700 font-medium mb-1" htmlFor="confirmPassword">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                    placeholder="Confirm your password"
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                </div>
              </div>
            )}
            
            {mode === 'login' && (
              <div className="flex justify-end mb-6">
                <a href="#" className="text-sm text-forest-700 hover:text-forest-800">
                  Forgot password?
                </a>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-md font-medium mb-4 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </button>
            
            <div className="text-center text-stone-600 text-sm">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="text-forest-700 hover:text-forest-800 font-medium">
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-forest-700 hover:text-forest-800 font-medium">
                    Create an Account
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center text-stone-600 text-sm">
          <p>By continuing, you agree to Benchlot's</p>
          <div className="mt-1">
            <a href="#" className="text-forest-700 hover:text-forest-800">Terms of Service</a>
            {' and '}
            <a href="#" className="text-forest-700 hover:text-forest-800">Privacy Policy</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;