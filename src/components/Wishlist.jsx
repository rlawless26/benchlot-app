import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader, AlertCircle, ShoppingBag } from 'lucide-react';
import { fetchWishlist, removeFromWishlist, getCurrentUser } from '../supabaseClient';
import { Skeleton } from './ui/loading-skeleton';
import WishlistToolCard from './WishlistToolCard';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: user } = await getCurrentUser();
        
        if (!user) {
          navigate('/login', { state: { from: '/wishlist' } });
          return;
        }
        
        // Fetch wishlist items
        const { data, error } = await fetchWishlist();
        
        if (error) throw error;
        
        setWishlistItems(data || []);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Failed to load your saved tools. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, [navigate]);

  const handleRemoveFromWishlist = async (toolId) => {
    try {
      const { error } = await removeFromWishlist(toolId);
      
      if (error) throw error;
      
      // Update the local state by removing the item
      const updatedItems = wishlistItems.filter(item => item.id !== toolId);
      setWishlistItems(updatedItems);
      
      // If we're on a page that would now be empty, go to the previous page
      const totalPages = Math.ceil(updatedItems.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist. Please try again.');
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

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
      
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-serif mb-6">Saved Tools</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif">Saved Tools</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-lg border border-stone-200">
            <Heart className="h-12 w-12 mx-auto text-stone-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No saved tools yet</h2>
            <p className="text-stone-500 mb-6">When you save tools you like, they'll appear here</p>
            <Link 
              to="/marketplace"
              className="inline-flex items-center px-4 py-2 bg-forest-700 text-white rounded hover:bg-forest-800"
            >
              Browse Tools
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(tool => (
                  <WishlistToolCard 
                    key={tool.id} 
                    tool={tool} 
                    onRemove={handleRemoveFromWishlist} 
                  />
                ))}
            </div>
            
            {/* Pagination */}
            {wishlistItems.length > itemsPerPage && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from(
                    { length: Math.ceil(wishlistItems.length / itemsPerPage) },
                    (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === i + 1
                            ? 'bg-forest-700 text-white border-forest-700'
                            : 'border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                  
                  <button
                    onClick={() => 
                      setCurrentPage(prev => 
                        Math.min(prev + 1, Math.ceil(wishlistItems.length / itemsPerPage))
                      )
                    }
                    disabled={currentPage === Math.ceil(wishlistItems.length / itemsPerPage)}
                    className="px-3 py-1 border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Wishlist;