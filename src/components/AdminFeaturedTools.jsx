import React, { useState, useEffect } from 'react';
import { 
  fetchTools, 
  getCurrentUser,
  updateTool 
} from '../supabaseClient';
import { 
  Check, 
  X, 
  Star, 
  Search, 
  Filter,
  Loader
} from 'lucide-react';

const AdminFeaturedTools = () => {
  const [tools, setTools] = useState([]);
  const [featuredTools, setFeaturedTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    condition: [],
    category: 'All Categories',
    verified: false
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: user } = await getCurrentUser();
      // Determine admin status (implement based on your auth system)
      // For example, you might check a role field or a specific user ID
      setIsAdmin(user?.profile?.role === 'admin' || user?.id === 'your-admin-id-here');
      
      if (!user || !isAdmin) {
        setError('You do not have permission to access this page');
      }
    };
    
    checkAdmin();
  }, []);

  // Fetch tools and featured tools on mount
  useEffect(() => {
    const loadTools = async () => {
      if (!isAdmin) return;
      
      try {
        setIsLoading(true);
        
        // Fetch featured tools
        const { data: featured, error: featuredError } = await fetchTools({ 
          featured: true,
          limit: 50
        });
        
        if (featuredError) throw featuredError;
        
        setFeaturedTools(featured || []);
        
        // Fetch tools for potential featuring
        const { data: allTools, error: toolsError } = await fetchTools({
          verified: true,
          is_sold: false,
          limit: 50,
          sort: 'newest'
        });
        
        if (toolsError) throw toolsError;
        
        setTools(allTools || []);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTools();
  }, [isAdmin]);

  // Toggle feature status for a tool
  const toggleFeatureStatus = async (tool) => {
    try {
      const newFeaturedStatus = !tool.is_featured;
      
      // Update in database
      const { data, error } = await updateTool(tool.id, {
        is_featured: newFeaturedStatus
      });
      
      if (error) throw error;
      
      // Update UI
      if (newFeaturedStatus) {
        // Add to featured tools
        setFeaturedTools(prev => [...prev, { ...tool, is_featured: true }]);
      } else {
        // Remove from featured tools
        setFeaturedTools(prev => prev.filter(t => t.id !== tool.id));
      }
      
      // Update in tools list
      setTools(prev => prev.map(t => 
        t.id === tool.id ? { ...t, is_featured: newFeaturedStatus } : t
      ));
    } catch (err) {
      console.error('Error updating feature status:', err);
      alert(`Failed to update: ${err.message}`);
    }
  };

  // Filter tools based on search and filters
  const filteredTools = tools.filter(tool => {
    // Filter by search term
    const matchesSearch = 
      !searchTerm || 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by condition
    const matchesCondition = 
      filters.condition.length === 0 || 
      filters.condition.includes(tool.condition);
    
    // Filter by category
    const matchesCategory = 
      filters.category === 'All Categories' || 
      tool.category === filters.category;
    
    // Filter by verification status
    const matchesVerification = 
      !filters.verified || 
      tool.is_verified;
    
    return matchesSearch && matchesCondition && matchesCategory && matchesVerification;
  });

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4">You do not have permission to access this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-forest-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Featured Tools</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently Featured Tools ({featuredTools.length})</h2>
        {featuredTools.length === 0 ? (
          <p className="text-stone-500">No tools are currently featured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map(tool => (
              <div key={tool.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="aspect-w-16 aspect-h-9 bg-stone-100">
                  <img 
                    src={tool.images?.[0] || "/api/placeholder/300/200"} 
                    alt={tool.name}
                    className="object-cover w-full h-40"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{tool.name}</h3>
                      <p className="text-sm text-stone-500">${tool.current_price} • {tool.condition}</p>
                    </div>
                    <button 
                      onClick={() => toggleFeatureStatus(tool)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Remove from featured"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Tools to Feature</h2>
        
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full px-4 py-2 pr-10 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-stone-400" size={20} />
          </div>
          
          <select 
            className="border rounded-md px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="All Categories">All Categories</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Hand Tools">Hand Tools</option>
            <option value="Workshop Equipment">Workshop Equipment</option>
            <option value="Machinery">Machinery</option>
          </select>
          
          <button 
            className={`px-4 py-2 border rounded-md flex items-center gap-2 ${
              filters.verified ? 'bg-green-50 border-green-200 text-green-700' : ''
            }`}
            onClick={() => setFilters(prev => ({ ...prev, verified: !prev.verified }))}
          >
            <Check size={18} />
            Verified Only
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools
            .filter(tool => !tool.is_featured)
            .map(tool => (
            <div key={tool.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="aspect-w-16 aspect-h-9 bg-stone-100">
                <img 
                  src={tool.images?.[0] || "/api/placeholder/300/200"} 
                  alt={tool.name}
                  className="object-cover w-full h-40"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{tool.name}</h3>
                    <p className="text-sm text-stone-500">${tool.current_price} • {tool.condition}</p>
                    <div className="flex items-center mt-2">
                      {tool.is_verified && (
                        <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                          <Check size={14} className="mr-1" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFeatureStatus(tool)}
                    className="p-2 text-forest-600 hover:bg-forest-50 rounded-full"
                    title="Add to featured"
                  >
                    <Star size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTools.filter(tool => !tool.is_featured).length === 0 && (
            <div className="col-span-full text-center py-8 text-stone-500">
              No matching tools found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturedTools;