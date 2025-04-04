import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Check, Loader, AlertCircle, Mail } from 'lucide-react';

// Import Supabase client and helpers
import { resetPassword, completePasswordReset, supabase } from '../supabaseClient';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState('request'); // 'request' or 'reset'
  
  // Check if we're in reset mode (has hash fragment)
  useEffect(() => {
    // When the component mounts, check if there's a hash fragment in the URL
    const hash = window.location.hash;
    
    if (hash && hash.includes('type=recovery')) {
      setMode('reset');
    }
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      }
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Handle sending password reset email
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await resetPassword(email.trim());
      
      if (resetError) throw resetError;
      
      setSuccess(true);
      // Keep the loading state for a moment to prevent rapid clicking
      setTimeout(() => setLoading(false), 500);
      
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle setting new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the update user function to set the new password
      const { error: resetError } = await completePasswordReset(password);
      
      if (resetError) throw resetError;
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { state: { message: 'Your password has been reset successfully. You can now log in with your new password.' } });
      }, 2000);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password. Please try again or request a new reset link.');
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-base py-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-medium text-stone-800">
          {mode === 'request' ? 'Reset your password' : 'Set new password'}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          {mode === 'request' 
            ? "Enter the email address associated with your account and we'll send you a link to reset your password." 
            : "Create a new secure password for your account."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && mode === 'request' && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm">We've sent a password reset link to <span className="font-medium">{email}</span>.</p>
              </div>
            </div>
          )}
          
          {mode === 'request' ? (
            <form className="space-y-6" onSubmit={handleSendResetEmail}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-stone-300 rounded-md focus:outline-none focus:ring-forest-500 focus:border-forest-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-stone-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forest-700 hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 flex justify-center ${
                    loading || success ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : success ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-stone-300 rounded-md focus:outline-none focus:ring-forest-500 focus:border-forest-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-stone-500">Must be at least 8 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-stone-300 rounded-md focus:outline-none focus:ring-forest-500 focus:border-forest-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forest-700 hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 flex justify-center ${
                    loading || success ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : success ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;