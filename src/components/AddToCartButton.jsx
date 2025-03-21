import React, { useState } from 'react';
import { ShoppingCart, Loader, Check, AlertCircle} from 'lucide-react';
import { useCart } from './CartContext';

const AddToCartButton = ({ tool, size = 'default', className = '', showIcon = true }) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState(null);
  
  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    setError(null);
    
    try {
      const success = await addItem(tool);
      
      if (success) {
        setIsAdded(true);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setIsAdded(false);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to add to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };
  
  // Button size classes
  const sizeClasses = {
    'small': 'px-3 py-1 text-xs',
    'default': 'px-4 py-2 text-sm',
    'large': 'px-6 py-3 text-base'
  };
  
  // Button state classes (styling)
  let buttonClasses = `rounded-md font-medium flex items-center justify-center transition-colors ${sizeClasses[size] || sizeClasses.default} ${className}`;
  
  if (isAdded) {
    buttonClasses += ' bg-green-600 hover:bg-green-700 text-white';
  } else if (error) {
    buttonClasses += ' bg-red-600 hover:bg-red-700 text-white';
  } else {
    buttonClasses += ' bg-forest-700 hover:bg-forest-800 text-white';
  }
  
  return (
    <button 
      onClick={handleAddToCart}
      className={buttonClasses}
      disabled={isAdding}
      aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
    >
      {isAdding ? (
        <>
          <Loader className={`animate-spin ${showIcon ? 'mr-2 h-4 w-4' : 'h-4 w-4'}`} />
          {!showIcon ? null : <span>Adding...</span>}
        </>
      ) : isAdded ? (
        <>
          <Check className={`${showIcon ? 'mr-2 h-4 w-4' : 'h-4 w-4'}`} />
          {!showIcon ? null : <span>Added to Cart</span>}
        </>
      ) : error ? (
        <>
          <AlertCircle className={`${showIcon ? 'mr-2 h-4 w-4' : 'h-4 w-4'}`} />
          {!showIcon ? null : <span>Try Again</span>}
        </>
      ) : (
        <>
          <ShoppingCart className={`${showIcon ? 'mr-2 h-4 w-4' : 'h-4 w-4'}`} />
          {!showIcon ? null : <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;