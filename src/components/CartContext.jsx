import React, { createContext, useContext, useReducer, useEffect, useState, } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  total: 0,
  subtotal: 0,
  count: 0,
  isLoading: true,
  error: null
};

// Action types
const actionTypes = {
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Helper to calculate totals
const calculateTotals = (items) => {
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // In a real application, you might calculate tax and shipping here
  const total = subtotal;

  return { count, subtotal, total };
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CART:
      return {
        ...state,
        items: action.payload,
        ...calculateTotals(action.payload),
        isLoading: false
      };

    case actionTypes.ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(item => item.toolId === action.payload.toolId);
      let newItems;

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity
        };
      } else {
        // New item, add to cart
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
        error: null
      };
    }

    case actionTypes.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.toolId !== action.payload);

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
        error: null
      };
    }

    case actionTypes.UPDATE_QUANTITY: {
      const { toolId, quantity } = action.payload;
      const newItems = state.items.map(item =>
        item.toolId === toolId ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
        error: null
      };
    }

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
        count: 0,
        subtotal: 0,
        total: 0,
        error: null
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Generate a session ID for guest users
  useEffect(() => {
    // Check for an existing session ID in localStorage
    const existingSessionId = localStorage.getItem('guestSessionId');

    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Generate a new session ID
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('guestSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load cart data from localStorage or database
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        if (user) {
          // Fetch user's cart from database
          const { data: cartData, error } = await supabase
            .from('carts')
            .select(`
    id,
    cart_items (
      id,
      tool_id,
      quantity,
      price,
      tool_name,
      tool_condition,
      tool_image_url
    )
  `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (error) throw error;

          if (cartData) {
            // Transform data for the cart state format
            const items = cartData.cart_items.map(item => ({
              id: item.id,
              toolId: item.tool_id,
              name: item.tool_name,
              price: item.price,
              quantity: item.quantity,
              condition: item.tool_condition,
              imageUrl: item.tool_image_url
            }));

            dispatch({ type: actionTypes.SET_CART, payload: items });
          } else {
            // No active cart found
            dispatch({ type: actionTypes.SET_CART, payload: [] });
          }
        } else if (sessionId) {
          // For guest users, load from localStorage
          const storedCart = localStorage.getItem(`cart_${sessionId}`);
          if (storedCart) {
            dispatch({ type: actionTypes.SET_CART, payload: JSON.parse(storedCart) });
          } else {
            dispatch({ type: actionTypes.SET_CART, payload: [] });
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Failed to load cart data' });
      }
    };

    if (user || sessionId) {
      loadCart();
    }
  }, [user, sessionId]);

  // Save cart to localStorage or database when it changes
  useEffect(() => {
    // Only save once cart is loaded
    if (state.isLoading) return;

    const saveCart = async () => {
      try {
        if (user) {
          // Save to database for logged-in user

          // First, find or create an active cart
          let cartId;
          const { data: existingCart, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

          if (cartError && cartError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw cartError;
          }

          if (existingCart) {
            cartId = existingCart.id;
          } else {
            // Create a new cart
            const { data: newCart, error: createError } = await supabase
              .from('carts')
              .insert({
                user_id: user.id,
                status: 'active',
                subtotal: state.subtotal,
                total: state.total
              })
              .select('id')
              .single();

            if (createError) throw createError;
            cartId = newCart.id;
          }

          // Delete existing cart items
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId);

          // Insert new cart items
          if (state.items.length > 0) {
            const cartItems = state.items.map(item => ({
              cart_id: cartId,
              tool_id: item.toolId,
              quantity: item.quantity,
              price: item.price,
              tool_name: item.name,
              tool_condition: item.condition,
              tool_image_url: item.imageUrl
            }));

            const { error: insertError } = await supabase
              .from('cart_items')
              .insert(cartItems);

            if (insertError) throw insertError;
          }

          // Update cart totals
          await supabase
            .from('carts')
            .update({
              subtotal: state.subtotal,
              total: state.total,
              updated_at: new Date().toISOString()
            })
            .eq('id', cartId);

        } else if (sessionId) {
          // Save to localStorage for guest users
          localStorage.setItem(`cart_${sessionId}`, JSON.stringify(state.items));
        }
      } catch (error) {
        console.error('Error saving cart:', error);
        // We don't dispatch an error here to avoid interrupting the user experience
      }
    };

    saveCart();
  }, [state.items, state.subtotal, state.total, user, sessionId]);

  // Add item to cart
  const addItem = async (tool, quantity = 1, options = {}) => {
    // Check if the tool is available (you might want to verify with the server)
    try {
      // For production, you would want to check the current inventory
      // Here's a simplified version
      const { data: toolData, error } = await supabase
        .from('tools')
        .select('id, name, current_price, condition, images, is_sold')
        .eq('id', tool.id)
        .single();

      if (error) throw error;

      if (toolData.is_sold) {
        dispatch({
          type: actionTypes.SET_ERROR,
          payload: 'This tool is no longer available.'
        });
        return;
      }

      // Add to cart
      dispatch({
        type: actionTypes.ADD_ITEM,
        payload: {
          id: null, // Will be set by the database
          toolId: tool.id,
          name: tool.name,
          price: options.offerPrice || tool.current_price,
          quantity: quantity,
          condition: tool.condition,
          imageUrl: tool.images?.[0] || '',
          // Track if this was from an accepted offer
          fromOffer: options.offerId || null
        }
      });

      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: 'Failed to add item to cart. Please try again.'
      });
      return false;
    }
  };

  // Remove item from cart
  const removeItem = (toolId) => {
    dispatch({ type: actionTypes.REMOVE_ITEM, payload: toolId });
  };

  // Update item quantity
  const updateQuantity = (toolId, quantity) => {
    // Ensure quantity is at least 1
    const validQuantity = Math.max(1, quantity);
    dispatch({
      type: actionTypes.UPDATE_QUANTITY,
      payload: { toolId, quantity: validQuantity }
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
  };

  // Merge guest cart with user cart on login
  const mergeWithUserCart = async () => {
    if (!user || !sessionId) return;

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // Get guest cart from localStorage
      const guestCartJson = localStorage.getItem(`cart_${sessionId}`);
      if (!guestCartJson) {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return; // No guest cart to merge
      }

      const guestCartItems = JSON.parse(guestCartJson);
      if (guestCartItems.length === 0) {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return; // Empty guest cart
      }

      // Get the user's current cart
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items (
            id,
            tool_id,
            quantity,
            price,
            tool_name,
            tool_condition,
            tool_image_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // Handle cart creation if needed
      let cartId;
      let currentItems = [];

      if (cartError && cartError.code === 'PGRST116') {
        // No cart exists, create one
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            status: 'active',
            subtotal: 0,
            total: 0
          })
          .select('id')
          .single();

        if (createError) throw createError;
        cartId = newCart.id;
      } else if (cartError) {
        throw cartError;
      } else {
        // Cart exists
        cartId = cartData.id;
        currentItems = cartData.cart_items.map(item => ({
          id: item.id,
          toolId: item.tool_id,
          quantity: item.quantity,
          price: item.price,
          name: item.tool_name,
          condition: item.tool_condition,
          imageUrl: item.tool_image_url
        }));
      }

      // Merge items
      const mergedItems = [...currentItems];

      for (const guestItem of guestCartItems) {
        const existingIndex = mergedItems.findIndex(item => item.toolId === guestItem.toolId);

        if (existingIndex >= 0) {
          // Update quantity if item exists
          mergedItems[existingIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          mergedItems.push(guestItem);
        }
      }

      // Update cart in state
      dispatch({ type: actionTypes.SET_CART, payload: mergedItems });

      // Clear guest cart
      localStorage.removeItem(`cart_${sessionId}`);
    } catch (error) {
      console.error('Error merging carts:', error);
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: 'Failed to merge cart data. Please try again.'
      });
    }
  };

  // When a user logs in, merge their guest cart with their account cart
  useEffect(() => {
    if (user && sessionId && !state.isLoading) {
      mergeWithUserCart();
    }
  }, [user, sessionId]);

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};