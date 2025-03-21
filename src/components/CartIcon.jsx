import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

const CartIcon = () => {
  const { count } = useCart();
  
  return (
    <Link 
      to="/cart" 
      className="relative flex items-center text-stone-700 hover:text-forest-700"
      aria-label={`Shopping cart with ${count} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs text-white bg-forest-700 rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;