import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, AlertCircle, Loader, ShoppingBag } from 'lucide-react';
import { useCart } from '../components/CartContext';

const CartPage = () => {
  const { items, subtotal, total, count, isLoading, error, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  // Format price to display as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  if (isLoading) {
    return (
      <div className="bg-base min-h-screen">
      
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading your cart...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-base min-h-screen">
      
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-stone-600 hover:text-forest-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="bg-base min-h-screen">
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-stone-400 mb-4" />
            <h2 className="text-2xl font-serif font-medium mb-2">Your cart is empty</h2>
            <p className="text-stone-600 mb-6">Looks like you haven't added any tools to your cart yet.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
            >
              Browse Tools
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-base min-h-screen">
     
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-medium mb-6">Your Cart ({count} {count === 1 ? 'item' : 'items'})</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-stone-200 hidden md:grid md:grid-cols-7 text-sm font-medium text-stone-600">
                <div className="col-span-3">Product</div>
                <div className="text-center">Condition</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Total</div>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y divide-stone-200">
                {items.map((item) => (
                  <div key={item.toolId} className="p-6">
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex mb-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-md overflow-hidden bg-stone-100 flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/80/80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              No image
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-stone-800">{item.name}</h3>
                          <p className="text-stone-500 text-sm">{item.condition}</p>
                          <div className="text-forest-700 font-medium mt-1">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center">
                          <label className="text-sm text-stone-600 mr-2">Qty:</label>
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.toolId, parseInt(e.target.value))}
                            className="border border-stone-300 rounded-md px-2 py-1 text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Total */}
                        <div className="text-right">
                          <div className="text-sm text-stone-600">Total:</div>
                          <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.toolId)}
                          className="ml-4 text-red-600 hover:text-red-800"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-7 md:gap-4 md:items-center">
                      {/* Product */}
                      <div className="col-span-3 flex items-center">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/64/64';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              No image
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="ml-4">
                          <h3 className="font-medium text-stone-800">{item.name}</h3>
                          <button
                            onClick={() => removeItem(item.toolId)}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center mt-1"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Condition */}
                      <div className="text-center text-stone-600">
                        {item.condition}
                      </div>
                      
                      {/* Price */}
                      <div className="text-center font-medium">
                        {formatPrice(item.price)}
                      </div>
                      
                      {/* Quantity */}
                      <div className="text-center">
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.toolId, parseInt(e.target.value))}
                          className="border border-stone-300 rounded-md px-2 py-1"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Total */}
                      <div className="text-center font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Continue Shopping */}
              <div className="border-t border-stone-200 p-6">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="flex items-center text-stone-600 hover:text-forest-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Shipping</span>
                  <span className="text-stone-600">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-600">Tax</span>
                  <span className="text-stone-600">Calculated at checkout</span>
                </div>
                
                <div className="border-t border-stone-200 pt-3 flex justify-between font-medium">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-forest-700 text-white rounded-md hover:bg-forest-800 font-medium"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-stone-500 mt-4 text-center">
                Shipping, taxes, and discounts will be calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;