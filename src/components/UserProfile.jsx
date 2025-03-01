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
  
  // Fetch profile and check if it's the current user
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: user } = await getCurrentUser();
        setCurrentUser(user);
        
        // Check if viewing own profile
        if (id === 'me' && user) {
          setIsCurrentUser(true);
          setProfile(user.profile);
          setEditFormData({
            username: user.profile?.username || '',
            full_name: user.profile?.full_name || '',
            location: user.profile?.location || '',
            bio: user.profile?.bio || ''
          });
        } else if (id === 'me' && !user) {
          // Redirect to login if trying to view own profile but not logged in
          window.location.href = '/login?redirect=profile/me';
          return;
        } else {
          // Fetch the requested user profile
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          setProfile(data);
          setIsCurrentUser(user && user.id === id);
        }
        
        // Fetch user's listings and reviews
        const [listingsResult, reviewsResult] = await Promise.all([
          fetchUserListings(id === 'me' ? user?.id : id),
          fetchUserReviews(id === 'me' ? user?.id : id)
        ]);
        
        if (listingsResult.error) throw listingsResult.error;
        if (reviewsResult.error) throw reviewsResult.error;
        
        setUserListings(listingsResult.data || []);
        setUserReviews(reviewsResult.data || []);
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
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
      <div className="bg-stone-50 min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-orange-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </main>
      </div>
    );
  }
}
export default UserProfile;