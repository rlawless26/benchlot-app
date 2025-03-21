import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader, CheckCircle, Info } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { supabase } from '../supabaseClient';

// This is a placeholder for Stripe integration
// In a real implementation, you would import components from @stripe/react-stripe-js
const PlaceholderStripeForm = () => {
  return (
    <div className="border border-stone-300 rounded-lg p-6">
      <div className="text-center mb-4">
        <Info className="h-6 w-6 text-blue-500 mx-auto" />
        <p className="mt-2 text-stone-600">
          In production, this would be replaced with Stripe Elements for secure payment collection
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">Card number</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Expiration</label>
            <input
              type="text"
              placeholder="MM / YY"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">CVC</label>
            <input
              type="text"
              placeholder="123"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { items, subtotal, total, count, isLoading: cartLoading, error: cartError, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  
  const navigate = useNavigate();
  
  // Load user info if logged in
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUser(user);
          
          // Get user profile info
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            // Pre-fill form with user info
            setFormData({
              email: user.email || '',
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              zipCode: profile.zip_code || '',
              phone: profile.phone || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserInfo();
  }, []);
  
  // Format price to display as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    try {
      setError(null);
      setIsProcessing(true);
      
      // In a real implementation, you would:
      // 1. Create a payment intent with Stripe
      // 2. Process the payment
      // 3. Create the order in your database
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order in the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser?.id || null,
          amount_subtotal: subtotal,
          amount_total: total,
          status: 'pending',
          shipping_address: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            phone: formData.phone
          },
          contact_email: formData.email
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        tool_id: item.toolId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        condition: item.condition,
        image_url: item.imageUrl,
        platform_fee_amount: item.price * 0.05, // 5% platform fee
        seller_amount: item.price * 0.92 // 92% to seller (after platform fee and processing)
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Order created successfully
      setOrderId(order.id);
      setOrderComplete(true);
      
      // Clear the cart
      clearCart();
      
    } catch (error) {
      console.error('Error processing order:', error);
      setError('Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartLoading, items, navigate, orderComplete]);
  
  if (cartLoading || isLoading) {
    return (
      <div className="bg-base min-h-screen">
       
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (cartError || error) {
    return (
      <div className="bg-base min-h-screen">
      
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{cartError || error}</span>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-stone-600 hover:text-forest-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Return to Cart
          </button>
        </div>
      </div>
    );
  }
  
  // Order complete screen
  if (orderComplete) {
    return (
      <div className="bg-base min-h-screen">
  
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-medium mb-2">Thank You For Your Order!</h2>
            <p className="text-stone-600 mb-6">
              Your order #{orderId} has been placed successfully.
            </p>
            <p className="text-stone-600 mb-8">
              You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-base min-h-screen">
     <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-medium mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit}>
                {/* Contact Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                  <PlaceholderStripeForm />
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-stone-600 hover:text-forest-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Return to Cart
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium flex items-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              {/* Items List */}
              <div className="divide-y divide-stone-200 mb-4">
                {items.map((item) => (
                  <div key={item.toolId} className="py-3 flex">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-stone-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/api/placeholder/48/48';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          No image
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-stone-800">{item.name}</h3>
                        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {item.condition} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Shipping</span>
                  <span className="text-stone-600">Calculated by seller</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Tax</span>
                  <span className="text-stone-600">$0.00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Platform Fee (5%)</span>
                  <span className="text-stone-600">{formatPrice(subtotal * 0.05)}</span>
                </div>
                
                <div className="border-t border-stone-200 pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mb-4">
                By completing your purchase, you agree to Benchlot's <a href="/terms" className="text-forest-700 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-forest-700 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;