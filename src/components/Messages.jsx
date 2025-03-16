import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  User, 
  ChevronLeft, 
  Loader, 
  AlertCircle 
} from 'lucide-react';

// Import Supabase client and helpers
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  markMessagesAsRead,
  getCurrentUser,
  supabase
} from '../supabaseClient';

// Import Header component
import Header from '../header';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await getCurrentUser();
        
        if (error || !data) {
          navigate('/login', { state: { from: '/messages' } });
          return;
        }
        
        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error('Error checking user:', err);
        navigate('/login', { state: { from: '/messages' } });
      }
    };
    
    checkUser();
  }, [navigate]);
  
  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    
    const loadConversations = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchConversations();
        
        if (error) throw error;
        
        setConversations(data || []);
        
        // If there are conversations and none is selected, select the first one
        if (data?.length > 0 && !selectedConversation) {
          // Check if we have a requested conversation from location state
          const requestedUserId = location.state?.recipient;
          
          if (requestedUserId) {
            const requestedConversation = data.find(conv => 
              conv.other_user.id === requestedUserId
            );
            
            if (requestedConversation) {
              setSelectedConversation(requestedConversation);
            } else {
              // If we have a requested user but no existing conversation,
              // we should create a placeholder for the new conversation
              const fetchUserData = async () => {
                try {
                  const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', requestedUserId)
                    .single();
                  
                  if (data) {
                    const newConversation = {
                      other_user: data,
                      is_new: true,
                      tool_id: location.state?.toolId
                    };
                    
                    setSelectedConversation(newConversation);
                  } else {
                    // If user not found, just select first conversation
                    if (data && data.length > 0) {
                      setSelectedConversation(data[0]);
                    }
                  }
                } catch (err) {
                  console.error('Error fetching user:', err);
                  // If error, just select first conversation
                  if (data && data.length > 0) {
                    setSelectedConversation(data[0]);
                  }
                }
              };
              
              fetchUserData();
            }
          } else {
            // No requested user, just select first conversation
            setSelectedConversation(data[0]);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Set up real-time subscription for new messages
    let subscription;
    if (user?.id) {
      subscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        }, payload => {
          // Handle new message
          if (selectedConversation?.other_user?.id === payload.new.sender_id) {
            // If it's from the selected conversation, add it to messages
            setMessages(prev => [...prev, payload.new]);
          }
          
          // Always refresh conversations to update unread counts
          loadConversations();
        })
        .subscribe();
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, location.state]);
  
  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!user || !selectedConversation || selectedConversation.is_new) return;
    
    const loadMessages = async () => {
      try {
        const { data, error } = await fetchMessages(selectedConversation.other_user.id);
        
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark messages as read
        await markMessagesAsRead(selectedConversation.other_user.id);
        
        // Refresh conversations to update unread counts
        const { data: conversationsData } = await fetchConversations();
        setConversations(conversationsData || []);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again.');
      }
    };
    
    loadMessages();
  }, [user, selectedConversation]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format date for display
  const formatMessageDate = (dateString) => {
    // Check if dateString is valid
    if (!dateString || dateString === 'Invalid Date') {
      return '';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Today, show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // Yesterday
        return 'Yesterday';
      } else if (diffDays < 7) {
        // Within the last week, show day name
        return date.toLocaleDateString([], { weekday: 'long' });
      } else {
        // More than a week ago, show date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation?.other_user?.id) return;
    
    setSendingMessage(true);
    
    try {
      // Create a temporary message object to display immediately
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        sender_id: user.id,
        recipient_id: selectedConversation.other_user.id,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      // Add to UI immediately for better user experience
      setMessages(prev => [...prev, tempMessage]);
      
      // Clear input field immediately
      setNewMessage('');
      
      // Make the actual API call
      const { data, error } = await sendMessage(
        selectedConversation.other_user.id, 
        tempMessage.content,
        selectedConversation.tool_id
      );
      
      if (error) throw error;
      
      // If this was a new conversation, refresh conversations
      if (selectedConversation.is_new) {
        const { data: conversationsData } = await fetchConversations();
        
        if (conversationsData) {
          setConversations(conversationsData);
          
          // Find and select the real conversation instead of the placeholder
          const realConversation = conversationsData.find(conv => 
            conv.other_user.id === selectedConversation.other_user.id
          );
          
          if (realConversation) {
            setSelectedConversation(realConversation);
          }
        }
      }
      
      // Optionally, update the temporary message with the real one from the server
      if (data) {
        setMessages(prev => 
          prev.map(msg => msg.id === tempMessage.id ? data : msg)
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Restore the message in the input if there was an error
      setNewMessage(newMessage);
      
      // Remove the temporary message
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Get total unread messages
  const getTotalUnreadMessages = () => {
    return conversations.reduce((total, conv) => {
      return total + (conv.unread_count || 0);
    }, 0);
  };
  
  // If loading, show loading state
  if (loading && !user) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
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
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-medium text-stone-800 mb-6">Messages</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Conversations list */}
            <div className="md:col-span-1 border-r border-stone-200">
              <div className="p-4 border-b border-stone-200">
                <h2 className="font-medium text-stone-800">Conversations</h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(600px-57px)]">
                {loading && conversations.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="h-6 w-6 text-forest-700 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-stone-300 mb-2" />
                    <p className="text-stone-500">No conversations yet</p>
                    <p className="text-sm text-stone-400 mt-2">
                      When you message other users, your conversations will appear here
                    </p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id || conversation.other_user.id}
                        className={`w-full text-left p-4 border-b border-stone-100 hover:bg-stone-50 flex items-start gap-3 ${
                          selectedConversation?.other_user?.id === conversation.other_user.id
                            ? 'bg-stone-50'
                            : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="relative">
                          {conversation.other_user.avatar_url ? (
                            <img
                              src={conversation.other_user.avatar_url}
                              alt={`${conversation.other_user.username || 'User'}'s avatar`}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/40x40';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          
                          {conversation.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-forest-700 text-white rounded-full flex items-center justify-center text-xs">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-medium text-stone-800 truncate">
                              {conversation.other_user.username || conversation.other_user.full_name || 'User'}
                            </h3>
                            {conversation.created_at && (
                              <span className="text-xs text-stone-500 shrink-0 ml-2">
                                {formatMessageDate(conversation.created_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 truncate">
                            {conversation.content}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Message thread */}
            <div className="md:col-span-2 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b border-stone-200 flex items-center gap-3">
                    <button
                      className="md:hidden text-stone-600 hover:text-forest-700"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {selectedConversation.other_user.avatar_url ? (
                      <img
                        src={selectedConversation.other_user.avatar_url}
                        alt={`${selectedConversation.other_user.username || 'User'}'s avatar`}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/32x32';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-stone-800">
                        {selectedConversation.other_user.username || selectedConversation.other_user.full_name || 'User'}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {selectedConversation.is_new ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <MessageSquare className="h-12 w-12 text-stone-300 mb-2" />
                        <p className="text-stone-500">Start a new conversation</p>
                        <p className="text-sm text-stone-400 mt-2">
                          Send your first message to {selectedConversation.other_user.username || selectedConversation.other_user.full_name || 'this user'}
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <Loader className="h-8 w-8 text-forest-700 animate-spin" />
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.sender_id === user.id;
                        const formattedDate = formatMessageDate(message.created_at);
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwn
                                  ? 'bg-forest-700 text-white'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              <p>{message.content}</p>
                              {formattedDate && (
                                <div
                                  className={`text-xs mt-1 ${
                                    isOwn ? 'text-forest-50' : 'text-stone-500'
                                  }`}
                                >
                                  {formattedDate}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-stone-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {sendingMessage ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <MessageSquare className="h-16 w-16 text-stone-300 mb-4" />
                  <h3 className="text-xl font-medium text-stone-800 mb-2">Your Messages</h3>
                  <p className="text-stone-500 max-w-sm">
                    Select a conversation to view your messages or start a new conversation by
                    visiting a tool or user profile
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;