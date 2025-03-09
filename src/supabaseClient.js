// src/supabaseClient.js - add these functions to your existing file
import { createClient } from '@supabase/supabase-js'

// Keep your existing supabase client initialization
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Add these functions to your existing supabaseClient.js file

// Auth helper functions (if you don't have them already)
export const signUp = async (email, password, userData) => {
  // Step 1: Sign up with email and password
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) return { error: authError };
  
  // If auth successful, create a user profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,  // This must match the auth.uid
        username: userData.username,
        full_name: userData.fullName,
        location: userData.location || 'Boston, MA',
        email: email  // Include email in the users table too
      });
      
    if (profileError) return { error: profileError };
  }
  
  return { data: authData };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, 
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return { data: null, error };
  
  try {
    // Get the user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Return the user even if profile fetch fails - allows auth without profile
    return { 
      data: { 
        ...user, 
        profile: profileError ? null : profile 
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: { ...user, profile: null }, error };
  }
};

// Tool listing functions
export const fetchTools = async (filters = {}) => {
  let query = supabase.from('tools')
    .select(`
      *,
      seller:seller_id (id, username, full_name, avatar_url, rating)
    `)
    .eq('is_sold', false);
  
  // Apply filters
  if (filters.category && filters.category !== 'All Categories') {
    query = query.eq('category', filters.category);
  }
  
  if (filters.subcategory) {
    query = query.eq('subcategory', filters.subcategory);
  }
  
  if (filters.condition && filters.condition.length > 0) {
    query = query.in('condition', filters.condition);
  }
  
  if (filters.minPrice !== undefined) {
    query = query.gte('current_price', filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('current_price', filters.maxPrice);
  }
  
  if (filters.verified) {
    query = query.eq('is_verified', true);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
  }
  
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  if (filters.featured) {
    query = query.eq('is_featured', true);
  }
  
  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price_low':
        query = query.order('current_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('current_price', { ascending: false });
        break;
      case 'featured':
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        break;
    }
  } else {
    // Default sorting
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }
  
  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error, count } = await query;
  return { data, error, count };
};

export const fetchToolById = async (id) => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      seller:seller_id (id, username, full_name, avatar_url, rating, location)
    `)
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const fetchFeaturedTools = async (limit = 3) => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      seller:seller_id (id, username, full_name, avatar_url, rating)
    `)
    .eq('is_featured', true)
    .eq('is_sold', false)
    .limit(limit);
  
  return { data, error };
};

export const fetchSimilarTools = async (toolId, category, limit = 3) => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      seller:seller_id (id, username, full_name, avatar_url, rating)
    `)
    .eq('category', category)
    .eq('is_sold', false)
    .neq('id', toolId)
    .limit(limit);
  
  return { data, error };
};

export const createTool = async (toolData) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to create a listing' } };
  
  const { data, error } = await supabase
    .from('tools')
    .insert({
      ...toolData,
      seller_id: user.id,
    })
    .select()
    .single();
  
  return { data, error };
};

export const updateTool = async (id, toolData) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to update a listing' } };
  
  const { data, error } = await supabase
    .from('tools')
    .update({
      ...toolData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id) // Enforce ownership
    .select()
    .single();
  
  return { data, error };
};

export const deleteTool = async (id) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to delete a listing' } };
  
  const { data, error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id); // Enforce ownership
  
  return { data, error };
};

export const markToolAsSold = async (id) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to update a listing' } };
  
  const { data, error } = await supabase
    .from('tools')
    .update({
      is_sold: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id); // Enforce ownership
  
  return { data, error };
};

// Image Upload
export const uploadToolImage = async (file, toolId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to upload images' } };
  
  // Get current number of images
  const { data: tool } = await fetchToolById(toolId);
  const imageCount = tool?.images?.length || 0;
  
  // Create a unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${toolId}_${imageCount}.${fileExt}`;
  const filePath = `tools/${toolId}/${fileName}`;
  
  // Upload the file
  const { data, error } = await supabase.storage
    .from('tool-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) return { error };
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('tool-images')
    .getPublicUrl(filePath);
  
  // Update the tool with the new image URL
  const { data: updatedTool, error: updateError } = await supabase
    .from('tools')
    .update({
      images: [...(tool?.images || []), publicUrl],
      updated_at: new Date().toISOString(),
    })
    .eq('id', toolId)
    .eq('seller_id', user.id) // Enforce ownership
    .select();
  
  return { data: { ...updatedTool, publicUrl }, error: updateError };
};

export const removeToolImage = async (toolId, imageUrl) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to remove images' } };
  
  // Get current images
  const { data: tool } = await fetchToolById(toolId);
  if (!tool || !tool.images) return { error: { message: 'Tool not found' } };
  
  // Filter out the removed image
  const updatedImages = tool.images.filter(url => url !== imageUrl);
  
  // Update the tool
  const { data, error } = await supabase
    .from('tools')
    .update({
      images: updatedImages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', toolId)
    .eq('seller_id', user.id) // Enforce ownership
    .select();
  
  return { data, error };
};

// Wishlist functions
export const addToWishlist = async (toolId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to save tools' } };
  
  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: user.id,
      tool_id: toolId,
    })
    .select();
  
  return { data, error };
};

export const removeFromWishlist = async (toolId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to remove saved tools' } };
  
  const { data, error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq('tool_id', toolId);
  
  return { data, error };
};

export const fetchWishlist = async () => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to view your wishlist' } };
  
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      tool_id,
      tool:tool_id (
        *,
        seller:seller_id (id, username, full_name, avatar_url, rating)
      )
    `)
    .eq('user_id', user.id);
  
  return { data: data?.map(item => item.tool), error };
};

export const isToolInWishlist = async (toolId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { data: false };
  
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .single();
  
  return { data: !!data, error };
};

// User profile functions
export const updateUserProfile = async (profileData) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to update your profile' } };
  
  const { data, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();
  
  return { data, error };
};

export const uploadProfileImage = async (file) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to upload a profile image' } };
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  // Upload the file
  const { data, error } = await supabase.storage
    .from('user-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) return { error };
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-images')
    .getPublicUrl(filePath);
  
  // Update the user profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from('users')
    .update({
      avatar_url: publicUrl,
    })
    .eq('id', user.id)
    .select();
  
  return { data: { ...updatedProfile, publicUrl }, error: updateError };
};

// Get user's listings
export const fetchUserListings = async (userId) => {
  // If userId is not provided, get current user's listings
  if (!userId) {
    const { data: currentUser } = await getCurrentUser();
    userId = currentUser?.id;
    
    if (!userId) return { error: { message: 'User ID is required' } };
  }
  
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      seller:seller_id (id, username, full_name, avatar_url, rating)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Review functions
export const createReview = async (reviewData) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to leave a review' } };
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      reviewer_id: user.id,
    })
    .select();
  
  return { data, error };
};

export const fetchUserReviews = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id (id, username, full_name, avatar_url)
    `)
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Message functions
export const sendMessage = async (recipientId, content, toolId = null) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to send messages' } };
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      tool_id: toolId,
      content,
    })
    .select();
  
  return { data, error };
};

export const fetchConversations = async () => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to view conversations' } };
  
  // Get the most recent message from each conversation
  const { data: sentMessages, error: sentError } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      is_read,
      sender_id,
      recipient_id,
      tool_id,
      other_user:recipient_id (id, username, full_name, avatar_url)
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false });
  
  const { data: receivedMessages, error: receivedError } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      is_read,
      sender_id,
      recipient_id,
      tool_id,
      other_user:sender_id (id, username, full_name, avatar_url)
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });
  
  if (sentError || receivedError) return { error: sentError || receivedError };
  
  // Combine and deduplicate conversations
  const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
  const conversationMap = new Map();
  
  allMessages.forEach(message => {
    const otherUserId = message.other_user.id;
    
    if (!conversationMap.has(otherUserId) || 
        message.created_at > conversationMap.get(otherUserId).created_at) {
      conversationMap.set(otherUserId, {
        ...message,
        unread_count: message.is_read ? 0 : 1
      });
    } else if (!message.is_read && message.recipient_id === user.id) {
      // Increment unread count for existing conversation
      const existingConversation = conversationMap.get(otherUserId);
      existingConversation.unread_count += 1;
    }
  });
  
  // Sort by most recent message
  const conversations = Array.from(conversationMap.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return { data: conversations, error: null };
};

export const fetchMessages = async (otherUserId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to view messages' } };
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  
  return { data, error };
};

export const markMessagesAsRead = async (otherUserId) => {
  const { data: user } = await getCurrentUser();
  if (!user) return { error: { message: 'You must be logged in to update messages' } };
  
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('sender_id', otherUserId)
    .eq('is_read', false);
  
  return { data, error };
};

// Waitlist
export const joinWaitlist = async (email) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([
      {
        email,
        signed_up_at: new Date().toISOString(),
      }
    ]);

  return { data, error };
};