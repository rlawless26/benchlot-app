import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Header from '../header';

const MyListings = () => {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }
      
      // Fetch tools for the current user (seller)
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (toolId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const { error } = await supabase
          .from('tools')
          .delete()
          .eq('id', toolId);
          
        if (error) throw error;
        
        // Remove the deleted tool from state
        setTools(tools.filter(tool => tool.id !== toolId));
      } catch (error) {
        console.error('Error deleting listing:', error);
        setError('Failed to delete listing. Please try again.');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Determine status label based on existing fields
  const getStatusLabel = (tool) => {
    if (tool.is_sold) return { label: 'Sold', className: 'bg-blue-500' };
    if (tool.is_verified) return { label: 'Verified', className: 'bg-green-500' };
    if (tool.is_featured) return { label: 'Featured', className: 'bg-purple-500' };
    return { label: 'Active', className: 'bg-green-500' };
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-serif mb-6">My Listings</h1>
          <div className="text-center py-12">Loading your listings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif">My Listings</h1>
          <button 
            onClick={() => navigate('/listtool')}
            className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            List a Tool
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {tools.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-lg border border-stone-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-stone-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-medium mb-2">No listings yet</h2>
            <p className="text-stone-500 mb-6">When you list tools for sale, they'll appear here</p>
            <button 
              onClick={() => navigate('/listtool')}
              className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              List a Tool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => {
              const status = getStatusLabel(tool);
              
              return (
                <div key={tool.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="h-48 bg-stone-200 relative">
                    {tool.images && tool.images[0] ? (
                      <img 
                        src={tool.images[0]} 
                        alt={tool.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        No image
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full text-white ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{tool.name}</h3>
                      <div className="text-xl font-semibold text-forest-700">
                        {formatPrice(tool.current_price)}
                      </div>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">
                      {tool.category} • {tool.condition}
                      {tool.brand && ` • ${tool.brand}`}
                    </p>
                    {tool.description && (
                      <p className="text-sm mt-2 text-stone-600 line-clamp-2">
                        {tool.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t p-4 flex justify-between">
                  <Link 
                        to={`/tools/${tool.id}`}
                        className="text-stone-600 hover:text-forest-700"
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </Link>
                    
                    <div className="border-t p-4 flex justify-between">
                      <Link 
                        to={`/listtool?id=${tool.id}`}
                        className="text-stone-600 hover:text-forest-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      
                      <button 
                        onClick={() => handleDeleteListing(tool.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyListings;