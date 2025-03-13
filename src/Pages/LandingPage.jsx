import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  ChartSpline, 
  LayoutList, 
  BadgeCheck, 
  Tool,
  Check,
  Star
} from 'lucide-react';
import { supabase, fetchFeaturedTools } from '../supabaseClient';

// Import Header component
import Header from '../header';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [featuredTools, setFeaturedTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch featured tools when component mounts
    const loadFeaturedTools = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await fetchFeaturedTools(3);
        
        if (error) throw error;
        
        setFeaturedTools(data || []);
      } catch (err) {
        console.error('Error fetching featured tools:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedTools();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email,
            signed_up_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: 'Thanks for joining! We\'ll keep you updated.'
      });
      setEmail('');
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message === 'duplicate key value violates unique constraint' 
          ? 'This email is already on our waitlist!'
          : 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to calculate discount percentage
  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    return Math.round((1 - currentPrice / originalPrice) * 100);
  };

  // Function to get the first image from the images array or return placeholder
  const getDisplayImage = (tool) => {
    if (tool.images && tool.images.length > 0) {
      return tool.images[0];
    }
    return "/api/placeholder/250/180";
  };

  // Render the featured tools section
  const renderFeaturedTools = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-700"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600">
          <p>Unable to load featured tools. Please try again later.</p>
        </div>
      );
    }

    if (featuredTools.length === 0) {
      return (
        <div className="text-center py-8 text-stone-600">
          <p>No featured tools available at the moment. Check back soon!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredTools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
            <img 
              src={getDisplayImage(tool)} 
              alt={tool.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {tool.is_verified && (
                  <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    <Check className="h-3 w-3 mr-1" /> Verified
                  </span>
                )}
                <span className="inline-flex items-center bg-forest-100 text-forest-800 text-xs px-2 py-1 rounded-full">
                  {tool.condition}
                </span>
              </div>
              <h3 className="text-lg font-medium mb-2">{tool.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-forest-700">${tool.current_price}</span>
                {tool.original_price && calculateDiscount(tool.original_price, tool.current_price) && (
                  <>
                    <span className="text-sm text-stone-500 line-through">${tool.original_price}</span>
                    <span className="text-sm text-green-600">
                      {calculateDiscount(tool.original_price, tool.current_price)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-stone-600 text-sm mb-4">{tool.location}</p>
              {tool.seller && (
                <p className="text-stone-500 text-xs mb-4">
                  Seller: {tool.seller.username || tool.seller.full_name}
                </p>
              )}
              <button className="w-full py-2 border border-forest-700 text-forest-700 rounded hover:bg-forest-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-base">
      {/* Header Component */}
      <Header />
      
      {/* Hero Section with Form */}
      <section className="py-20 bg-base">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 text-stone-800">
            Buy and sell new and used woodworking tools
            </h1>
            <p className="text-xl text-stone-600 mb-8">
            The marketplace for woodworkers to buy and sell new, used, and vintage woodworking tools.</p>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-medium mb-2">Join Benchlot Today</h3>
                <p className="text-stone-600 text-sm">We're building the new standard for buying and selling tools</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining...' : 'Sign Up'}
                  </button>
                </div>

                {submitStatus.message && (
                  <div className={`mt-4 p-3 rounded-md text-center text-sm ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
      <section className="section how-it-works-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-4 text-stone-800">How Benchlot Works</h2>
            <p className="text-stone-600">The trusted marketplace for woodworkers and makers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-white shadow-md w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BadgeCheck className="h-8 w-8 text-forest-700" />
              </div>
              <h3 className="text-xl font-medium mb-2">Verified Tools</h3>
              <p className="text-stone-600">Every listing is authenticated by our experts to ensure quality and value.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white shadow-md w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-forest-700" />
              </div>
              <h3 className="text-xl font-medium mb-2">Local Community</h3>
              <p className="text-stone-600">Connect with trusted buyers and sellers in your local maker community.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white shadow-md w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartSpline className="h-8 w-8 text-forest-700" />
              </div>
              <h3 className="text-xl font-medium mb-2">Fair Pricing</h3>
              <p className="text-stone-600">Market data and transparency ensures you get the best value.</p>
            </div>
          </div>
        </div>
        </section>
      </section>

      {/* Featured Listings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-4 text-stone-800">Featured Tools</h2>
            <p className="text-stone-600">Quality tools from verified sellers in the Boston area</p>
          </div>
          
          {renderFeaturedTools()}
          
          <div className="text-center mt-10">
            <button className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-md transition-colors inline-flex items-center">
              Join Waitlist For Early Access
            </button>
          </div>
        </div>
      </section>
      
      {/* 
      
      Trust Section 
      <section className="py-20 bg-base">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-4 text-stone-800">Trusted by Boston's Maker Community</h2>
            <p className="text-stone-600">We've partnered with the region's leading makerspaces and craft institutions</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Artisans Asylum', 'The Maker Guild', 'Boston Woodworkers', 'Makers Junction'].map((space) => (
              <div key={space} className="bg-white rounded-lg p-6 text-center shadow-md">
                <p className="font-medium text-stone-700">{space}</p>
              </div>
            ))}
          </div>
        </div>
      </section>  
      
      */}
      
      {/* CTA Section */}
      <section className="py-20 bg-base">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-medium mb-4 text-stone-800">Ready to join the community?</h2>
            <p className="text-stone-600 mb-8">Be among the first to access our marketplace when we launch</p>
            
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>

              {submitStatus.message && (
                <div className={`mt-4 p-3 rounded-md text-center text-sm ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {submitStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-serif text-lg mb-4">Benchlot</h3>
              <p className="text-sm mb-6">
                The trusted marketplace for tools
              </p>
              <p className="text-xs text-stone-400">© 2025 Benchlot. All rights reserved.</p>
            </div>
            <div>
              <h3 className="text-white font-serif text-lg mb-4">Contact</h3>
              <p className="text-sm mb-2">hello@benchlot.com</p>
              <p className="text-sm">781-960-3998</p>
            </div>
            <div>
              <h3 className="text-white font-serif text-lg mb-4">Location</h3>
              <p className="text-sm">Greater Boston Area</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-white hover:text-forest-400">Twitter</a>
                <a href="#" className="text-white hover:text-forest-400">Instagram</a>
                <a href="#" className="text-white hover:text-forest-400">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;