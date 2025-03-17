import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share,
  MessageSquare,
  MapPin,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  X
} from 'lucide-react';

// Import Supabase client and helpers
import {
  fetchToolById,
  fetchSimilarTools,
  addToWishlist,
  removeFromWishlist,
  isToolInWishlist,
  getCurrentUser,
  supabase
} from '../supabaseClient';

// Import Header component
import Header from '../header';
import MessageModal from '../components/MessageModal';

const ToolDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State variables
  const [tool, setTool] = useState(null);
  const [similarTools, setSimilarTools] = useState([]);
  const [user, setUser] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState(null);

  // Handle sharing the tool
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Check out this ${tool.name} on Benchlot`;
    const shareText = `${tool.name} - ${formatPrice(tool.current_price)} - Available on Benchlot`;

    // Try to use the Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        console.log("Shared successfully");
      } catch (err) {
        console.error("Error sharing:", err);
        // Fall back to clipboard if sharing was cancelled or failed
        copyToClipboard(shareUrl);
      }
    } else {
      // Fall back to clipboard for browsers that don't support Web Share API
      copyToClipboard(shareUrl);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text) => {
    // Create a temporary input element
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);

    // Select and copy the text
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    // Show a toast notification (you'll need to implement this or use a library)
    alert("Link copied to clipboard!");
  };

  console.log("ToolDetailPage - ID from URL params:", id);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await getCurrentUser();
      setUser(data);
    };

    checkUser();
  }, []);

  // Fetch tool data and check wishlist status
  useEffect(() => {
    const loadToolData = async () => {
      // Get URL parameter ID
      let toolId = id;
      console.log("ID from URL params:", toolId);

      // If no ID in URL or it doesn't look valid, check localStorage
      if (!toolId || toolId.length < 30) {
        const savedId = localStorage.getItem('lastCreatedToolId');
        if (savedId) {
          console.log("Using ID from localStorage instead:", savedId);
          toolId = savedId;
          // Update the URL without reloading the page
          window.history.replaceState(null, '', `/tool/${savedId}`);
          // Clear localStorage to avoid using this ID again
          localStorage.removeItem('lastCreatedToolId');
        }
      }

      if (!toolId) {
        setError('No valid tool ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching tool with ID:", toolId);
        const { data, error } = await fetchToolById(toolId);

        console.log("API response:", { data, error });

        if (error) {
          console.error("API error:", error);
          throw error;
        }

        if (!data) {
          console.error("No tool data returned for ID:", toolId);
          throw new Error('No tool found with this ID');
        }

        setTool(data);

        // Fetch similar tools
        if (data.category) {
          const { data: similarData } = await fetchSimilarTools(toolId, data.category, 3);
          setSimilarTools(similarData || []);
        }

        // Check if tool is in user's wishlist
        if (user) {
          const { data: wishlistStatus } = await isToolInWishlist(toolId);
          setInWishlist(wishlistStatus);
        }
      } catch (err) {
        console.error('Error loading tool:', err);
        setError('Failed to load tool details: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadToolData();
  }, [id, user]);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (!user) {
      // Redirect to login or show login modal
      navigate('/login', { state: { from: `/tool/${id}` } });
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(tool.id);
      } else {
        await addToWishlist(tool.id);
      }

      setInWishlist(!inWishlist);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Show error message to user
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

  // Navigate to previous image
  const prevImage = () => {
    if (tool?.images?.length > 0) {
      setActiveImageIndex((prev) =>
        prev === 0 ? tool.images.length - 1 : prev - 1
      );
    }
  };

  // Navigate to next image
  const nextImage = () => {
    if (tool?.images?.length > 0) {
      setActiveImageIndex((prev) =>
        prev === tool.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Start a conversation with the seller
  const contactSeller = () => {
    if (!user) {
      navigate('/login', { state: { from: `/tool/${id}` } });
      return;
    }

    setShowMessageModal(true);
  };

  // Function to handle offer submission
  const submitOffer = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/tool/${id}` } });
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setOfferError('Please enter a valid offer amount');
      return;
    }

    setSubmittingOffer(true);
    setOfferError(null);

    try {
      // Create a new message first
      const messageContent = `I'm interested in your ${tool.name}. Would you consider ${formatPrice(parseFloat(offerAmount))}?${offerMessage ? ' ' + offerMessage : ''}`;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: tool.seller_id,
          tool_id: tool.id,
          content: messageContent,
          message_type: 'offer'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create the offer record
      const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .insert({
          tool_id: tool.id,
          buyer_id: user.id,
          seller_id: tool.seller_id,
          amount: parseFloat(offerAmount),
          message_id: messageData.id
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Update the message with the offer_id
      await supabase
        .from('messages')
        .update({
          offer_id: offerData.id
        })
        .eq('id', messageData.id);

      // Close the modal and show success
      setShowOfferModal(false);
      alert('Your offer has been sent!');

      // Navigate to messages with this seller
      navigate('/messages', { state: { recipient: tool.seller_id, toolId: tool.id } });

    } catch (err) {
      console.error('Error submitting offer:', err);
      setOfferError('Failed to submit offer. Please try again.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Render the offer modal
  const renderOfferModal = () => {
    if (!showOfferModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Modal overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowOfferModal(false)}
        ></div>

        {/* Modal content */}
        <div className="relative w-full max-w-md px-4 py-6 bg-white rounded-lg shadow-lg z-10">
          {/* Close button */}
          <button
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"
            onClick={() => setShowOfferModal(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-xl font-medium text-stone-800 mb-4">Make an Offer</h2>

          {/* Tool info */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-stone-100 rounded overflow-hidden">
              <img
                src={tool.images?.[0] || '/api/placeholder/80/80'}
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3 overflow-hidden">
              <h3 className="font-medium text-stone-800 truncate">{tool.name}</h3>
              <p className="text-stone-600">{formatPrice(tool.current_price)}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); submitOffer(); }}>
            {/* Offer amount */}
            <div className="mb-4">
              <label className="block text-stone-700 font-medium mb-1">
                Your Offer
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {tool.current_price && (
                <p className="text-xs text-stone-500 mt-1">
                  Asking price: {formatPrice(tool.current_price)}
                </p>
              )}
            </div>

            {/* Optional message */}
            <div className="mb-4">
              <label className="block text-stone-700 font-medium mb-1">
                Add a Message (Optional)
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                placeholder="Tell the seller why you're making this offer..."
                rows={3}
              ></textarea>
            </div>

            {/* Error message */}
            {offerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
                {offerError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center justify-center font-medium"
              disabled={submittingOffer}
            >
              {submittingOffer ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending Offer...
                </>
              ) : (
                'Send Offer'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading tool details...</span>
          </div>
        </main>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg mb-2">Error Loading Tool</h3>
                <p>{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                onClick={() => navigate('/marketplace')}
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        </main>

      </div>
    );
  }

  // If no tool data, show not found state
  if (!tool) {
    return (
      <div className="bg-base min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg mb-2">Tool Not Found</h3>
                <p>The tool you're looking for couldn't be found. It may have been removed or the URL might be incorrect.</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
                onClick={() => navigate('/marketplace')}
              >
                Browse Available Tools
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main content when tool is loaded successfully
  return (
    <div className="bg-base min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <button
            className="flex items-center text-stone-600 hover:text-forest-700"
            onClick={() => navigate('/marketplace')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </button>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main image with error handling */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md relative">
              {tool.images && tool.images.length > 0 ? (
                <img
                  src={tool.images[activeImageIndex] || '/api/placeholder/400/300'}
                  alt={tool.name}
                  className="w-full h-96 object-contain"
                  onError={(e) => {
                    console.log("Image failed to load:", tool.images[activeImageIndex]);
                    e.target.onerror = null; // Prevent infinite error loop
                    e.target.src = '/api/placeholder/400/300'; // Fallback image
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-stone-100 flex items-center justify-center">
                  <span className="text-stone-400">No image available</span>
                </div>
              )}

              {/* Image navigation arrows */}
              {tool.images && tool.images.length > 1 && (
                <>
                  <button
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5 text-stone-700" />
                  </button>
                  <button
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5 text-stone-700" />
                  </button>
                </>
              )}

              {/* Verification badge */}
              {tool.is_verified && (
                <div className="absolute top-4 right-4 bg-forest-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>

            {/* Thumbnail images with error handling */}
            {tool.images && tool.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tool.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 ${index === activeImageIndex ? 'border-forest-700' : 'border-transparent'}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${tool.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/api/placeholder/80/80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Tool description */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-medium text-stone-800 mb-4">Description</h2>
              <p className="text-stone-600 whitespace-pre-line">{tool.description}</p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-medium text-stone-800 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.brand && (
                  <div>
                    <dt className="text-sm text-stone-500">Brand</dt>
                    <dd className="text-stone-800">{tool.brand}</dd>
                  </div>
                )}
                {tool.model && (
                  <div>
                    <dt className="text-sm text-stone-500">Model</dt>
                    <dd className="text-stone-800">{tool.model}</dd>
                  </div>
                )}
                {tool.condition && (
                  <div>
                    <dt className="text-sm text-stone-500">Condition</dt>
                    <dd className="text-stone-800">{tool.condition}</dd>
                  </div>
                )}
                {tool.age && (
                  <div>
                    <dt className="text-sm text-stone-500">Age</dt>
                    <dd className="text-stone-800">{tool.age}</dd>
                  </div>
                )}
                {tool.material && (
                  <div>
                    <dt className="text-sm text-stone-500">Material</dt>
                    <dd className="text-stone-800">{tool.material}</dd>
                  </div>
                )}
                {tool.dimensions && (
                  <div>
                    <dt className="text-sm text-stone-500">Dimensions</dt>
                    <dd className="text-stone-800">{tool.dimensions}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Pricing, seller info, actions */}
          <div className="space-y-4">
            {/* Main info card */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h1 className="text-2xl font-medium text-stone-800 mb-2">{tool.name}</h1>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-medium text-stone-800">
                    {formatPrice(tool.current_price)}
                  </span>
                  {tool.original_price && tool.original_price > tool.current_price && (
                    <span className="ml-2 text-sm text-stone-500 line-through">
                      {formatPrice(tool.original_price)}
                    </span>
                  )}
                </div>

                {tool.original_price && tool.original_price > tool.current_price && (
                  <span className="text-sm text-green-600">
                    You save {formatPrice(tool.original_price - tool.current_price)} ({Math.round((1 - tool.current_price / tool.original_price) * 100)}%)
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center mb-4">
                <MapPin className="h-4 w-4 text-stone-400 mr-2" />
                <span className="text-stone-600">{tool.location}</span>
              </div>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-stone-100 text-stone-800 text-xs px-2 py-1 rounded mr-2">
                  {tool.category}
                </span>
                {tool.subcategory && (
                  <span className="inline-block bg-stone-100 text-stone-800 text-xs px-2 py-1 rounded">
                    {tool.subcategory}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {/* Buy It Now button */}
                <button
                  className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center justify-center font-medium"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy It Now
                </button>

                {/* Make Offer button - only shown if seller allows offers */}
                {tool.allow_offers && (
                  <button
                    className="w-full py-3 bg-white border border-forest-300 text-forest-700 rounded-md hover:bg-forest-50 flex items-center justify-center font-medium"
                    onClick={() => setShowOfferModal(true)}
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Make Offer
                  </button>
                )}

                {/* Contact Seller button */}
                <button
                  className="w-full py-3 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 flex items-center justify-center font-medium"
                  onClick={contactSeller}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Seller
                </button>

                <button
                  className={`w-full py-3 rounded-md flex items-center justify-center font-medium ${inWishlist ? 'bg-forest-100 text-forest-700 border border-forest-300' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'}`}
                  onClick={toggleWishlist}
                >
                  <Heart className={`h-5 w-5 mr-2 ${inWishlist ? 'fill-forest-700' : ''}`} />
                  {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>

                <button
                  className="w-full py-3 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 flex items-center justify-center font-medium"
                  onClick={handleShare}
                >
                  <Share className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Seller info card with avatar error handling */}
            {tool.seller && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-lg font-medium text-stone-800 mb-4">About the Seller</h2>

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-stone-200 rounded-full overflow-hidden mr-3">
                    {tool.seller.avatar_url ? (
                      <img
                        src={tool.seller.avatar_url}
                        alt={`${tool.seller.username || 'Seller'}'s avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Avatar failed to load:", tool.seller.avatar_url);
                          e.target.onerror = null;
                          // Use first letter of username as fallback
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-stone-500 font-medium">${(tool.seller.username || tool.seller.full_name || 'S').charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500 font-medium">
                        {(tool.seller.username || tool.seller.full_name || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-stone-800">
                      {tool.seller.username || tool.seller.full_name || 'Anonymous Seller'}
                    </h3>

                    {tool.seller.rating && (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" fill="#EAB308" />
                        <span className="text-sm text-stone-600">
                          {tool.seller.rating.toFixed(1)} ({tool.seller.rating_count || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {tool.seller.location && (
                  <div className="flex items-center text-sm text-stone-600 mb-4">
                    <MapPin className="h-4 w-4 text-stone-400 mr-2" />
                    <span>{tool.seller.location}</span>
                  </div>
                )}

                <button
                  className="w-full py-2 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 text-sm"
                  onClick={() => navigate(`/profile/${tool.seller.id}`)}
                >
                  View Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Similar tools section with error handling */}
        {similarTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-medium text-stone-800 mb-6">Similar Tools</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarTools.map(similarTool => (
                <div key={similarTool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <a href={`/tool/${similarTool.id}`} className="block">
                    <div className="relative h-48">
                      <img
                        src={similarTool.images?.[0] || '/api/placeholder/300/200'}
                        alt={similarTool.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/api/placeholder/300/200';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-stone-800 mb-1">{similarTool.name}</h3>
                      <p className="text-stone-600 text-sm">{similarTool.condition}</p>
                      <div className="mt-2 text-stone-800 font-medium">
                        {formatPrice(similarTool.current_price)}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Message Modal */}
      {showMessageModal && tool.seller && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipient={tool.seller}
          toolId={tool.id}
          toolName={tool.name}
        />
      )}

      {/* Offer Modal */}
      {renderOfferModal()}
    </div>
  );
};

export default ToolDetailPage;