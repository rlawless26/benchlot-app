import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Star,
  Check,
  MessageSquare,
  User,
  Hammer,
  Edit,
  Loader,
  AlertCircle,
  Settings
} from 'lucide-react';

// Import Supabase client and helpers
import {
  supabase,
  getCurrentUser,
  fetchUserListings,
  fetchUserReviews,
  updateUserProfile,
  uploadProfileImage,
  sendMessage,
  isUrlAccessible,
  checkEnvironment,
  checkSupabaseConnection
} from '../supabaseClient';

// Import application config
import config from '../config';


import ToolListingCard from './ToolListingCard';
import MessageBanner from './MessageBanner';
import FixEnvironment from './FixEnvironment';

const UserProfile = () => {
  const { id } = useParams();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [envError, setEnvError] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    full_name: '',
    location: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Debug logging for render
  console.log("Rendering UserProfile with params ID:", id);

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("Starting profile fetch with ID param:", id);
      setLoading(true);
      setError(null);
      
      // Check environment variables
      // Run the environment check
      const envStatus = checkEnvironment();
      
      // Check Supabase connection
      const connectionStatus = await checkSupabaseConnection();
      console.log('Supabase connection status:', connectionStatus);
      
      // Check if environment is properly set up
      if (!connectionStatus.success || !window.BENCHLOT_ENV) {
        console.error('Environment error detected, showing diagnostic component');
        setEnvError(true);
        setLoading(false);
        return; // Exit early to show environment fix component
      }

      try {
        // Get current user
        const { data: user } = await getCurrentUser();
        console.log("Current user data:", user);
        setCurrentUser(user);

        // If no ID parameter or /profile route (without ID), treat as "me" profile
        const effectiveId = id || 'me';
        console.log("Effective ID for profile fetch:", effectiveId);

        if ((effectiveId === 'me' || !effectiveId) && user) {
          console.log("Viewing own profile");
          setIsCurrentUser(true);
          setProfile(user.profile);
          setEditFormData({
            username: user.profile?.username || '',
            full_name: user.profile?.full_name || '',
            location: user.profile?.location || '',
            bio: user.profile?.bio || ''
          });
          console.log("Set profile to user.profile:", user.profile);
        } else if ((effectiveId === 'me' || !effectiveId) && !user) {
          console.log("Attempted to view own profile but not logged in, redirecting");
          // Redirect to login if trying to view own profile but not logged in
          window.location.href = '/login?redirect=profile';
          return;
        } else if (effectiveId && effectiveId !== 'me') {
          console.log("Fetching other user profile with ID:", effectiveId);
          // Only try to fetch if id exists and is not 'me'
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', effectiveId)
            .single();

          console.log("Other user profile API response:", data);
          console.log("Other user profile API error:", error);

          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }
          
          if (!data) {
            console.error("No profile data returned for ID:", effectiveId);
            throw new Error("User profile not found");
          }
          
          setProfile(data);
          setIsCurrentUser(user && user.id === effectiveId);
          console.log("Set profile state to:", data);
          console.log("Set isCurrentUser to:", user && user.id === effectiveId);
        }

        // Fetch user's listings and reviews (only if we have a valid user ID)
        const targetUserId = (effectiveId === 'me' || !effectiveId) ? user?.id : effectiveId;
        console.log("Target user ID for listings/reviews:", targetUserId);

        if (targetUserId) {
          console.log("Fetching listings and reviews for user:", targetUserId);
          const [listingsResult, reviewsResult] = await Promise.all([
            fetchUserListings(targetUserId),
            fetchUserReviews(targetUserId)
          ]);

          console.log("Listings result:", listingsResult);
          console.log("Reviews result:", reviewsResult);

          if (listingsResult.error) console.error("Error fetching listings:", listingsResult.error);
          if (reviewsResult.error) console.error("Error fetching reviews:", reviewsResult.error);

          setUserListings(listingsResult.data || []);
          setUserReviews(reviewsResult.data || []);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
        console.log("Profile fetch complete, loading set to false");
      }
    };

    fetchProfileData();
  }, [id]);

  // Monitor state changes
  useEffect(() => {
    console.log("Profile state updated:", profile);
    console.log("isCurrentUser state updated:", isCurrentUser);
    console.log("userListings updated:", userListings);
    
    // Check avatar URL accessibility if available
    if (profile?.avatar_url) {
      console.log("Testing avatar URL accessibility:", profile.avatar_url);
      isUrlAccessible(profile.avatar_url).then(accessible => {
        console.log(`Avatar URL accessibility test: ${accessible ? 'PASSED' : 'FAILED'}`);
      });
    }
  }, [profile, isCurrentUser, userListings]);

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for profile image
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type and size
      const isImage = file.type.startsWith('image/');
      const isUnder2MB = file.size <= 2 * 1024 * 1024; // 2MB limit

      if (!isImage) {
        setEditError('Profile image must be an image file.');
        return;
      }

      if (!isUnder2MB) {
        setEditError('Profile image must be under 2MB.');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update the form data with the preview URL
        setEditFormData(prev => ({
          ...prev,
          avatarPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      // Update profile data
      const { error } = await updateUserProfile({
        username: editFormData.username,
        full_name: editFormData.full_name,
        location: editFormData.location,
        bio: editFormData.bio
      });

      if (error) throw error;

      // Upload new profile image if selected
      if (selectedFile) {
        setUploadingImage(true);
        const { error: uploadError } = await uploadProfileImage(selectedFile);
        if (uploadError) throw uploadError;
        setUploadingImage(false);
      }

      // Update local state
      setProfile(prev => ({
        ...prev,
        username: editFormData.username,
        full_name: editFormData.full_name,
        location: editFormData.location,
        bio: editFormData.bio,
        avatar_url: selectedFile ? URL.createObjectURL(selectedFile) : prev.avatar_url
      }));

      setEditSuccess(true);

      // Exit edit mode after a short delay
      setTimeout(() => {
        setIsEditing(false);
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get placeholder image URL with error handling
  const getPlaceholderUrl = (width, height) => {
    // Use an external placeholder service to avoid 406 errors
    return `https://placehold.co/${width}x${height}`;
  };

  console.log("Pre-render state check:", { loading, error, envError, profile, isCurrentUser });

  if (envError) {
    return (
      <div className="bg-base min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>Environment configuration issues detected. Please use the tool below to fix them.</span>
          </div>
          
          <FixEnvironment />
          
          <div className="text-center mt-8">
            <Link to="/" className="text-forest-700 hover:text-forest-800 underline">
              Return to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <div className="text-center mt-8">
            <Link to="/" className="text-forest-700 hover:text-forest-800 underline">
              Return to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Debug info section (can be removed in production) */}
        <div className="mb-6 p-4 bg-stone-100 border border-stone-200 rounded-md">
          <h3 className="font-medium text-stone-800 mb-2">Debug Info:</h3>
          <p>Profile exists: {profile ? 'Yes' : 'No'}</p>
          <p>isCurrentUser: {isCurrentUser ? 'Yes' : 'No'}</p>
          <p>User ID: {id || 'Not in URL'}</p>
        </div>

        {isCurrentUser ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-serif font-medium mb-6">Your Profile</h1>

            {/* Profile Information */}
            {profile ? (
              isEditing ? (
                // Edit Form
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1" htmlFor="username">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={editFormData.username}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-stone-700 font-medium mb-1" htmlFor="full_name">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={editFormData.full_name}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-stone-700 font-medium mb-1" htmlFor="location">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={editFormData.location}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-stone-700 font-medium mb-1" htmlFor="avatar">
                        Profile Image
                      </label>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                        accept="image/*"
                      />
                      {editFormData.avatarPreview && (
                        <div className="mt-2">
                          <img 
                            src={editFormData.avatarPreview} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-stone-700 font-medium mb-1" htmlFor="bio">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                    ></textarea>
                  </div>
                  
                  {editError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {editError}
                    </div>
                  )}
                  
                  {editSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                      Profile updated successfully!
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  {profile.avatar_url ? (
                    <img
                      src={`${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}cb=${Date.now()}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        console.log("Avatar image failed to load:", profile.avatar_url);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = getPlaceholderUrl(96, 96);
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-forest-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-forest-700" />
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-medium">{profile.username || 'No Username'}</h2>
                    <p className="text-stone-600">{profile.full_name || ''}</p>
                    <p className="text-stone-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location || 'Location not specified'}
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-2">About</h3>
                    <p className="text-stone-700">{profile.bio}</p>
                  </div>
                )}

                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <Link 
                    to="/settings" 
                    className="px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Full Account Settings
                  </Link>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-stone-500">Profile data could not be loaded.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          // Other user profile view
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-serif font-medium mb-6">
              {profile?.username || 'User'}'s Profile
            </h1>

            {profile ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  {profile.avatar_url ? (
                    <img
                      src={`${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}cb=${Date.now()}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        console.log("Other user avatar failed to load:", profile.avatar_url);
                        e.target.onerror = null;
                        e.target.src = getPlaceholderUrl(96, 96);
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-forest-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-forest-700" />
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-medium">{profile.username || 'User'}</h2>
                    {profile.full_name && <p className="text-stone-600">{profile.full_name}</p>}
                    
                    {profile.location && (
                      <p className="text-stone-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-2">About</h3>
                    <p className="text-stone-700">{profile.bio}</p>
                  </div>
                )}

                {/* Link to user's marketplace listings */}
                <div className="pt-6 border-t">
                  <div className="flex justify-center mt-4">
                    <Link 
                      to={`/marketplace?seller=${profile.id}`}
                      className="px-4 py-2 bg-forest-50 text-forest-700 border border-forest-200 rounded-md hover:bg-forest-100 flex items-center"
                    >
                      <Hammer className="h-4 w-4 mr-2" />
                      View {profile.username || 'User'}'s Listings in Marketplace
                    </Link>
                  </div>
                </div>

                {/* Contact button for other users - Using MessageBanner component */}
                {currentUser && (
                  <div className="flex justify-center mt-6">
                    <div className="w-full max-w-md">
                      <MessageBanner recipient={profile} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-500">This user's profile could not be loaded.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;