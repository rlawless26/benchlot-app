import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Star,
  Check,
  MessageSquare,
  User,
  Tool,
  Edit,
  Loader,
  AlertCircle
} from 'lucide-react';

// Import Supabase client and helpers
import {
  supabase,
  getCurrentUser,
  fetchUserListings,
  fetchUserReviews,
  updateUserProfile,
  uploadProfileImage,
  sendMessage
} from '../supabaseClient';

// Import Header component
import Header from '../header';
import ToolListingCard from './ToolListingCard';

const UserProfile = () => {
  const { id } = useParams();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Message state
  const [messageText, setMessageText] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // In UserProfile.jsx, update the fetchProfileData function in useEffect
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: user } = await getCurrentUser();
        setCurrentUser(user);

        // If no ID parameter or /profile route (without ID), treat as "me" profile
        const effectiveId = id || 'me';

        if ((effectiveId === 'me' || !effectiveId) && user) {
          setIsCurrentUser(true);
          setProfile(user.profile);
          setEditFormData({
            username: user.profile?.username || '',
            full_name: user.profile?.full_name || '',
            location: user.profile?.location || '',
            bio: user.profile?.bio || ''
          });
        } else if ((effectiveId === 'me' || !effectiveId) && !user) {
          // Redirect to login if trying to view own profile but not logged in
          window.location.href = '/login?redirect=profile';
          return;
        } else if (effectiveId && effectiveId !== 'me') {
          // Only try to fetch if id exists and is not 'me'
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', effectiveId)
            .single();

          if (error) throw error;
          setProfile(data);
          setIsCurrentUser(user && user.id === effectiveId);
        }

        // Fetch user's listings and reviews (only if we have a valid user ID)
        const targetUserId = (effectiveId === 'me' || !effectiveId) ? user?.id : effectiveId;

        if (targetUserId) {
          const [listingsResult, reviewsResult] = await Promise.all([
            fetchUserListings(targetUserId),
            fetchUserReviews(targetUserId)
          ]);

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
      }
    };

    fetchProfileData();
  }, [id]);

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

  // Send a message to the user
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      setMessageError('Please enter a message.');
      return;
    }

    setSendingMessage(true);
    setMessageError(null);
    setMessageSent(false);

    try {
      const { error } = await sendMessage(profile.id, messageText);

      if (error) throw error;

      setMessageSent(true);
      setMessageText('');

      // Close the message form after a short delay
      setTimeout(() => {
        setShowMessageForm(false);
        setMessageSent(false);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessageError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="bg-base min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {isCurrentUser ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-serif font-medium mb-6">Your Profile</h1>

            {/* Debug information */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Debug Info:</h3>
              <p>User ID: {currentUser?.id || 'Not available'}</p>
              <p>Email: {currentUser?.email || 'Not available'}</p>
              <p>Profile Data Available: {profile ? 'Yes' : 'No'}</p>
            </div>

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
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
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

                <div className="pt-6 border-t">
                  <h3 className="font-medium text-lg mb-4">Your Listings</h3>
                  {userListings && userListings.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {userListings.map(listing => (
                        <div key={listing.id} className="border rounded-md p-4">
                          <p className="font-medium">{listing.name}</p>
                          <p className="text-stone-600">${listing.current_price}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500">You haven't listed any tools yet.</p>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                  >
                    Edit Profile
                  </button>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-serif font-medium mb-6">
              {profile?.username || 'User'}'s Profile
            </h1>

            {/* Other user profile content */}
            {profile ? (
              <div>
                {/* Similar profile display as above but without edit buttons */}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-500">This user's profile could not be loaded.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default UserProfile;