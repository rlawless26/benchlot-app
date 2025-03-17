import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Loader, 
  MessageSquare, 
  Send, 
  User, 
  ChevronLeft,
  X,
  DollarSign, 
  CheckCircle, 
  XCircle, 
  ArrowRightCircle,
  AlertCircle
} from 'lucide-react';
import { supabase, getCurrentUser, fetchMessages, sendMessage, fetchUserOffers, respondToOffer, fetchConversations} from '../supabaseClient';



const Messages = () => {
  // State for conversation list
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for message thread
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [threadError, setThreadError] = useState(null);
  const [offers, setOffers] = useState([]);
  const messagesEndRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Functions to format dates/times
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };
  
  // Format price with $ and commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Load the current user and conversations
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: userData, error: userError } = await getCurrentUser();
        
        if (userError) {
          // Redirect to login if not logged in
          navigate('/login', { state: { from: '/messages' } });
          return;
        }
        
        if (!userData) {
          throw new Error('Failed to load user data');
        }
        
        setCurrentUser(userData);
        
        // Get conversations
        const { data: conversationsData, error: convError } = await fetchConversations();
        
        if (convError) throw convError;
        
        setConversations(conversationsData || []);
        
        // Check if a specific conversation was requested (from location state)
        if (location.state && location.state.recipient) {
          const requestedUserId = location.state.recipient;
          const existingConversation = conversationsData.find(
            conv => conv.other_user.id === requestedUserId
          );
          
          if (existingConversation) {
            setSelectedConversation(existingConversation);
          } else {
            // Create a new conversation entry if the user was specified but no conversation exists
            const { data: otherUserData } = await supabase
              .from('users')
              .select('*')
              .eq('id', requestedUserId)
              .single();
              
            if (otherUserData) {
              const newConversation = {
                id: null, // No actual conversation record yet
                other_user: otherUserData,
                tool_id: location.state.toolId || null,
                content: '',
                created_at: null
              };
              
              setSelectedConversation(newConversation);
            }
          }
        } else if (conversationsData && conversationsData.length > 0) {
          // Select the first conversation by default
          setSelectedConversation(conversationsData[0]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, location]);
  
  // Load messages and offers when a conversation is selected
  useEffect(() => {
    if (!currentUser || !selectedConversation || !selectedConversation.other_user) return;
    
    const loadMessages = async () => {
      setThreadError(null);
      
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await fetchMessages(selectedConversation.other_user.id);
        if (messagesError) throw messagesError;
        
        setMessages(messagesData || []);
        
        // Fetch offers related to this conversation
        const { data: offersData, error: offersError } = await fetchUserOffers();
        if (offersError) throw offersError;
        
        // Filter offers between these users
        const relevantOffers = offersData.filter(offer => 
          (offer.buyer_id === currentUser.id && offer.seller_id === selectedConversation.other_user.id) ||
          (offer.buyer_id === selectedConversation.other_user.id && offer.seller_id === currentUser.id)
        );
        
        setOffers(relevantOffers || []);
        
        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', selectedConversation.other_user.id)
          .eq('recipient_id', currentUser.id);
          
      } catch (err) {
        console.error('Error loading messages:', err);
        setThreadError('Failed to load messages. Please try again.');
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${currentUser.id}`
      }, (payload) => {
        // Add the new message to state if it's from this conversation
        if (payload.new.sender_id === selectedConversation.other_user.id) {
          setMessages(prev => [...prev, payload.new]);
          
          // Mark the message as read
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id);
        }
      })
      .subscribe();
      
    // Set up subscription for offer updates
    const offersSubscription = supabase
      .channel('offers-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers'
      }, async (payload) => {
        // Reload offers if this is relevant to the current conversation
        if (
          (payload.new.buyer_id === currentUser.id && payload.new.seller_id === selectedConversation.other_user.id) || 
          (payload.new.buyer_id === selectedConversation.other_user.id && payload.new.seller_id === currentUser.id)
        ) {
          const { data } = await fetchUserOffers();
          if (data) {
            const relevantOffers = data.filter(offer => 
              (offer.buyer_id === currentUser.id && offer.seller_id === selectedConversation.other_user.id) ||
              (offer.buyer_id === selectedConversation.other_user.id && offer.seller_id === currentUser.id)
            );
            setOffers(relevantOffers || []);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(offersSubscription);
    };
  }, [currentUser, selectedConversation]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    const username = conv.other_user.username || '';
    const fullName = conv.other_user.full_name || '';
    const term = searchTerm.toLowerCase();
    
    return username.toLowerCase().includes(term) || 
           fullName.toLowerCase().includes(term);
  });
  
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setSending(true);
    setThreadError(null);
    
    try {
      const { error } = await sendMessage(
        selectedConversation.other_user.id, 
        newMessage,
        selectedConversation.tool_id
      );
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setThreadError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // On mobile, add a class to show the conversation and hide the sidebar
    if (window.innerWidth < 768) {
      document.querySelector('.conversation-list').classList.add('hidden');
      document.querySelector('.conversation-view').classList.remove('hidden');
    }
  };
  
  // Handle back button on mobile
  const handleBackToList = () => {
    document.querySelector('.conversation-list').classList.remove('hidden');
    document.querySelector('.conversation-view').classList.add('hidden');
  };
  
  // Handle offer response (accept, reject, counter)
  const handleOfferResponse = async (offerId, action, counterAmount = null) => {
    setThreadError(null);
    
    try {
      const { data, error } = await respondToOffer(offerId, action, counterAmount);
      if (error) throw error;
      
      // Update the offer in the state
      setOffers(prev => 
        prev.map(offer => offer.id === offerId ? data : offer)
      );
    } catch (err) {
      console.error('Error responding to offer:', err);
      setThreadError('Failed to respond to offer. Please try again.');
    }
  };
  
  // Component to render a regular message
  const RegularMessage = ({ message, isSender }) => (
    <div className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
          isSender 
            ? 'bg-forest-700 text-white rounded-br-none' 
            : 'bg-stone-100 text-stone-800 rounded-bl-none'
        }`}
      >
        <div className="text-sm">
          {message.content}
        </div>
        <div 
          className={`text-xs mt-1 text-right ${
            isSender ? 'text-forest-200' : 'text-stone-500'
          }`}
        >
          {formatMessageTime(message.created_at)}
        </div>
      </div>
    </div>
  );
  
  // Component to render an offer message
  const OfferMessage = ({ message, offer, isSender, isCurrentUserSeller }) => {
    const [showActions, setShowActions] = useState(false);
    const [counterAmount, setCounterAmount] = useState('');
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offerError, setOfferError] = useState(null);
    
    // Function to handle accepting an offer
    const acceptOffer = async () => {
      setIsSubmitting(true);
      setOfferError(null);
      
      try {
        await handleOfferResponse(offer.id, 'accept');
      } catch (err) {
        setOfferError('Failed to accept offer. Please try again.');
      } finally {
        setIsSubmitting(false);
        setShowActions(false);
      }
    };
    
    // Function to handle rejecting an offer
    const rejectOffer = async () => {
      setIsSubmitting(true);
      setOfferError(null);
      
      try {
        await handleOfferResponse(offer.id, 'reject');
      } catch (err) {
        setOfferError('Failed to reject offer. Please try again.');
      } finally {
        setIsSubmitting(false);
        setShowActions(false);
      }
    };
    
    // Function to handle countering an offer
    const counterOffer = async () => {
      if (!counterAmount || parseFloat(counterAmount) <= 0) {
        setOfferError('Please enter a valid counter amount');
        return;
      }
      
      setIsSubmitting(true);
      setOfferError(null);
      
      try {
        await handleOfferResponse(offer.id, 'counter', parseFloat(counterAmount));
        setShowCounterForm(false);
      } catch (err) {
        setOfferError('Failed to counter offer. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Function to render the status badge
    const renderStatusBadge = () => {
      if (!offer.status || offer.status === 'pending') {
        return (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Pending Response
          </span>
        );
      }
      
      if (offer.status === 'accepted') {
        return (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Accepted
          </span>
        );
      }
      
      if (offer.status === 'rejected') {
        return (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
            <XCircle className="h-3 w-3 mr-1" /> Declined
          </span>
        );
      }
      
      if (offer.status === 'countered') {
        return (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
            <ArrowRightCircle className="h-3 w-3 mr-1" /> Countered
          </span>
        );
      }
      
      return null;
    };
    
    return (
      <div className={`rounded-lg p-4 my-2 ${isSender ? 'bg-forest-50 border border-forest-100' : 'bg-stone-100'}`}>
        {/* Offer header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-forest-700 mr-1" />
            <span className="font-medium text-stone-800">Offer</span>
          </div>
          {renderStatusBadge()}
        </div>
        
        {/* Offer amount */}
        <div className="text-2xl font-medium text-forest-700 mb-2">
          {formatPrice(offer.amount)}
        </div>
        
        {/* Message content */}
        <div className="text-stone-600 mb-4">
          {message.content}
        </div>
        
        {/* Counter offer (if applicable) */}
        {offer.status === 'countered' && offer.counter_amount && (
          <div className="bg-blue-50 p-3 rounded-md mb-3">
            <div className="text-sm text-blue-700 mb-1">Counter Offer:</div>
            <div className="text-xl font-medium text-blue-800">
              {formatPrice(offer.counter_amount)}
            </div>
          </div>
        )}
        
        {/* Error message */}
        {offerError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {offerError}
          </div>
        )}
        
        {/* Offer actions - only shown to the seller for pending offers */}
        {isCurrentUserSeller && offer.status === 'pending' && (
          <div>
            {!showActions ? (
              <button
                className="w-full py-2 border border-forest-300 text-forest-700 rounded hover:bg-forest-50 transition-colors"
                onClick={() => setShowActions(true)}
              >
                Respond to Offer
              </button>
            ) : (
              <div className="space-y-3">
                {/* Action buttons */}
                {!showCounterForm && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                      onClick={acceptOffer}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Accept'}
                    </button>
                    
                    <button
                      className="py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                      onClick={() => setShowCounterForm(true)}
                      disabled={isSubmitting}
                    >
                      Counter
                    </button>
                    
                    <button
                      className="py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                      onClick={rejectOffer}
                      disabled={isSubmitting}
                    >
                      Decline
                    </button>
                  </div>
                )}
                
                {/* Counter form */}
                {showCounterForm && (
                  <div>
                    <div className="mb-2">
                      <label className="text-sm text-stone-600 block mb-1">
                        Your Counter Offer:
                      </label>
                      <div className="flex">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2 text-stone-500">$</span>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-l focus:outline-none focus:border-forest-700"
                            placeholder="Enter amount"
                          />
                        </div>
                        <button
                          className="bg-forest-700 text-white px-3 py-2 rounded-r hover:bg-forest-800 transition-colors"
                          onClick={counterOffer}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Send'}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      className="text-sm text-stone-600 hover:text-stone-800"
                      onClick={() => setShowCounterForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Cancel button */}
                {!showCounterForm && (
                  <button
                    className="text-sm text-stone-600 hover:text-stone-800"
                    onClick={() => setShowActions(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Buyer actions for countered offers */}
        {!isCurrentUserSeller && offer.status === 'countered' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              Accept Counter
            </button>
            <button className="py-2 bg-white border border-stone-300 text-stone-700 rounded hover:bg-stone-50 transition-colors">
              Make New Offer
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Component to render a message item (decides between regular and offer messages)
  const MessageItem = ({ message }) => {
    const isSentByCurrentUser = message.sender_id === currentUser?.id;
    const isCurrentUserSeller = message.recipient_id === currentUser?.id;
    
    // Find related offer if this is an offer message
    const relatedOffer = message.offer_id ? 
      offers.find(offer => offer.id === message.offer_id) : 
      null;
    
    // If this is an offer-related message, render OfferMessage component
    if ((message.message_type === 'offer' || message.message_type === 'offer_response') && relatedOffer) {
      return (
        <OfferMessage
          message={message}
          offer={relatedOffer}
          isSender={isSentByCurrentUser}
          isCurrentUserSeller={isCurrentUserSeller}
        />
      );
    }
    
    // Otherwise render a regular message
    return (
      <RegularMessage 
        message={message} 
        isSender={isSentByCurrentUser} 
      />
    );
  };
  
  if (loading) {
    return (
      <div className="bg-base min-h-screen">
       
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-base min-h-screen">
     
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Conversation list sidebar */}
            <div className="conversation-list w-full md:w-80 border-r">
              <div className="p-4 border-b">
                <h1 className="text-xl font-medium text-stone-800 mb-4">Messages</h1>
                
                {/* Search bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                </div>
              </div>
              
              {/* List of conversations */}
              <div className="h-[calc(100%-5rem)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.other_user.id}
                        className={`p-4 hover:bg-stone-50 cursor-pointer transition-colors ${
                          selectedConversation?.other_user.id === conversation.other_user.id 
                            ? 'bg-forest-50 border-l-4 border-forest-700' 
                            : ''
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-stone-200 rounded-full overflow-hidden mr-3">
                            {conversation.other_user.avatar_url ? (
                              <img 
                                src={conversation.other_user.avatar_url} 
                                alt={conversation.other_user.username || 'User avatar'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-500 font-medium">
                                {(conversation.other_user.username || conversation.other_user.full_name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium text-stone-800 truncate">
                                {conversation.other_user.username || conversation.other_user.full_name || 'User'}
                              </h3>
                              <span className="text-xs text-stone-500">
                                {formatLastMessageTime(conversation.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-stone-600 truncate">
                              {conversation.content}
                            </p>
                            
                            {/* Unread badge */}
                            {conversation.unread_count > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-forest-700 text-white rounded-full mt-1">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation view */}
            <div className="conversation-view hidden md:block md:flex-1">
              {selectedConversation ? (
                <div className="flex flex-col h-full">
                  {/* Conversation header */}
                  <div className="bg-white border-b px-4 py-3">
                    <div className="flex items-center">
                      {/* Mobile back button */}
                      <button
                        className="md:hidden mr-2 text-stone-700"
                        onClick={handleBackToList}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden mr-3">
                        {selectedConversation.other_user.avatar_url ? (
                          <img 
                            src={selectedConversation.other_user.avatar_url} 
                            alt={selectedConversation.other_user.username || 'User avatar'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 font-medium">
                            {(selectedConversation.other_user.username || selectedConversation.other_user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-stone-800">
                          {selectedConversation.other_user.username || selectedConversation.other_user.full_name || 'User'}
                        </h3>
                        {selectedConversation.tool_id && (
                          <p className="text-xs text-stone-600">
                            Discussing Tool #{selectedConversation.tool_id.substring(0, 8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-stone-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <MessageItem 
                            key={message.id} 
                            message={message} 
                          />
                        ))}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Error message */}
                  {threadError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 mx-4 mb-2 rounded-md">
                      {threadError}
                    </div>
                  )}
                  
                  {/* Message input */}
                  <div className="bg-white border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex items-center">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-stone-300 rounded-l-md focus:outline-none focus:border-forest-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className="bg-forest-700 text-white px-4 py-2 rounded-r-md hover:bg-forest-800 transition-colors"
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-stone-500">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg">Select a conversation to view messages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;